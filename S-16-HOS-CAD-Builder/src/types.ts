/**
 * HOS-CAD-Builder Type Definitions
 * Core types for the MCP Agent Skill pipeline
 */

// ─── CAD Brief ────────────────────────────────────────────────
export interface CADBrief {
  /** Human-readable model name */
  name: string;
  /** Natural language description */
  description: string;
  /** Primary shape category */
  shape: CADShape;
  /** Dimensional constraints (mm) */
  dimensions: Dimensions;
  /** Material hint */
  material?: string;
  /** Manufacturing method hint */
  manufacturing?: "3d_print" | "cnc" | "injection_mold" | "sheet_metal" | "none";
  /** Feature list extracted from the description */
  features: CADFeature[];
  /** Assembly parts (if multi-body) */
  assemblies?: AssemblyPart[];
}

export type CADShape =
  | "box"
  | "cylinder"
  | "sphere"
  | "cone"
  | "extrusion"
  | "revolve"
  | "loft"
  | "sweep"
  | "custom"
  | "assembly";

export interface Dimensions {
  width?: number;   // mm
  height?: number;  // mm
  depth?: number;   // mm
  radius?: number;  // mm
  length?: number;  // mm
}

export interface CADFeature {
  type: "hole" | "fillet" | "chamfer" | "pocket" | "slot" | "boss" | "rib" | "shell" | "pattern" | "mirror" | "cut";
  target?: string;
  params: Record<string, number | string | boolean>;
  description?: string;
}

export interface AssemblyPart {
  name: string;
  shape: CADShape;
  dimensions: Dimensions;
  position?: [number, number, number]; // [x, y, z] in mm
  rotation?: [number, number, number]; // [rx, ry, rz] in degrees
  features?: CADFeature[];
}

// ─── Geometric Operations ─────────────────────────────────────
export interface GeoOperation {
  op: "box" | "cylinder" | "sphere" | "cone" | "extrude" | "revolve" | "loft" | "sweep"
    | "fillet" | "chamfer" | "hole" | "cut" | "union" | "difference" | "intersect"
    | "pattern" | "mirror" | "shell" | "translate" | "rotate" | "scale";
  params: Record<string, number | string | boolean | number[]>;
  /** Reference to named shape for boolean operations */
  targets?: string[];
  /** Human-readable description of this operation */
  description?: string;
}

// ─── Pipeline State ───────────────────────────────────────────
export interface CADState {
  prompt: string;
  brief?: CADBrief;
  operations?: GeoOperation[];
  code?: string;
  result?: CADResult;
  validation?: ValidationResult;
}

export interface CADResult {
  /** Path to generated STEP file */
  stepPath?: string;
  /** Path to generated STL file */
  stlPath?: string;
  /** Path to generated 3MF file */
  threeMfPath?: string;
  /** Path to generated GLB file */
  glbPath?: string;
  /** Path to generated DXF file */
  dxfPath?: string;
  /** Path to generated URDF file */
  urdfPath?: string;
  /** Path to generated SRDF file */
  srdfPath?: string;
  /** Preview URL */
  previewUrl?: string;
  /** Build123d Python source code used */
  pythonCode?: string;
  /** Execution log */
  log?: string;
  /** Volume in mm³ */
  volume?: number;
  /** Surface area in mm² */
  surfaceArea?: number;
  /** Bounding box [w, h, d] in mm */
  boundingBox?: [number, number, number];
}

// ─── Validation ───────────────────────────────────────────────
export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
  warnings: string[];
  suggestions: string[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
}

// ─── Export Options ───────────────────────────────────────────
export type ExportFormat = "step" | "stl" | "3mf" | "glb" | "dxf" | "stp";

export interface ExportOptions {
  format: ExportFormat;
  /** STL: triangle count limit */
  maxTriangles?: number;
  /** STL: ASCII or binary */
  stlMode?: "ascii" | "binary";
  /** GLB: include materials */
  includeMaterials?: boolean;
  /** DXF: layer name */
  layerName?: string;
}

// ─── Parts Library ────────────────────────────────────────────
export interface PartsQuery {
  keyword: string;
  category?: string;
  maxResults?: number;
}

export interface PartsResult {
  id: string;
  name: string;
  description: string;
  category: string;
  stepUrl?: string;
  dimensions?: Dimensions;
}

// ─── Robot / URDF ─────────────────────────────────────────────
export interface URDFConfig {
  robotName: string;
  joints: URDFJoint[];
  links: URDFLink[];
  materials?: URDFMaterial[];
}

export interface URDFJoint {
  name: string;
  type: "revolute" | "continuous" | "prismatic" | "fixed" | "planar" | "floating";
  parent: string;
  child: string;
  origin?: { xyz: [number, number, number]; rpy: [number, number, number] };
  axis?: [number, number, number];
  limit?: { lower: number; upper: number; effort: number; velocity: number };
}

export interface URDFLink {
  name: string;
  visual?: { geometry: string; material?: string };
  collision?: { geometry: string };
  inertial?: { mass: number; origin?: [number, number, number] };
}

export interface URDFMaterial {
  name: string;
  color: [number, number, number, number]; // rgba 0-1
}

// ─── MCP Tool Result ──────────────────────────────────────────
export interface MCPToolResult {
  content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }>;
  isError?: boolean;
}
