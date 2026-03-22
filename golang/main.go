package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

type Input struct {
	Name string `json:"name" jsonschema:"the name of the person to greet"`
}

type Output struct {
	Greeting string `json:"greeting" jsonschema:"the greeting to tell to the user"`
}

func hello(ctx context.Context, req *mcp.CallToolRequest, input Input) (
	*mcp.CallToolResult,
	Output,
	error,
) {
	return nil, Output{
		Greeting: fmt.Sprintf("Hello, %s!", input.Name),
	}, nil
}

func main() {
	server := mcp.NewServer(
		&mcp.Implementation{
			Name:    "greeter",
			Version: "v1.0.0",
		},
		nil,
	)
	mcp.AddTool(
		server,
		&mcp.Tool{
			Name:        "greet",
			Description: "hello the user by name",
		},
		hello,
	)
	handler := mcp.NewStreamableHTTPHandler(
		func(req *http.Request) *mcp.Server {
			return server
		},
		&mcp.StreamableHTTPOptions{
			Stateless:                  true,
			JSONResponse:               true,
			DisableLocalhostProtection: true,
		},
	)
	err := http.ListenAndServe(
		":8080",
		handler,
	)
	if err != nil {
		log.Fatal(err)
	}
}
