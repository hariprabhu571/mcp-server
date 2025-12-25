const express = require("express");
const app = express();

app.use(express.json());

/*************************************
 * 1️⃣ MCP TOOL DEFINITIONS
 *************************************/
const tools = [
  {
    name: "ping",
    description: "Test tool to verify MCP server connection.",
    input_schema: {
      type: "object",
      properties: {
        message: { type: "string" }
      },
      required: ["message"]
    }
  },
  {
    name: "getMenuItems",
    description: "Mock: Get available menu for the brand",
    input_schema: {
      type: "object",
      properties: {
        brand: {
          type: "string",
          description: "Restaurant brand name"
        }
      },
      required: ["brand"]
    }
  }
];

/*************************************
 * 2️⃣ SSE STREAMING ENDPOINT (.well-known/mcp)
 *************************************/
app.get("/.well-known/mcp", (req, res) => {
  console.log("🔌 ChatGPT connected via MCP SSE");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Required initial handshake event
  res.write(`event: mcp\n`);
  res.write(`data: ${JSON.stringify({
    jsonrpc: "2.0",
    method: "client.onConnect",
    params: {}
  })}\n\n`);

  // Keep connection open (heartbeat)
  const interval = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(interval);
    console.log("❌ ChatGPT disconnected");
  });
});

/*************************************
 * 3️⃣ MCP TOOL REQUEST — POST /execute
 *************************************/
app.post("/execute", (req, res) => {
  const { tool, arguments: args } = req.body;
  console.log("🔧 Tool Execute:", tool, args);

  if (tool === "ping") {
    return res.json({
      result: { reply: `pong: ${args.message}` }
    });
  }

  if (tool === "getMenuItems") {
    return res.json({
      result: {
        items: [
          { id: "item001", name: "Classic Burger", price: 8.99 },
          { id: "item002", name: "Cheese Burger", price: 10.49 },
          { id: "item003", name: "Veggie Wrap", price: 7.99 }
        ]
      }
    });
  }

  res.status(400).json({ error: "Unknown tool" });
});

/*************************************
 * 4️⃣ GET /tools → ChatGPT uses this
 *************************************/
app.get("/tools", (req, res) => {
  res.json(tools);
});

/*************************************
 * 5️⃣ Health + Root Check
 *************************************/
app.get("/", (req, res) => {
  res.send("MCP Server Live");
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

/*************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 MCP server running at port ${PORT}`)
);
