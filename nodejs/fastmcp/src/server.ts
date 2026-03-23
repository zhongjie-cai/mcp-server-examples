import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
  name: "Demo",
  version: "1.0.0",
});

server.addTool({
  name: "greet-user",
  description: "Greet user",
  parameters: z.object({
    name: z.string(),
  }),
  execute: async ({ name }) => {
    return String("Hello, " + name + "!");
  },
});

server.start({
  transportType: "httpStream",
  httpStream: { host: "0.0.0.0", port: 8080 },
});
