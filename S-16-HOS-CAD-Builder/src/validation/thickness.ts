/**
 * Wall Thickness Validator
 *
 * Validates that the CAD model meets minimum wall thickness
 * requirements for the specified manufacturing process.
 */

import type { ValidationResult, ValidationCheck } from "../types.js";
import { logger } from "../utils/logging.js";

const MODULE = "ThicknessValidator";

/** Minimum wall thickness by manufacturing method (mm) */
const MIN_WALL_THICKNESS: Record<string, number> = {
  "3d_print": 0.8,
  cnc: 0.5,
  injection_mold: 0.8,
  sheet_metal: 0.5,
  none: 0.3,
};

export interface ThicknessValidationOptions {
  manufacturing?: string;
  volume?: number;
  surfaceArea?: number;
  specifiedWallThickness?: number;
  pythonCode?: string;
}

/**
 * Validate wall thickness based on manufacturing constraints
 */
export async function validateThickness(
  options: ThicknessValidationOptions,
): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const method = options.manufacturing ?? "3d_print";
  const minThickness = MIN_WALL_THICKNESS[method] ?? 0.8;

  logger.info(MODULE, `Validating thickness for ${method} (min=${minThickness}mm)`);

  // Check 1: Specified wall thickness
  if (options.specifiedWallThickness !== undefined) {
    checks.push({
      name: "wall_thickness_specified",
      passed: options.specifiedWallThickness >= minThickness,
      message: options.specifiedWallThickness >= minThickness
        ? `Wall thickness ${options.specifiedWallThickness}mm meets ${method} minimum (${minThickness}mm)`
        : `Wall thickness ${options.specifiedWallThickness}mm is below ${method} minimum (${minThickness}mm)`,
      severity: options.specifiedWallThickness >= minThickness ? "info" : "error",
    });

    if (options.specifiedWallThickness < minThickness) {
      suggestions.push(`Increase wall thickness to at least ${minThickness}mm for ${method}`);
    }
  } else {
    warnings.push("No explicit wall thickness specified; add 'shell' or 'wall thickness' to the prompt for better validation");
    suggestions.push("Consider specifying wall thickness explicitly, e.g., 'wall thickness 2mm'");
  }

  // Check 2: Volume-to-surface-area ratio (thin structure heuristic)
  if (options.volume !== undefined && options.surfaceArea !== undefined && options.surfaceArea > 0) {
    const ratio = options.volume / options.surfaceArea;
    // A very low ratio suggests thin walls
    const isThin = ratio < 2.0; // mm
    checks.push({
      name: "thin_structure_ratio",
      passed: !isThin,
      message: isThin
        ? `Volume/area ratio (${ratio.toFixed(2)}mm) suggests very thin structure — may be fragile`
        : `Volume/area ratio (${ratio.toFixed(2)}mm) indicates reasonable wall thickness`,
      severity: isThin ? "warning" : "info",
    });

    if (isThin) {
      suggestions.push("The model appears to have very thin walls; consider adding a shell feature");
    }
  }

  // Check 3: Code-level analysis for shell usage
  if (options.pythonCode) {
    const hasShell = /shell\s*\(/.test(options.pythonCode);
    if (!hasShell && method === "injection_mold") {
      warnings.push("Injection molding typically requires uniform wall thickness — consider adding shell()");
    }
  }

  const passed = checks.every((c) => c.severity !== "error");

  const result: ValidationResult = { passed, checks, warnings, suggestions };
  logger.info(MODULE, `Validation ${passed ? "PASSED" : "FAILED"} (${checks.length} checks)`);
  return result;
}
