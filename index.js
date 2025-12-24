const express = require("express");
const app = express();

/* -----------------------------
   Middleware
-------------------------------- */
app.use(express.json());

/* -----------------------------
   ROOT ENDPOINT (REQUIRED)
   ChatGPT checks this first
-------------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    name: "NomNom MCP Server",
    status: "running"
  });
});

/* -----------------------------
   HEALTH CHECK (Render)
-------------------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* -----------------------------
   MCP TOOLS DEFINITION
   ChatGPT discovers tools here
-------------------------------- */
app.get("/tools", (req, res) => {
  res.json([
    {
      name: "listAvailableFoods",
      description: "List available foods near the user under a given price",
      input_schema: {
        type: "object",
        properties: {
          priceLimit: {
            type: "number",
            description: "Maximum price in dollars"
          }
        },
        required: []
      }
    }
  ]);
});

/* -----------------------------
   MCP TOOL EXECUTION (SSE)
   THIS IS THE IMPORTANT PART
-------------------------------- */
app.post("/mcp", (req, res) => {
  // REQUIRED HEADERS FOR MCP
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { tool, arguments: args } = req.body;

  if (tool === "listAvailableFoods") {
    const priceLimit = args?.priceLimit ?? 20;

    const result = {
      items: [
        { name: "Veg Burger", price: 8.99 },
        { name: "Chicken Burger", price: 12.49 }
      ].filter(item => item.price <= priceLimit)
    };

    // Send SSE message
    res.write(`data: ${JSON.stringify(result)}\n\n`);
    res.end();
    return;
  }

  // Unknown tool
  res.write(
    `data: ${JSON.stringify({ error: "Unknown tool" })}\n\n`
  );
  res.end();
});

/* -----------------------------
   START SERVER
-------------------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
