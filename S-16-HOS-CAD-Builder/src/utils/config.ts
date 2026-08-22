/**
 * Configuration management for HOS-CAD-Builder
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

export interface CADBuilderConfig {
  /** Python executable path */
  pythonPath: string;
  /** Working directory for temp files */
  workDir: string;
  /** Output directory for generated files */
  outputDir: string;
  /** Default export formats */
  defaultFormats: string[];
  /** Maximum execution timeout in ms */
  executionTimeout: number;
  /** build123d Python module path */
  build123dPath?: string;
}

const DEFAULT_CONFIG: CADBuilderConfig = {
  pythonPath: "python",
  workDir: join(process.cwd(), "temp"),
  outputDir: join(process.cwd(), "output"),
  defaultFormats: ["step"],
  executionTimeout: 60000,
};

let _config: CADBuilderConfig | null = null;

export function getConfig(): CADBuilderConfig {
  if (_config) return _config;

  // Try to load from environment
  const envConfig: Partial<CADBuilderConfig> = {};
  if (process.env.CAD_BUILDER_PYTHON) envConfig.pythonPath = process.env.CAD_BUILDER_PYTHON;
  if (process.env.CAD_BUILDER_WORK_DIR) envConfig.workDir = process.env.CAD_BUILDER_WORK_DIR;
  if (process.env.CAD_BUILDER_OUTPUT_DIR) envConfig.outputDir = process.env.CAD_BUILDER_OUTPUT_DIR;
  if (process.env.CAD_BUILDER_TIMEOUT) envConfig.executionTimeout = parseInt(process.env.CAD_BUILDER_TIMEOUT, 10);

  _config = { ...DEFAULT_CONFIG, ...envConfig };

  // Ensure directories exist
  for (const dir of [_config.workDir, _config.outputDir]) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  return _config;
}

export function resetConfig(overrides?: Partial<CADBuilderConfig>): CADBuilderConfig {
  _config = { ...DEFAULT_CONFIG, ...overrides };
  return _config;
}
