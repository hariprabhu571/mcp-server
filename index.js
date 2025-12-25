const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Define tools
const tools = [
  {
    name: "getMenuItems",
    description: "Get available food items",
    input_schema: {
      type: "object",
      properties: {
        brand: { type: "string" }
      },
      required: ["brand"]
    }
  }
];

// SSE endpoint required by ChatGPT
app.get("/.well-known/mcp", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Initial connection handshake event
  res.write(`event: mcp\n`);
  res.write(`data: ${JSON.stringify({
    jsonrpc: "2.0",
    method: "client.onConnect",
    params: {}
  })}\n\n`);

  console.log("🔌 SSE connection established with ChatGPT");

  // Keep alive every 25 seconds
  const keepAlive = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(keepAlive);
    console.log("❌ SSE connection closed by ChatGPT");
  });
});

// Tool listing endpoint
app.get("/tools", (req, res) => {
  res.json(tools);
});

// Execute tools
app.post("/execute", (req, res) => {
  const { tool, arguments: args } = req.body;

  if (tool === "getMenuItems") {
    return res.json({
      items: [
        { id: "1", name: "Classic Burger", price: 8.99 },
        { id: "2", name: "Cheese Burger", price: 10.49 },
        { id: "3", name: "Veggie Wrap", price: 7.99 }
      ]
    });
  }

  res.status(400).json({ error: "Unknown tool" });
});

// Simple status checks
app.get("/", (req, res) => res.send("MCP Server Online"));
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 MCP server running on ${PORT}`));
