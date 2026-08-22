#!/usr/bin/env node
/**
 * HOS-CAD-Builder — MCP Agent Skill for AI-driven CAD
 *
 * Entry point: starts the MCP server and exposes CAD tools
 * to any MCP-compatible AI agent or IDE.
 *
 * Tools provided:
 *   - cad_generate: Natural language → 3D CAD model
 *   - cad_modify:   Incrementally modify existing models
 *   - cad_export:   Export to STEP/STL/3MF/GLB/DXF
 *   - cad_validate: Check printability & wall thickness
 *   - cad_parts_find: Search standard parts library
 *   - cad_robot_urdf: Generate URDF/SRDF robot files
 */

import { startServer } from "./mcp/server.js";
import { checkPythonEnvironment } from "./execution/python-bridge.js";
import { logger } from "./utils/logging.js";

const MODULE = "main";

async function main(): Promise<void> {
  logger.info(MODULE, "HOS-CAD-Builder starting...");

  // Check Python + build123d availability
  const env = await checkPythonEnvironment();
  if (!env.pythonAvailable) {
    logger.warn(MODULE, "⚠️  Python not found. CAD generation will fail.");
    logger.warn(MODULE, "   Install Python 3.10+ and ensure it's on PATH.");
  } else {
    logger.info(MODULE, `Python ${env.pythonVersion} detected`);
  }

  if (!env.build123dAvailable) {
    logger.warn(MODULE, "⚠️  build123d not installed. CAD generation will fail.");
    logger.warn(MODULE, "   Install with: pip install build123d");
  } else {
    logger.info(MODULE, `build123d ${env.build123dVersion} detected`);
  }

  // Start MCP server
  await startServer();
}

main().catch((err) => {
  logger.error(MODULE, `Fatal error: ${err.message}`);
  process.exit(1);
});
