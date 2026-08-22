/**
 * Geo Architect: CADBrief → Geometric Operation Sequence
 *
 * Translates the structured CAD brief into a sequence of
 * geometric operations that can be compiled into build123d code.
 */

import type { CADBrief, GeoOperation, CADFeature } from "../types.js";
import { logger } from "../utils/logging.js";

const MODULE = "GeoArchitect";

// ─── Feature → Operation Mapping ──────────────────────────────
function featureToOperation(feature: CADFeature): GeoOperation[] {
  const ops: GeoOperation[] = [];

  switch (feature.type) {
    case "hole": {
      const d = (feature.params.diameter as number) ?? 5;
      const depth = (feature.params.depth as number) ?? 50;
      ops.push({
        op: "hole",
        params: { radius: d / 2, depth },
        description: feature.description,
      });
      break;
    }
    case "fillet": {
      const r = (feature.params.radius as number) ?? 2;
      ops.push({
        op: "fillet",
        params: { radius: r },
        description: feature.description,
      });
      break;
    }
    case "chamfer": {
      const d = (feature.params.distance as number) ?? 1;
      ops.push({
        op: "chamfer",
        params: { distance: d },
        description: feature.description,
      });
      break;
    }
    case "pocket": {
      const w = (feature.params.width as number) ?? 10;
      const h = (feature.params.height as number) ?? 10;
      const d = (feature.params.depth as number) ?? 5;
      ops.push({
        op: "cut",
        params: { shape: "box", width: w, height: h, depth: d },
        description: feature.description,
      });
      break;
    }
    case "slot": {
      const w = (feature.params.width as number) ?? 5;
      const d = (feature.params.depth as number) ?? 3;
      ops.push({
        op: "cut",
        params: { shape: "box", width: w * 3, height: w, depth: d },
        description: feature.description,
      });
      break;
    }
    case "shell": {
      const t = (feature.params.wallThickness as number) ?? 2;
      ops.push({
        op: "shell",
        params: { wallThickness: t },
        description: feature.description,
      });
      break;
    }
    case "pattern": {
      const count = (feature.params.count as number) ?? 4;
      ops.push({
        op: "pattern",
        params: { count, type: "circular" },
        description: feature.description,
      });
      break;
    }
    case "mirror": {
      ops.push({
        op: "mirror",
        params: { axis: feature.params.axis as string ?? "yz" },
        description: feature.description,
      });
      break;
    }
    default:
      logger.warn(MODULE, `Unknown feature type: ${feature.type}`);
  }

  return ops;
}

// ─── Shape → Operation Mapping ────────────────────────────────
function shapeToBaseOp(brief: CADBrief): GeoOperation {
  const d = brief.dimensions;

  switch (brief.shape) {
    case "box":
      return {
        op: "box",
        params: {
          width: d.width ?? 100,
          height: d.height ?? 50,
          depth: d.depth ?? 30,
        },
      };
    case "cylinder":
      return {
        op: "cylinder",
        params: {
          radius: d.radius ?? 25,
          height: d.height ?? d.length ?? 50,
        },
      };
    case "sphere":
      return {
        op: "sphere",
        params: {
          radius: d.radius ?? 25,
        },
      };
    case "cone":
      return {
        op: "cone",
        params: {
          radius1: d.radius ?? 30,
          radius2: 0,
          height: d.height ?? 60,
        },
      };
    case "extrusion":
      return {
        op: "extrude",
        params: {
          depth: d.depth ?? 10,
          profileWidth: d.width ?? 100,
          profileHeight: d.height ?? 50,
        },
      };
    case "revolve":
      return {
        op: "revolve",
        params: {
          angle: 360,
          profileWidth: d.width ?? 50,
          profileHeight: d.height ?? 100,
        },
      };
    case "loft":
      return {
        op: "loft",
        params: {
          profiles: 2,
          height: d.height ?? 100,
        },
      };
    case "sweep":
      return {
        op: "sweep",
        params: {
          pathLength: d.length ?? 100,
          profileRadius: d.radius ?? 10,
        },
      };
    default:
      return {
        op: "box",
        params: {
          width: d.width ?? 100,
          height: d.height ?? 50,
          depth: d.depth ?? 30,
        },
      };
  }
}

// ─── Main Architect ───────────────────────────────────────────
export async function geoArchitect(brief: CADBrief): Promise<GeoOperation[]> {
  logger.info(MODULE, `Designing geometry for shape=${brief.shape}`);

  const operations: GeoOperation[] = [];

  // Step 1: Base shape operation
  const baseOp = shapeToBaseOp(brief);
  operations.push(baseOp);

  // Step 2: Add feature operations
  for (const feature of brief.features) {
    const featureOps = featureToOperation(feature);
    operations.push(...featureOps);
  }

  logger.info(MODULE, `Generated ${operations.length} operations`);
  return operations;
}
