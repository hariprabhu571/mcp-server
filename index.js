const express = require("express");
const app = express();

app.use(express.json());

/* ===== MCP Tools List ===== */
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log("🔗 ChatGPT Connected via SSE");

  function sendEvent(data) {
    res.write(`event: mcp\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Initial handshake → tools.list will be called next
  sendEvent({
    jsonrpc: "2.0",
    method: "client.onConnect",
    params: {}
  });

  const keepAlive = setInterval(() => {
    sendEvent({
      jsonrpc: "2.0",
      method: "ping",
      params: {}
    });
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
    console.log("❌ ChatGPT Disconnected");
  });
});

/* ===== Tools Definition ===== */
app.post("/mcp", (req, res) => {
  const { method, id, params } = req.body;

  if (method === "tools.list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "ping",
            description: "Test connectivity",
            input_schema: {
              type: "object",
              properties: { message: { type: "string" }},
              required: ["message"]
            }
          },
          {
            name: "getMenu",
            description: "Get available sample food items",
            input_schema: {
              type: "object",
              properties: {},
              required: []
            }
          }
        ]
      }
    });
  }

  if (method === "tools.call") {
    const { name, arguments: args } = params;

    if (name === "ping") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: { reply: `PONG: ${args.message}` }
      });
    }

    if (name === "getMenu") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          items: [
            { name: "Classic Burger", price: 8.99 },
            { name: "Cheese Burger", price: 10.49 },
            { name: "Veggie Wrap", price: 7.99 }
          ]
        }
      });
    }
  }
});

/* ===== Start ===== */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 MCP SSE server running on port ${PORT}`);
});
