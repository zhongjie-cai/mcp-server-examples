from mcp.server.mcpserver import MCPServer


mcp = MCPServer("Demo")


@mcp.tool()
def greet(name: str) -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    mcp.run(transport="streamable-http", json_response=True)
