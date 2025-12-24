const express = require("express");
const app = express();

app.use(express.json());

/* -----------------------------
   MCP ENTRYPOINT (SSE)
   THIS IS WHAT CHATGPT CALLS
-------------------------------- */
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Initial handshake
  res.write(`event: ready\ndata: {}\n\n`);

  // Listen for tool calls
  req.on("close", () => {
    res.end();
  });
});

/* -----------------------------
   MCP TOOLS DISCOVERY
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
            type: "number"
          }
        }
      }
    }
  ]);
});

/* -----------------------------
   HEALTH CHECK (Render)
-------------------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* -----------------------------
   START SERVER
-------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
