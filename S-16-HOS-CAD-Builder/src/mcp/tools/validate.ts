/**
 * MCP Tool: cad_validate
 * Validate a CAD model for printability and wall thickness
 */

import { validateThickness } from "../../validation/thickness.js";
import { validatePrintability } from "../../validation/printability.js";
import { logger } from "../../utils/logging.js";

const MODULE = "tool:cad_validate";

export const validateTool = {
  name: "cad_validate",
  description:
    "Validate a CAD model for manufacturing issues. " +
    "Checks wall thickness, printability, minimum feature sizes, and volume sanity. " +
    "Provide the Python source code and model properties from a previous cad_generate call.",
  inputSchema: {
    type: "object" as const,
    properties: {
      python_code: {
        type: "string",
        description: "The Python source code from a previous cad_generate call",
      },
      manufacturing: {
        type: "string",
        enum: ["3d_print", "cnc", "injection_mold", "sheet_metal", "none"],
        default: "3d_print",
        description: "Target manufacturing method",
      },
      volume: {
        type: "number",
        description: "Model volume in mm³ (from cad_generate output)",
      },
      surface_area: {
        type: "number",
        description: "Model surface area in mm² (from cad_generate output)",
      },
      bounding_box: {
        type: "array",
        items: { type: "number" },
        description: "Bounding box [width, height, depth] in mm",
      },
      wall_thickness: {
        type: "number",
        description: "Specified wall thickness in mm",
      },
    },
    required: ["python_code"],
  },

  async handler(args: {
    python_code: string;
    manufacturing?: string;
    volume?: number;
    surface_area?: number;
    bounding_box?: number[];
    wall_thickness?: number;
  }) {
    logger.info(MODULE, `Validating for ${args.manufacturing ?? "3d_print"}`);

    try {
      // Run both validators in parallel
      const [thicknessResult, printabilityResult] = await Promise.all([
        validateThickness({
          manufacturing: args.manufacturing,
          volume: args.volume,
          surfaceArea: args.surface_area,
          specifiedWallThickness: args.wall_thickness,
          pythonCode: args.python_code,
        }),
        validatePrintability({
          manufacturing: args.manufacturing,
          volume: args.volume,
          surfaceArea: args.surface_area,
          boundingBox: args.bounding_box as [number, number, number] | undefined,
          pythonCode: args.python_code,
        }),
      ]);

      // Merge results
      const allChecks = [...thicknessResult.checks, ...printabilityResult.checks];
      const allWarnings = [...thicknessResult.warnings, ...printabilityResult.warnings];
      const allSuggestions = [...thicknessResult.suggestions, ...printabilityResult.suggestions];
      const passed = thicknessResult.passed && printabilityResult.passed;

      // Format response
      const lines: string[] = [
        `## Validation ${passed ? "✅ PASSED" : "❌ FAILED"}\n`,
        "### Checks",
      ];

      for (const c of allChecks) {
        const icon = c.passed ? "✅" : c.severity === "error" ? "❌" : "⚠️";
        lines.push(`- ${icon} **${c.name}**: ${c.message}`);
      }

      if (allWarnings.length > 0) {
        lines.push("\n### Warnings");
        for (const w of allWarnings) {
          lines.push(`- ⚠️ ${w}`);
        }
      }

      if (allSuggestions.length > 0) {
        lines.push("\n### Suggestions");
        for (const s of allSuggestions) {
          lines.push(`- 💡 ${s}`);
        }
      }

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
        isError: !passed,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(MODULE, `Validation failed: ${msg}`);
      return {
        content: [{ type: "text" as const, text: `**Error**: ${msg}` }],
        isError: true,
      };
    }
  },
};
