/**
 * MCP Tool: cad_export
 * Export an existing CAD model to various formats
 */

import { executePythonCode } from "../../execution/python-bridge.js";
import { getConfig } from "../../utils/config.js";
import { logger } from "../../utils/logging.js";

const MODULE = "tool:cad_export";

export const exportTool = {
  name: "cad_export",
  description:
    "Export a CAD model (from Python code) to STEP, STL, 3MF, GLB, or DXF format. " +
    "Provide the Python source code from a previous cad_generate call.",
  inputSchema: {
    type: "object" as const,
    properties: {
      python_code: {
        type: "string",
        description: "The Python source code from a previous cad_generate call",
      },
      format: {
        type: "string",
        enum: ["step", "stl", "3mf", "glb", "dxf", "stp"],
        description: "Target export format",
      },
      stl_ascii: {
        type: "boolean",
        default: false,
        description: "For STL: use ASCII format instead of binary",
      },
    },
    required: ["python_code", "format"],
  },

  async handler(args: { python_code: string; format: string; stl_ascii?: boolean }) {
    logger.info(MODULE, `Exporting to ${args.format}`);

    try {
      const config = getConfig();
      const result = await executePythonCode(
        args.python_code,
        config.outputDir,
        [args.format],
      );

      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `**Export failed**:\n${result.stderr}` }],
          isError: true,
        };
      }

      const lines: string[] = [`## Exported to ${args.format.toUpperCase()}\n`];

      for (const f of result.files) {
        lines.push(`- **File**: ${f}`);
      }

      if (result.volume !== undefined) lines.push(`\n**Volume**: ${result.volume.toFixed(2)} mm³`);
      if (result.surfaceArea !== undefined) lines.push(`**Surface Area**: ${result.surfaceArea.toFixed(2)} mm²`);

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
        isError: false,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(MODULE, `Export failed: ${msg}`);
      return {
        content: [{ type: "text" as const, text: `**Error**: ${msg}` }],
        isError: true,
      };
    }
  },
};
