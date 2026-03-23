import mcp

from mcp.server.fastmcp import FastMCP


mcp = FastMCP("Demo", port=8080, host="0.0.0.0")


@mcp.tool()
def greet(name: str) -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
