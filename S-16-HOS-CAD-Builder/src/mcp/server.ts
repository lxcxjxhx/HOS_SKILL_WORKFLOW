/**
 * MCP Server Setup
 *
 * Initializes the Model Context Protocol server with all CAD tools
 * using the official @modelcontextprotocol/sdk.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { allTools } from "./tools/index.js";
import { logger } from "../utils/logging.js";

const MODULE = "MCPServer";

export async function createServer(): Promise<McpServer> {
  logger.info(MODULE, "Creating MCP server");

  const server = new McpServer({
    name: "hos-cad-builder",
    version: "1.0.0",
  });

  // Register each tool
  for (const tool of allTools) {
    logger.debug(MODULE, `Registering tool: ${tool.name}`);

    // Build the input schema properties for MCP SDK
    const inputSchema: Record<string, any> = {};
    const schemaProps = tool.inputSchema.properties as Record<string, any>;
    const required = (tool.inputSchema.required as string[]) ?? [];

    for (const [key, prop] of Object.entries(schemaProps)) {
      inputSchema[key] = {
        type: prop.type ?? "string",
        description: prop.description ?? "",
        ...(prop.enum ? { enum: prop.enum } : {}),
        ...(prop.default !== undefined ? { default: prop.default } : {}),
        ...(prop.items ? { items: prop.items } : {}),
      };
    }

    server.tool(
      tool.name,
      tool.description,
      inputSchema,
      async (args: Record<string, unknown>) => {
        try {
          logger.info(MODULE, `Executing tool: ${tool.name}`);
          const result = await (tool.handler as Function)(args);
          logger.info(MODULE, `Tool ${tool.name} completed (isError=${result.isError})`);
          return result;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          logger.error(MODULE, `Tool ${tool.name} failed: ${msg}`);
          return {
            content: [{ type: "text" as const, text: `Error in ${tool.name}: ${msg}` }],
            isError: true,
          };
        }
      },
    );
  }

  logger.info(MODULE, `Registered ${allTools.length} tools`);
  return server;
}

/**
 * Start the MCP server with stdio transport
 */
export async function startServer(): Promise<void> {
  const server = await createServer();
  const transport = new StdioServerTransport();

  logger.info(MODULE, "Starting MCP server on stdio transport");

  await server.connect(transport);

  logger.info(MODULE, "MCP server is running");
}
