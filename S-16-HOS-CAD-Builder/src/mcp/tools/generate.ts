/**
 * MCP Tool: cad_generate
 * Generate a 3D CAD model from natural language description
 */

import type { ExportFormat } from "../../types.js";
import { generateCAD } from "../../execution/cad-engine.js";
import { logger } from "../../utils/logging.js";

const MODULE = "tool:cad_generate";

export const generateTool = {
  name: "cad_generate",
  description:
    "Generate a 3D CAD model from a natural language description. " +
    "Supports common shapes (box, cylinder, sphere, cone), extrusions, revolves, lofts, " +
    "and features (holes, fillets, chamfers, slots, shells, patterns, mirrors). " +
    "Exports to STEP, STL, 3MF, GLB, and DXF formats.",
  inputSchema: {
    type: "object" as const,
    properties: {
      prompt: {
        type: "string",
        description:
          "Natural language description of the CAD model to generate. " +
          'Examples: "A 100x50x30mm box with two 5mm holes", ' +
          '"A cylinder radius 20mm height 80mm with fillet R3"',
      },
      export_formats: {
        type: "array",
        items: { type: "string", enum: ["step", "stl", "3mf", "glb", "dxf", "stp"] },
        default: ["step"],
        description: "Export formats to generate",
      },
      output_name: {
        type: "string",
        description: "Base name for output files (without extension)",
      },
    },
    required: ["prompt"],
  },

  async handler(args: { prompt: string; export_formats?: string[]; output_name?: string }) {
    logger.info(MODULE, `Generating: "${args.prompt.substring(0, 60)}..."`);

    try {
      const formats: ExportFormat[] = (args.export_formats ?? ["step"]) as ExportFormat[];
      const result = await generateCAD({
        prompt: args.prompt,
        formats,
        outputName: args.output_name,
      });

      // Format response
      const lines: string[] = ["## CAD Model Generated\n"];

      if (result.stepPath) lines.push(`**STEP**: ${result.stepPath}`);
      if (result.stlPath) lines.push(`**STL**: ${result.stlPath}`);
      if (result.threeMfPath) lines.push(`**3MF**: ${result.threeMfPath}`);
      if (result.glbPath) lines.push(`**GLB**: ${result.glbPath}`);
      if (result.dxfPath) lines.push(`**DXF**: ${result.dxfPath}`);
      if (result.urdfPath) lines.push(`**URDF**: ${result.urdfPath}`);
      if (result.srdfPath) lines.push(`**SRDF**: ${result.srdfPath}`);

      if (result.volume !== undefined) lines.push(`\n**Volume**: ${result.volume.toFixed(2)} mm³`);
      if (result.surfaceArea !== undefined) lines.push(`**Surface Area**: ${result.surfaceArea.toFixed(2)} mm²`);

      if (result.pythonCode) {
        lines.push(`\n### Generated Python Code\n\`\`\`python\n${result.pythonCode}\n\`\`\``);
      }

      if (result.log) {
        lines.push(`\n### Execution Log\n\`\`\`\n${result.log}\n\`\`\``);
      }

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
        isError: !result.stepPath && !result.stlPath,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(MODULE, `Generation failed: ${msg}`);
      return {
        content: [{ type: "text" as const, text: `**Error**: ${msg}` }],
        isError: true,
      };
    }
  },
};
