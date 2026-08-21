/**
 * Code Generator: GeoOperation Sequence → build123d Python Code
 *
 * Compiles the geometric operations into executable Python code
 * using the build123d library.
 */

import type { GeoOperation, CADBrief } from "../types.js";
import { logger } from "../utils/logging.js";

const MODULE = "CodeGenerator";

// ─── Code Fragment Generators ─────────────────────────────────
function emitBaseShape(op: GeoOperation): string {
  const p = op.params;
  switch (op.op) {
    case "box":
      return `    with BuildPart() as part:\n        Box(${p.width}, ${p.height}, ${p.depth})`;
    case "cylinder":
      return `    with BuildPart() as part:\n        Cylinder(${p.radius}, ${p.height})`;
    case "sphere":
      return `    with BuildPart() as part:\n        Sphere(${p.radius})`;
    case "cone":
      return `    with BuildPart() as part:\n        Cone(${p.radius1}, ${p.radius2}, ${p.height})`;
    case "extrude":
      return [
        `    with BuildSketch() as sketch:`,
        `        Rectangle(${p.profileWidth}, ${p.profileHeight})`,
        `    extrude(amount=${p.depth})`,
      ].join("\n");
    case "revolve":
      return [
        `    with BuildSketch(Plane.XZ) as sketch:`,
        `        Rectangle(${p.profileWidth}, ${p.profileHeight})`,
        `    revolve(angle=${p.angle})`,
      ].join("\n");
    case "loft":
      return [
        `    with BuildPart() as part:`,
        `        with BuildSketch(Plane.XY) as s1:`,
        `            Circle(${(p.profileWidth as number) * 0.4})`,
        `        with BuildSketch(Plane.XY.offset(${p.height})) as s2:`,
        `            Circle(${(p.profileWidth as number) * 0.7})`,
        `        loft()`,
      ].join("\n");
    case "sweep":
      return [
        `    with BuildPart() as part:`,
        `        with BuildSketch(Plane.XY) as profile:`,
        `            Circle(${p.profileRadius})`,
        `        with BuildLine() as path:`,
        `            Line((0,0,0), (0,0,${p.pathLength}))`,
        `        sweep()`,
      ].join("\n");
    default:
      return `    with BuildPart() as part:\n        Box(100, 50, 30)`;
  }
}

function emitFeature(op: GeoOperation): string {
  const p = op.params;
  switch (op.op) {
    case "fillet":
      return `        # Apply fillet R${p.radius}\n        fillet(part.edges().sort_by(Axis.Z)[-4:], radius=${p.radius})`;
    case "chamfer":
      return `        # Apply chamfer\n        chamfer(part.edges().sort_by(Axis.Z)[-4:], distance=${p.distance})`;
    case "hole": {
      const r = p.radius as number;
      const depth = p.depth as number;
      return [
        `        # Drill hole r=${r} depth=${depth}`,
        `        with Locations(part.faces().sort_by(Axis.Z).last.center):`,
        `            Hole(radius=${r}, depth=${depth})`,
      ].join("\n");
    }
    case "cut": {
      const shape = p.shape as string ?? "box";
      if (shape === "box") {
        return [
          `        # Cut pocket`,
          `        with Locations(part.faces().sort_by(Axis.Z).last.center):`,
          `            Box(${p.width}, ${p.height}, ${p.depth}, mode=Mode.SUBTRACT)`,
        ].join("\n");
      }
      return `        # Cut shape\n        # (custom cut)`;
    }
    case "shell":
      return `        # Shell/wall thickness\n        shell(thickness=${p.wallThickness})`;
    case "pattern":
      return [
        `        # Circular pattern`,
        `        with BuildSketch(part.faces().sort_by(Axis.Z).last) as s:`,
        `            Rectangle(${p.count} * 5, 2)`,
        `        revolve(axis=Axis.Z, angle=360, mode=Mode.INTERSECT)`,
      ].join("\n");
    case "mirror":
      return `        # Mirror symmetry\n        mirror(mirrorPlane=Plane.YZ)`;
    default:
      return `        # Unknown operation: ${op.op}`;
  }
}

// ─── Main Generator ───────────────────────────────────────────
export async function codeGenerator(
  operations: GeoOperation[],
  brief?: CADBrief,
): Promise<string> {
  logger.info(MODULE, `Generating code for ${operations.length} operations`);

  const lines: string[] = [
    '"""',
    `Auto-generated build123d code by HOS-CAD-Builder`,
    brief ? `Model: ${brief.name}` : "",
    brief ? `Description: ${brief.description.substring(0, 120)}` : "",
    '"""',
    "",
    "import build123d as bd",
    "from build123d import *",
    "",
    "",
    "def build_model():",
  ];

  // Emit base shape (first operation)
  if (operations.length > 0) {
    lines.push(emitBaseShape(operations[0]));
  }

  // Emit feature operations
  for (let i = 1; i < operations.length; i++) {
    lines.push("");
    lines.push(emitFeature(operations[i]));
  }

  // Export result
  lines.push("");
  lines.push("    return part");
  lines.push("");
  lines.push("");
  lines.push('if __name__ == "__main__":');
  lines.push("    part = build_model()");
  lines.push('    print(f"Volume: {part.volume:.2f} mm³")');
  lines.push('    print(f"Surface area: {part.area:.2f} mm²")');
  lines.push("");

  const code = lines.join("\n");
  logger.debug(MODULE, `Generated ${code.length} chars of Python code`);
  return code;
}
