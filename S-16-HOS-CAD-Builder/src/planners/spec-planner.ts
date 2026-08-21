/**
 * Spec Planner: Natural Language → Structured CADBrief
 *
 * Converts user's natural language description into a structured
 * CAD specification. Uses rule-based extraction with dimension parsing.
 */

import type { CADBrief, CADShape, CADFeature, Dimensions, AssemblyPart } from "../types.js";
import { logger } from "../utils/logging.js";

const MODULE = "SpecPlanner";

// ─── Dimension Parser ─────────────────────────────────────────
function extractDimensions(text: string): Dimensions {
  const dims: Dimensions = {};

  // Common patterns: "100mm", "10 cm", "5 inch", "100 x 50 x 30"
  const mm = (val: string, unit: string): number => {
    const n = parseFloat(val);
    if (unit === "cm") return n * 10;
    if (unit === "in" || unit === "inch") return n * 25.4;
    if (unit === "m") return n * 1000;
    return n; // default mm
  };

  // Named dimensions: width=X, height=Y, etc.
  const namedPatterns: [RegExp, keyof Dimensions][] = [
    [/(?:width|宽|横)[=:\s]*(\d+(?:\.\d+)?)\s*(mm|cm|m|inch|in)?/gi, "width"],
    [/(?:height|高|纵)[=:\s]*(\d+(?:\.\d+)?)\s*(mm|cm|m|inch|in)?/gi, "height"],
    [/(?:depth|depth|深|厚)[=:\s]*(\d+(?:\.\d+)?)\s*(mm|cm|m|inch|in)?/gi, "depth"],
    [/(?:radius|r|半径)[=:\s]*(\d+(?:\.\d+)?)\s*(mm|cm|m|inch|in)?/gi, "radius"],
    [/(?:length|长)[=:\s]*(\d+(?:\.\d+)?)\s*(mm|cm|m|inch|in)?/gi, "length"],
    [/(?:diameter|d|直径)[=:\s]*(\d+(?:\.\d+)?)\s*(mm|cm|m|inch|in)?/gi, "radius"],
  ];

  for (const [pattern, key] of namedPatterns) {
    const match = pattern.exec(text);
    if (match) {
      (dims as Record<string, number>)[key] = mm(match[1], match[2] ?? "mm");
      if (key === "radius" && text.toLowerCase().includes("diameter")) {
        dims.radius = dims.radius! / 2;
      }
    }
  }

  // Dimension triple: "100x50x30" or "100 x 50 x 30 mm"
  const tripleMatch = text.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i);
  if (tripleMatch && !dims.width) {
    dims.width = mm(tripleMatch[1], tripleMatch[4] ?? "mm");
    dims.height = mm(tripleMatch[2], tripleMatch[4] ?? "mm");
    dims.depth = mm(tripleMatch[3], tripleMatch[4] ?? "mm");
  }

  return dims;
}

// ─── Shape Classifier ─────────────────────────────────────────
function classifyShape(text: string): CADShape {
  const lower = text.toLowerCase();
  if (/\b(assembly|装配|组件)\b/.test(lower)) return "assembly";
  if (/\b(cylinder|circular|圆柱|管|pipe|tube|rod|轴)\b/.test(lower)) return "cylinder";
  if (/\b(sphere|球|ball|orb)\b/.test(lower)) return "sphere";
  if (/\b(cone|锥|funnel|漏斗)\b/.test(lower)) return "cone";
  if (/\b(revolve|旋转体|lathe)\b/.test(lower)) return "revolve";
  if (/\b(loft|放样)\b/.test(lower)) return "loft";
  if (/\b(sweep|扫掠)\b/.test(lower)) return "sweep";
  if (/\b(extrud|拉伸|profile|截面)\b/.test(lower)) return "extrusion";
  // Default to box
  if (/\b(box|cube|rect|块|方|长方)\b/.test(lower)) return "box";
  return "box";
}

