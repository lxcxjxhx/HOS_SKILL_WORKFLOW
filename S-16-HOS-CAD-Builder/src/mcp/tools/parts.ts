/**
 * MCP Tool: cad_parts_find
 * Search for standard parts and components
 */

import { logger } from "../../utils/logging.js";

const MODULE = "tool:cad_parts_find";

/** Built-in standard parts library (expandable) */
interface StandardPart {
  id: string;
  name: string;
  description: string;
  category: string;
  dimensions: Record<string, number>;
  tags: string[];
  buildCode: string; // build123d code snippet
}

const STANDARD_PARTS: StandardPart[] = [
  {
    id: "spc-m3-bolt",
    name: "M3 Hex Bolt",
    description: "Standard M3 hex head bolt, length 10mm",
    category: "fastener",
    dimensions: { diameter: 3, length: 10 },
    tags: ["bolt", "hex", "m3", "fastener"],
    buildCode: `with BuildPart() as bolt:
    Cylinder(radius=1.5, height=10)
    with Locations(Location((0, 0, 10))):
        Hexagon(radius=5.5/2, height=2)`,
  },
  {
    id: "spc-m3-nut",
    name: "M3 Hex Nut",
    description: "Standard M3 hex nut",
    category: "fastener",
    dimensions: { diameter: 3, height: 2.4 },
    tags: ["nut", "hex", "m3", "fastener"],
    buildCode: `with BuildPart() as nut:
    Hexagon(radius=5.5/2, height=2.4)
    Cylinder(radius=1.5, height=2.4, mode=Mode.SUBTRACT)`,
  },
  {
    id: "spc-m3-washer",
    name: "M3 Flat Washer",
    description: "Standard M3 flat washer",
    category: "fastener",
    dimensions: { outerDiameter: 7, innerDiameter: 3.2, thickness: 0.5 },
    tags: ["washer", "flat", "m3", "fastener"],
    buildCode: `with BuildPart() as washer:
    Cylinder(radius=7/2, height=0.5)
    Cylinder(radius=1.6, height=0.5, mode=Mode.SUBTRACT)`,
  },
  {
    id: "spc-bearing-608",
    name: "608 Skate Bearing",
    description: "608-2RS bearing, 8mm bore, 22mm OD, 7mm width",
    category: "bearing",
    dimensions: { bore: 8, outerDiameter: 22, width: 7 },
    tags: ["bearing", "608", "skate"],
    buildCode: `with BuildPart() as bearing:
    Cylinder(radius=11, height=7)
    Cylinder(radius=4, height=7, mode=Mode.SUBTRACT)`,
  },
  {
    id: "spc-shaft-d8",
    name: "D8 Smooth Rod",
    description: "8mm diameter smooth shaft/rod, 100mm length",
    category: "shaft",
    dimensions: { diameter: 8, length: 100 },
    tags: ["shaft", "rod", "smooth", "linear"],
    buildCode: `with BuildPart() as shaft:
    Cylinder(radius=4, height=100)`,
  },
  {
    id: "spc-nema17",
    name: "NEMA 17 Motor Mount",
    description: "NEMA 17 stepper motor mounting bracket (L-bracket)",
    category: "motor",
    dimensions: { width: 42, height: 42, mountHoles: 31 },
    tags: ["nema17", "stepper", "motor", "mount"],
    buildCode: `with BuildPart() as mount:
    Box(42, 42, 3)
    with Locations(Location((0, 0, 0))):
        Hole(radius=22/2, depth=3)
    for pos in [(-15.5, -15.5), (15.5, -15.5), (-15.5, 15.5), (15.5, 15.5)]:
        with Locations(Location((pos[0], pos[1], 0))):
            Hole(radius=1.5, depth=3)`,
  },
  {
    id: "spc-hinge-25mm",
    name: "25mm Cabinet Hinge",
    description: "Simple barrel hinge, 25mm wide",
    category: "hinge",
    dimensions: { width: 25, pinDiameter: 4 },
    tags: ["hinge", "barrel", "cabinet"],
    buildCode: `with BuildPart() as hinge:
    Box(25, 10, 5)
    with Locations(Location((0, 5, 2.5))):
        Cylinder(radius=2, height=25, rotation=(0, 90, 0))`,
  },
];

/** Search the parts library */
function searchParts(keyword: string, category?: string, maxResults: number = 5): StandardPart[] {
  const lower = keyword.toLowerCase();
  let results = STANDARD_PARTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.includes(lower)),
  );

  if (category) {
    results = results.filter((p) => p.category === category);
  }

  return results.slice(0, maxResults);
}

export const partsTool = {
  name: "cad_parts_find",
  description:
    "Search for standard mechanical parts (fasteners, bearings, shafts, motors, etc.). " +
    "Returns part details and build123d code snippets for integration into your CAD model.",
  inputSchema: {
    type: "object" as const,
    properties: {
      keyword: {
        type: "string",
        description: 'Search keyword (e.g., "M3 bolt", "bearing", "NEMA 17")',
      },
      category: {
        type: "string",
        enum: ["fastener", "bearing", "shaft", "motor", "hinge", "all"],
        description: "Filter by category",
      },
      max_results: {
        type: "number",
        default: 5,
        description: "Maximum number of results",
      },
    },
    required: ["keyword"],
  },

  async handler(args: { keyword: string; category?: string; max_results?: number }) {
    logger.info(MODULE, `Searching parts: "${args.keyword}"`);

    try {
      const category = args.category === "all" ? undefined : args.category;
      const parts = searchParts(args.keyword, category, args.max_results ?? 5);

      if (parts.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No parts found matching "${args.keyword}". Available categories: fastener, bearing, shaft, motor, hinge.`,
            },
          ],
          isError: false,
        };
      }

      const lines: string[] = [`## Found ${parts.length} part(s)\n`];

      for (const part of parts) {
        lines.push(`### ${part.name} (${part.id})`);
        lines.push(`- **Description**: ${part.description}`);
        lines.push(`- **Category**: ${part.category}`);
        lines.push(`- **Dimensions**: ${JSON.stringify(part.dimensions)}`);
        lines.push(`\n\`\`\`python\n${part.buildCode}\n\`\`\`\n`);
      }

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
        isError: false,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(MODULE, `Parts search failed: ${msg}`);
      return {
        content: [{ type: "text" as const, text: `**Error**: ${msg}` }],
        isError: true,
      };
    }
  },
};
