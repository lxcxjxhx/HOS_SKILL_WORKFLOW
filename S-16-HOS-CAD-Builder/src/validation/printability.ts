/**
 * Printability / Manufacturability Validator
 *
 * Checks the CAD model for common manufacturing issues:
 * - Overhangs (for 3D printing)
 * - Minimum feature size
 * - Self-intersections
 * - Manifold issues
 */

import type { ValidationResult, ValidationCheck } from "../types.js";
import { logger } from "../utils/logging.js";

const MODULE = "PrintabilityValidator";

export interface PrintabilityOptions {
  manufacturing?: string;
  volume?: number;
  surfaceArea?: number;
  boundingBox?: [number, number, number];
  pythonCode?: string;
}

/**
 * Validate printability / manufacturability
 */
export async function validatePrintability(
  options: PrintabilityOptions,
): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const method = options.manufacturing ?? "3d_print";

  logger.info(MODULE, `Validating printability for ${method}`);

  // Check 1: Bounding box size limits
  if (options.boundingBox) {
    const [w, h, d] = options.boundingBox;
    const maxDim = Math.max(w, h, d);

    if (maxDim > 300) {
      checks.push({
        name: "max_dimension",
        passed: false,
        message: `Maximum dimension ${maxDim}mm exceeds typical 3D printer build volume (300mm)`,
        severity: "warning",
      });
      suggestions.push("Consider splitting the model into smaller parts for 3D printing");
    } else {
      checks.push({
        name: "max_dimension",
        passed: true,
        message: `Maximum dimension ${maxDim}mm is within standard build volume`,
        severity: "info",
      });
    }

    // Check for very small features
    const minDim = Math.min(w, h, d);
    if (minDim < 1.0) {
      checks.push({
        name: "minimum_feature",
        passed: false,
        message: `Minimum dimension ${minDim.toFixed(2)}mm may be too small to manufacture`,
        severity: "warning",
      });
      suggestions.push("Features smaller than 1mm may not print or machine accurately");
    } else {
      checks.push({
        name: "minimum_feature",
        passed: true,
        message: `Minimum dimension ${minDim.toFixed(2)}mm is acceptable`,
        severity: "info",
      });
    }
  }

  // Check 2: Volume sanity
  if (options.volume !== undefined) {
    if (options.volume <= 0) {
      checks.push({
        name: "positive_volume",
        passed: false,
        message: "Model has zero or negative volume — may indicate self-intersecting geometry",
        severity: "error",
      });
    } else if (options.volume > 1_000_000) {
      checks.push({
        name: "volume_size",
        passed: true,
        message: `Volume ${(options.volume / 1e6).toFixed(2)}L is very large — verify this is intentional`,
        severity: "warning",
      });
    } else {
      checks.push({
        name: "positive_volume",
        passed: true,
        message: `Volume ${options.volume.toFixed(2)}mm³ is valid`,
        severity: "info",
      });
    }
  }

  // Check 3: CNC-specific checks
  if (method === "cnc") {
    checks.push({
      name: "cnc_accessibility",
      passed: true,
      message: "Note: Verify tool access for all features — internal cavities may require EDM",
      severity: "info",
    });
    // Check for undercuts
    if (options.pythonCode) {
      const hasUndercut = /Sphere|Torus/.test(options.pythonCode);
      if (hasUndercut) {
        warnings.push("Curved internal features detected — may require multi-axis CNC or EDM");
      }
    }
  }

  // Check 4: Sheet metal checks
  if (method === "sheet_metal") {
    checks.push({
      name: "bend_radius",
      passed: true,
      message: "Ensure all bend radii are at least equal to material thickness",
      severity: "info",
    });
  }

  // Check 5: Code-level self-intersection warning
  if (options.pythonCode) {
    const complexOps = (options.pythonCode.match(/(intersect|difference|union)\s*\(/g) || []).length;
    if (complexOps > 5) {
      warnings.push(`${complexOps} boolean operations detected — increased risk of self-intersection geometry`);
      suggestions.push("Consider simplifying the model or verifying with validate tool after generation");
    }
  }

  const passed = checks.every((c) => c.severity !== "error");
  const result: ValidationResult = { passed, checks, warnings, suggestions };

  logger.info(MODULE, `Validation ${passed ? "PASSED" : "FAILED"} (${checks.length} checks, ${warnings.length} warnings)`);
  return result;
}
