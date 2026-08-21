/**
 * HOS-Sec-Engine - Filesystem Safety Utilities
 *
 * Shared constants and helpers for safe recursive directory traversal:
 * - Depth limit protection (prevents stack overflow)
 * - Symlink loop detection (prevents infinite loops)
 * - Consistent realpath resolution
 */

import * as fs from 'fs';

/** Maximum recursion depth for directory scanning */
export const MAX_SCAN_DEPTH = 20;

/**
 * Resolve a path to its canonical realpath, returning null on failure.
 */
function resolveSafePath(dirPath: string): string | null {
  try {
    return fs.realpathSync(dirPath);
  } catch {
    return null;
  }
}

/**
 * Check whether a directory is safe to traverse.
 * Returns true if the directory is within depth limit and has no symlink loop.
 * Prints a warning and returns false otherwise.
 *
 * @param dirPath - The directory path to check
 * @param depth - Current recursion depth
 * @param visitedDirs - Set of already-visited canonical paths (for loop detection)
 * @param label - Optional label for warning messages (e.g., function name)
 */
export function isSafeToTraverse(
  dirPath: string,
  depth: number,
  visitedDirs: Set<string>,
  label: string = 'scan'
): boolean {
  // Depth limit protection
  if (depth > MAX_SCAN_DEPTH) {
    console.warn(`[${label}] Skipping directory exceeding max depth (${MAX_SCAN_DEPTH}): ${dirPath}`);
    return false;
  }

  // Symlink loop detection
  const realPath = resolveSafePath(dirPath);
  if (!realPath) {
    console.warn(`[${label}] Cannot resolve path, skipping: ${dirPath}`);
    return false;
  }

  if (visitedDirs.has(realPath)) {
    console.warn(`[${label}] Detected symlink loop, skipping: ${dirPath} -> ${realPath}`);
    return false;
  }

  visitedDirs.add(realPath);
  return true;
}