// ─── Feature Extractor ────────────────────────────────────────
function extractFeatures(text: string): CADFeature[] {
  const features: CADFeature[] = [];

  // Holes
  const holePatterns = text.matchAll(/(?:钻|钻孔|打孔|hole|drill)\s*(?:一个|a\s+)?(\d+(?:\.\d+)?)\s*(mm|cm)?\s*(?:的|的)?\s*(?:孔|圆孔|通孔|盲孔)?/gi);
  for (const m of holePatterns) {
    features.push({
      type: "hole",
      params: { diameter: parseFloat(m[1]), unit: m[2] ?? "mm" },
      description: `Drill ${m[1]}${m[2] ?? "mm"} hole`,
    });
  }

  // Fillets
  const filletPatterns = text.matchAll(/(?:倒圆角|圆角|fillet|round)\s*(?:r\s*)?(\d+(?:\.\d+)?)\s*(mm|cm)?/gi);
  for (const m of filletPatterns) {
    features.push({
      type: "fillet",
      params: { radius: parseFloat(m[1]), unit: m[2] ?? "mm" },
      description: `Fillet R${m[1]}${m[2] ?? "mm"}`,
    });
  }

  // Chamfers
  const chamferPatterns = text.matchAll(/(?:倒角|chamfer|bevel)\s*(\d+(?:\.\d+)?)\s*(mm|cm)?/gi);
  for (const m of chamferPatterns) {
    features.push({
      type: "chamfer",
      params: { distance: parseFloat(m[1]), unit: m[2] ?? "mm" },
      description: `Chamfer ${m[1]}${m[2] ?? "mm"}`,
    });
  }

  // Slots
  const slotPatterns = text.matchAll(/(?:槽|slot|groove|键槽)\s*(?:宽|width)?\s*(\d+(?:\.\d+)?)\s*(mm|cm)?/gi);
  for (const m of slotPatterns) {
    features.push({
      type: "slot",
      params: { width: parseFloat(m[1]), unit: m[2] ?? "mm" },
      description: `Slot width ${m[1]}${m[2] ?? "mm"}`,
    });
  }

  // Shells / thin-wall
  if (/\b(shell|薄壁|抽壳|hollow)\b/i.test(text)) {
    const wallMatch = text.match(/(?:壁厚|wall\s*thickness|wall)[=:\s]*(\d+(?:\.\d+)?)\s*(mm|cm)?/i);
    features.push({
      type: "shell",
      params: { wallThickness: wallMatch ? parseFloat(wallMatch[1]) : 2.0 },
      description: `Shell / thin-wall (wall=${wallMatch ? wallMatch[1] : "2.0"}mm)`,
    });
  }

  // Patterns
  if (/\b(pattern|阵列|阵排)\b/i.test(text)) {
    const countMatch = text.match(/(\d+)\s*(?:个|pcs|pieces|copies)/i);
    features.push({
      type: "pattern",
      params: { count: countMatch ? parseInt(countMatch[1]) : 4 },
      description: `Pattern x${countMatch ? countMatch[1] : "4"}`,
    });
  }

  // Mirror
  if (/\b(mirror|镜像|对称)\b/i.test(text)) {
    features.push({
      type: "mirror",
      params: { axis: "yz" },
      description: "Mirror symmetry",
    });
  }

  return features;
}

// ─── Material Detector ────────────────────────────────────────
function detectMaterial(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/\b(pla|abs|petg|resin|树脂|塑料)\b/.test(lower)) return "plastic";
  if (/\b(aluminum|铝|铝合金|6061|7075)\b/.test(lower)) return "aluminum";
  if (/\b(steel|钢|不锈钢|304|316)\b/.test(lower)) return "steel";
  if (/\b(titanium|钛)\b/.test(lower)) return "titanium";
  if (/\b(brass|铜|黄铜)\b/.test(lower)) return "brass";
  if (/\b(wood|木)\b/.test(lower)) return "wood";
  if (/\b(rubber|硅胶|silicone)\b/.test(lower)) return "rubber";
  return undefined;
}

// ─── Manufacturing Detector ───────────────────────────────────
function detectManufacturing(text: string): CADBrief["manufacturing"] {
  const lower = text.toLowerCase();
  if (/\b(3d\s*print|打印|增材|fdm|sla|sls)\b/.test(lower)) return "3d_print";
  if (/\b(cnc|铣|数控)\b/.test(lower)) return "cnc";
  if (/\b(injection|mold|注塑|模具)\b/.test(lower)) return "injection_mold";
  if (/\b(sheet\s*metal|钣金|冲压)\b/.test(lower)) return "sheet_metal";
  return undefined;
}

// ─── Main Planner ─────────────────────────────────────────────
export async function specPlanner(prompt: string): Promise<CADBrief> {
  logger.info(MODULE, `Planning spec for: "${prompt.substring(0, 80)}..."`);

  const shape = classifyShape(prompt);
  const dimensions = extractDimensions(prompt);
  const features = extractFeatures(prompt);
  const material = detectMaterial(prompt);
  const manufacturing = detectManufacturing(prompt);

  // Derive a model name from the prompt
  const nameMatch = prompt.match(/(?:叫|命名|name|叫做)[=:\s]*(.+)/i);
  const name = nameMatch
    ? nameMatch[1].trim().substring(0, 50)
    : `cad-model-${Date.now()}`;

  const brief: CADBrief = {
    name,
    description: prompt,
    shape,
    dimensions,
    material,
    manufacturing,
    features,
  };

  logger.info(MODULE, `Brief created`, {
    shape,
    dimensions,
    featureCount: features.length,
    material,
    manufacturing,
  });

  return brief;
}
