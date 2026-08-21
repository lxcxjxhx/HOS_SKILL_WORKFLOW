#!/usr/bin/env node
/**
 * HOS-Sec-Engine V4 - CLI Entry
 */

const command = process.argv[2];

switch (command) {
  case 'server':
    require('./server-command');
    break;
  case 'run':
    require('./run-command');
    break;
  default:
    console.log(`
HOS-Sec-Engine V4 CLI

Usage:
  npx hos-sec-engine <command> [options]

Commands:
  server    Start Agent communication server
  run       Execute Skills independently

Run "npx hos-sec-engine <command> --help" for more information.
    `);
}

export {};
