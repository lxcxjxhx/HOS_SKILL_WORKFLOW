/**
 * MCP Tool: cad_modify
 * Modify an existing CAD model by applying incremental changes
 */

import type { ExportFormat } from "../../types.js";
import { modifyCAD } from "../../execution/cad-engine.js";
import { logger } from "../../utils/logging.js";

const MODULE = "tool:cad_modify";

export const modifyTool = {
  name: "cad_modify",
  description:
    "Modify an existing CAD model by specifying changes in natural language. " +
    "Requires the Python source code from a previous cad_generate call.",
  inputSchema: {
    type: "object" as const,
    properties: {
      python_code: {
        type: "string",
        description: "The Python source code from a previous cad_generate call",
      },
      modification: {
        type: "string",
        description:
          'Natural language description of the modification. ' +
          'Examples: "Add a 10mm hole on the top face", "Fillet all edges R2", "Cut a slot width 5mm"',
      },
      export_formats: {
        type: "array",
        items: { type: "string", enum: ["step", "stl", "3mf", "glb", "dxf"] },
        default: ["step"],
        description: "Export formats to generate",
      },
    },
    required: ["python_code", "modification"],
  },

  async handler(args: { python_code: string; modification: string; export_formats?: string[] }) {
    logger.info(MODULE, `Modifying: "${args.modification.substring(0, 60)}..."`);

    try {
      const formats: ExportFormat[] = (args.export_formats ?? ["step"]) as ExportFormat[];
      const result = await modifyCAD(args.python_code, args.modification, formats);

      const lines: string[] = ["## CAD Model Modified\n"];

      if (result.stepPath) lines.push(`**STEP**: ${result.stepPath}`);
      if (result.stlPath) lines.push(`**STL**: ${result.stlPath}`);
      if (result.threeMfPath) lines.push(`**3MF**: ${result.threeMfPath}`);
      if (result.glbPath) lines.push(`**GLB**: ${result.glbPath}`);

      if (result.volume !== undefined) lines.push(`\n**Volume**: ${result.volume.toFixed(2)} mm³`);
      if (result.surfaceArea !== undefined) lines.push(`**Surface Area**: ${result.surfaceArea.toFixed(2)} mm²`);

      if (result.pythonCode) {
        lines.push(`\n### Updated Python Code\n\`\`\`python\n${result.pythonCode}\n\`\`\``);
      }

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
        isError: false,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(MODULE, `Modification failed: ${msg}`);
      return {
        content: [{ type: "text" as const, text: `**Error**: ${msg}` }],
        isError: true,
      };
    }
  },
};
