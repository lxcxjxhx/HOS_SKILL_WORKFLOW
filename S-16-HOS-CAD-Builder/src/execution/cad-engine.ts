/**
 * CAD Engine: Orchestrates the full generation pipeline
 *
 * Manages the flow from prompt → brief → operations → code → execution → result
 */

import type { CADBrief, GeoOperation, CADResult, ExportFormat } from "../types.js";
import { specPlanner } from "../planners/spec-planner.js";
import { geoArchitect } from "../planners/geo-architect.js";
import { codeGenerator } from "../planners/code-generator.js";
import { executePythonCode } from "./python-bridge.js";
import { getConfig } from "../utils/config.js";
import { logger } from "../utils/logging.js";

const MODULE = "CADEngine";

export interface GenerateOptions {
  prompt: string;
  formats?: ExportFormat[];
  outputName?: string;
}

/**
 * Full CAD generation pipeline: prompt → 3D model files
 */
export async function generateCAD(options: GenerateOptions): Promise<CADResult> {
  const { prompt, formats = ["step"], outputName } = options;
  const config = getConfig();

  logger.info(MODULE, `Starting generation pipeline for: "${prompt.substring(0, 60)}..."`);

  // Step 1: Spec Planning
  logger.info(MODULE, "Step 1/4: Spec Planning");
  const brief: CADBrief = await specPlanner(prompt);
  brief.name = outputName ?? brief.name;
  logger.info(MODULE, `Brief: shape=${brief.shape}, features=${brief.features.length}`);

  // Step 2: Geometric Architecture
  logger.info(MODULE, "Step 2/4: Geometric Architecture");
  const operations: GeoOperation[] = await geoArchitect(brief);
  logger.info(MODULE, `Generated ${operations.length} operations`);

  // Step 3: Code Generation
  logger.info(MODULE, "Step 3/4: Code Generation");
  const pythonCode: string = await codeGenerator(operations, brief);
  logger.info(MODULE, `Generated ${pythonCode.length} chars of Python code`);

  // Step 4: Execution
  logger.info(MODULE, "Step 4/4: Execution");
  const outputDir = config.outputDir;
  const execResult = await executePythonCode(pythonCode, outputDir, formats);

  if (!execResult.success) {
    logger.error(MODULE, `Execution failed: ${execResult.stderr}`);
    return {
      pythonCode,
      log: `Execution failed:\n${execResult.stderr}`,
    };
  }

  // Build result
  const result: CADResult = {
    pythonCode,
    volume: execResult.volume,
    surfaceArea: execResult.surfaceArea,
    log: execResult.stdout,
  };

  // Map exported files
  for (const filePath of execResult.files) {
    const lower = filePath.toLowerCase();
    if (lower.endsWith(".step")) result.stepPath = filePath;
    else if (lower.endsWith(".stl")) result.stlPath = filePath;
    else if (lower.endsWith(".3mf")) result.threeMfPath = filePath;
    else if (lower.endsWith(".glb")) result.glbPath = filePath;
    else if (lower.endsWith(".dxf")) result.dxfPath = filePath;
    else if (lower.endsWith(".stp")) result.stepPath = filePath;
  }

  logger.info(MODULE, "Generation complete", {
    volume: result.volume,
    surfaceArea: result.surfaceArea,
    files: execResult.files.length,
  });

  return result;
}

/**
 * Modify an existing CAD model by appending new operations
 */
export async function modifyCAD(
  existingCode: string,
  modificationPrompt: string,
  formats: ExportFormat[] = ["step"],
): Promise<CADResult> {
  const config = getConfig();
  logger.info(MODULE, `Modifying model: "${modificationPrompt.substring(0, 60)}..."`);

  // Parse the modification prompt
  const brief = await specPlanner(modificationPrompt);
  const operations = await geoArchitect(brief);

  // Append operations to existing code
  const modCode = await codeGenerator(operations, brief);
  const combinedCode = [
    existingCode,
    "\n\n# === Modification ===\n",
    modCode,
  ].join("\n");

  const outputDir = config.outputDir;
  const execResult = await executePythonCode(combinedCode, outputDir, formats);

  const result: CADResult = {
    pythonCode: combinedCode,
    volume: execResult.volume,
    surfaceArea: execResult.surfaceArea,
    log: execResult.stdout,
  };

  for (const filePath of execResult.files) {
    const lower = filePath.toLowerCase();
    if (lower.endsWith(".step")) result.stepPath = filePath;
    else if (lower.endsWith(".stl")) result.stlPath = filePath;
    else if (lower.endsWith(".3mf")) result.threeMfPath = filePath;
    else if (lower.endsWith(".glb")) result.glbPath = filePath;
    else if (lower.endsWith(".dxf")) result.dxfPath = filePath;
  }

  return result;
}
