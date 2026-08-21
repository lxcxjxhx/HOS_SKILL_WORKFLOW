/**
 * Python Bridge: Node.js ↔ Python IPC for build123d execution
 *
 * Manages Python subprocess execution, code injection,
 * and result parsing.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getConfig } from "../utils/config.js";
import { logger } from "../utils/logging.js";

const MODULE = "PythonBridge";

export interface PythonExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  /** Parsed volume if available */
  volume?: number;
  /** Parsed surface area if available */
  surfaceArea?: number;
  /** Generated file paths */
  files: string[];
}

/**
 * Execute Python code with build123d
 */
export async function executePythonCode(
  code: string,
  outputDir: string,
  formats: string[] = ["step"],
  timeoutMs?: number,
): Promise<PythonExecutionResult> {
  const config = getConfig();
  const timeout = timeoutMs ?? config.executionTimeout;

  // Write the Python code to a temp file
  const scriptPath = join(config.workDir, `cad_exec_${Date.now()}.py`);
  writeFileSync(scriptPath, code, "utf-8");
  logger.debug(MODULE, `Wrote Python script: ${scriptPath}`);

  // Build the wrapper that handles export
  const wrapperCode = buildExportWrapper(scriptPath, outputDir, formats);
  const wrapperPath = join(config.workDir, `cad_wrapper_${Date.now()}.py`);
  writeFileSync(wrapperPath, wrapperCode, "utf-8");

  return new Promise((resolve) => {
    const startTime = Date.now();
    const proc: ChildProcess = spawn(config.pythonPath, [wrapperPath], {
      cwd: config.workDir,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const files: string[] = [];

    proc.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      // Track file creation events from Python
      const fileMatch = text.match(/\[FILE\](.+?)\[\/FILE\]/g);
      if (fileMatch) {
        for (const fm of fileMatch) {
          const path = fm.replace(/\[FILE\]|\[\/FILE\]/g, "").trim();
          if (existsSync(path)) files.push(path);
        }
      }
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    const timer = setTimeout(() => {
      proc.kill("SIGTERM");
      resolve({
        success: false,
        stdout,
        stderr: stderr + "\n[TIMEOUT] Execution timed out after " + timeout + "ms",
        exitCode: -1,
        files,
      });
    }, timeout);

    proc.on("close", (code) => {
      clearTimeout(timer);
      const elapsed = Date.now() - startTime;
      logger.info(MODULE, `Python execution completed in ${elapsed}ms (exit=${code})`);

      // Parse volume and area from stdout
      const volumeMatch = stdout.match(/Volume:\s*([\d.]+)/);
      const areaMatch = stdout.match(/Surface area:\s*([\d.]+)/);

      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code ?? -1,
        volume: volumeMatch ? parseFloat(volumeMatch[1]) : undefined,
        surfaceArea: areaMatch ? parseFloat(areaMatch[1]) : undefined,
        files,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      logger.error(MODULE, `Failed to spawn Python process: ${err.message}`);
      resolve({
        success: false,
        stdout,
        stderr: stderr + `\n[ERROR] ${err.message}`,
        exitCode: -1,
        files,
      });
    });
  });
}

/**
 * Build a Python wrapper that imports the generated model
 * and exports it in requested formats
 */
function buildExportWrapper(
  modelScriptPath: string,
  outputDir: string,
  formats: string[],
): string {
  const modelDir = outputDir.replace(/\\/g, "\\\\");
  const scriptDir = modelScriptPath.replace(/\\/g, "\\\\");

  return `
import sys
import os

# Add model script directory to path
sys.path.insert(0, r"${scriptDir.replace(/\\/g, "\\\\")}")
os.makedirs(r"${modelDir}", exist_ok=True)

# Import the model builder
from build123d import *
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("cad_model", r"${modelScriptPath.replace(/\\/g, "\\\\")}")
mod = module_from_spec(spec)
spec.loader.exec_module(mod)

# Build the model
part = mod.build_model()
print(f"Volume: {part.volume:.2f} mm³")
print(f"Surface area: {part.area:.2f} mm²")
bb = part.bounding_box()
print(f"Bounding box: {bb.size.X:.2f} x {bb.size.Y:.2f} x {bb.size.Z:.2f} mm")

export_formats = ${JSON.stringify(formats)}
output_base = r"${join(outputDir, "model").replace(/\\/g, "\\\\")}"

for fmt in export_formats:
    try:
        if fmt == "step":
            path = output_base + ".step"
            export_step(part, path)
        elif fmt == "stl":
            path = output_base + ".stl"
            export_stl(part, path)
        elif fmt == "3mf":
            path = output_base + ".3mf"
            export_3mf(part, path)
        elif fmt == "glb":
            path = output_base + ".glb"
            export_gltf(part, path, export_type="glb")
        elif fmt == "dxf":
            path = output_base + ".dxf"
            # DXF export for 2D profiles
            with BuildSketch(Plane.XY) as sketch:
                add(part.faces().sort_by(Axis.Z).first)
            export_dxf(sketch, path)
        elif fmt == "stp":
            path = output_base + ".stp"
            export_step(part, path)
        else:
            print(f"[WARN] Unsupported format: {fmt}")
            continue
        print(f"[FILE]{path}[/FILE]")
        print(f"Exported {fmt}: {path}")
    except Exception as e:
        print(f"[ERROR] Failed to export {fmt}: {e}", file=sys.stderr)

print("\\nDone.")
`;
}

/**
 * Quick check if Python + build123d are available
 */
export async function checkPythonEnvironment(): Promise<{
  pythonAvailable: boolean;
  build123dAvailable: boolean;
  pythonVersion?: string;
  build123dVersion?: string;
}> {
  const config = getConfig();
  const result = await new Promise<{
    pythonAvailable: boolean;
    build123dAvailable: boolean;
    pythonVersion?: string;
    build123dVersion?: string;
  }>((resolve) => {
    const proc = spawn(config.pythonPath, [
      "-c",
      `import sys; print(f"Python {sys.version}")
try:
    import build123d
    print(f"build123d {build123d.__version__}")
except ImportError:
    print("build123d not installed")
`,
    ], { stdio: ["pipe", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (c: Buffer) => (stdout += c.toString()));
    proc.stderr?.on("data", (c: Buffer) => (stderr += c.toString()));

    proc.on("close", () => {
      const pyVer = stdout.match(/Python ([\d.]+)/)?.[1];
      const bdVer = stdout.match(/build123d ([\d.]+)/)?.[1];
      resolve({
        pythonAvailable: !!pyVer,
        build123dAvailable: !!bdVer,
        pythonVersion: pyVer,
        build123dVersion: bdVer,
      });
    });

    proc.on("error", () => {
      resolve({
        pythonAvailable: false,
        build123dAvailable: false,
      });
    });
  });

  logger.info(MODULE, "Environment check", result);
  return result;
}
