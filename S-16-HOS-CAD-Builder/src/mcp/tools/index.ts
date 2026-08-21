/**
 * Tool Registry: aggregates all MCP tools
 */

import { generateTool } from "./generate.js";
import { modifyTool } from "./modify.js";
import { exportTool } from "./export.js";
import { validateTool } from "./validate.js";
import { partsTool } from "./parts.js";
import { robotTool } from "./robot.js";

export const allTools = [
  generateTool,
  modifyTool,
  exportTool,
  validateTool,
  partsTool,
  robotTool,
];

export type ToolHandler = (args: Record<string, unknown>) => Promise<{
  content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
  isError?: boolean;
}>;

export function getToolHandler(name: string): ToolHandler | undefined {
  const tool = allTools.find((t) => t.name === name);
  return tool?.handler as ToolHandler | undefined;
}
