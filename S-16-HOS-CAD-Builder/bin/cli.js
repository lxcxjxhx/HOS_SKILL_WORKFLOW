#!/usr/bin/env node
/**
 * HOS-CAD-Builder CLI Entry Point
 */

const path = require("path");
const { execSync } = require("child_process");

const distPath = path.join(__dirname, "..", "dist", "index.js");

// Check if dist exists, if not try to build
const fs = require("fs");
if (!fs.existsSync(distPath)) {
  console.log("Building TypeScript...");
  try {
    execSync("npm run build", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
  } catch (e) {
    console.error("Build failed. Please run: npm run build");
    process.exit(1);
  }
}

// Start the server
require(distPath);
