/**
 * Temporary file management for HOS-CAD-Builder
 */
import { mkdtempSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getConfig } from "./config.js";
import { logger } from "./logging.js";

const MODULE = "temp-files";

/**
 * Create a temporary directory for a CAD operation
 */
export function createTempDir(prefix: string = "cad-"): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  logger.debug(MODULE, `Created temp dir: ${dir}`);
  return dir;
}

/**
 * Write content to a temporary file and return its path
 */
export function writeTempFile(
  content: string,
  filename: string,
  dir?: string,
): string {
  const baseDir = dir ?? getConfig().workDir;
  if (!existsSync(baseDir)) {
    mkdtempSync(join(tmpdir(), "cad-"));
  }
  const filePath = join(baseDir, filename);
  writeFileSync(filePath, content, "utf-8");
  logger.debug(MODULE, `Wrote temp file: ${filePath}`);
  return filePath;
}

/**
 * Clean up a temporary directory
 */
export function cleanupTempDir(dir: string): void {
  try {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
      logger.debug(MODULE, `Cleaned up temp dir: ${dir}`);
    }
  } catch (err) {
    logger.warn(MODULE, `Failed to clean temp dir: ${dir}`, err);
  }
}

/**
 * Generate a unique filename with timestamp and random suffix
 */
export function uniqueFilename(base: string, ext: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${ts}-${rand}.${ext}`;
}
