import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer } from "@modelcontextprotocol/server";
import type { Request, Response } from "express";
import * as z from "zod/v4";

const getServer = () => {
  // Create an MCP server with implementation details
  const server = new McpServer(
    {
      name: "Demo",
      version: "1.0.0",
    },
    { capabilities: { logging: {} } },
  );

  // Register a tool specifically for testing resumability
  server.registerTool(
    "greet-user",
    {
      description: "Greet a user",
      inputSchema: z.object({
        name: z.string(),
      }),
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: `Hello, ${name}!`,
          },
        ],
      };
    },
  );

  return server;
};

const app = createMcpExpressApp();

app.post("/mcp", async (req: Request, res: Response) => {
  const server = getServer();
  try {
    const transport: NodeStreamableHTTPServerTransport =
      new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32_603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req: Request, res: Response) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32_000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

app.delete("/mcp", async (req: Request, res: Response) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32_000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

// Start the server
const PORT = 8080;
app.listen(PORT, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
});
