#!/usr/bin/env node
/**
 * HOS-Sec-Engine V4 - Server Command
 * Starts the Agent communication server
 * Usage: npx hos-sec-engine server --port 3000
 */

import { HosSecEngine } from '../core/engine';
import { ConfigLoader } from '../config/config-loader';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const portArg = args.findIndex(a => a === '--port' || a === '-p');
  const port = portArg >= 0 ? parseInt(args[portArg + 1], 10) : 3000;

  console.log('HOS-Sec-Engine V4 - Agent Server');
  console.log('================================');

  const engine = new HosSecEngine();

  // Load runtime config
  const configDir = ConfigLoader.getConfigDir();
  const runtimeConfigPath = path.join(configDir, 'runtime.json');
  const runtimeConfig = ConfigLoader.loadRuntimeConfig(runtimeConfigPath);
  const providerManager = ConfigLoader.loadProviders(configDir);

  await engine.initializeRuntime(runtimeConfig);

  console.log(`Starting server on port ${port}...`);
  await engine.startServer(port);

  console.log('Server is running. Press Ctrl+C to stop.');

  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await engine.stopServer();
    process.exit(0);
  });
}

main().catch(console.error);

export {};
