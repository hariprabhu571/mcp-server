#!/usr/bin/env node
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ServerWebSocketTransport } from "@modelcontextprotocol/sdk/server/websocket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTTP_PORT = process.env.PORT || 3000;

// Serve manifest.json
const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.listen(HTTP_PORT, () => {
  console.log(`🌐 HTTP server running at http://localhost:${HTTP_PORT}`);
});

// MCP Server (WebSocket)
const wss = new WebSocketServer({ noServer: true });

const mcpServer = new Server(
  {
    name: "bmi-mcp-server",
    version: "1.0.0"
  }
);

// Add BMI Calculation Tool
mcpServer.tool(
  {
    name: "calculate_bmi",
    description: "Calculate BMI using weight (kg) and height (meters).",
    inputSchema: {
      type: "object",
      properties: {
        weight: { type: "number", description: "Weight in kilograms" },
        height: { type: "number", description: "Height in meters" }
      },
      required: ["weight", "height"]
    }
  },
  async ({ weight, height }) => {
    if (weight <= 0) return { content: [{ type: "text", text: "❌ Weight must be > 0" }] };
    if (height <= 0) return { content: [{ type: "text", text: "❌ Height must be > 0" }] };

    const bmi = weight / (height * height);
    let category = "Unknown";

    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obesity";

    return {
      content: [
        { type: "text", text: `Your BMI is ${bmi.toFixed(2)} (${category}).` }
      ]
    };
  }
);

// Upgrade to WS when ChatGPT connects
app.on("upgrade", (req, socket, head) => {
  if (req.url !== "/ws") {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, ws => {
    const transport = new ServerWebSocketTransport(ws);
    mcpServer.connect(transport);
  });
});

console.log("🚀 MCP BMI server is ready!");
console.log("🛰 WebSocket WS endpoint: /ws");
