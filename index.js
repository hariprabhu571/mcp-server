const express = require("express");
const app = express();

app.use(express.json());

/* -----------------------------
   1. MCP TOOLS DEFINITION
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
   2. MCP TOOL EXECUTION
-------------------------------- */
app.post("/mcp", (req, res) => {
  const { tool, arguments: args } = req.body;

  if (tool === "listAvailableFoods") {
    const priceLimit = args?.priceLimit ?? 20;

    return res.json({
      items: [
        { name: "Veg Burger", price: 8.99 },
        { name: "Chicken Burger", price: 12.49 }
      ].filter(item => item.price <= priceLimit)
    });
  }

  return res.status(400).json({
    error: "Unknown tool"
  });
});

/* -----------------------------
   3. HEALTH CHECK
-------------------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* -----------------------------
   4. START SERVER
-------------------------------- */
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.status(200).json({
    name: "NomNom MCP Server",
    status: "running"
  });
});


app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});


