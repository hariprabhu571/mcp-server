const express = require("express");
const app = express();
app.use(express.json());
let cart = [];


/* ----------------------------------------
   1️⃣ MCP ENTRYPOINT - MUST BE SSE
----------------------------------------- */
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Initial handshake event for MCP
  res.write(`event: ready\ndata: {}\n\n`);

  req.on("close", () => {
    res.end();
  });
});

/* ----------------------------------------
   2️⃣ List Tools for ChatGPT
----------------------------------------- */
app.get("/tools", (req, res) => {
  res.json([
    {
      name: "ping",
      description: "Test tool to verify MCP server works",
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
      description: "Get available menu items for the brand",
      input_schema: {
        type: "object",
        properties: {
          brand: {
            type: "string",
            description: "Restaurant brand name, ex: nommies"
          }
        },
        required: ["brand"]
      }
    },
    {
  name: "addToCart",
  description: "Add an item to the cart by item ID",
  input_schema: {
    type: "object",
    properties: {
      itemId: { type: "string" }
    },
    required: ["itemId"]
  }
},
{
  name: "getCart",
  description: "View all items currently in cart",
  input_schema: {
    type: "object",
    properties: {}
  }
},
{
  name: "findMealsForGroup",
  description: "Suggest food items for a group based on total budget",
  input_schema: {
    type: "object",
    properties: {
      people: { type: "number" },
      budget: { type: "number" }
    },
    required: ["people", "budget"]
  }
}


  ]);
});


/* ----------------------------------------
   3️⃣ Tool Execution (Mock Logic)
----------------------------------------- */
app.post("/execute", (req, res) => {
  const { tool, arguments: args } = req.body;

  if (tool === "getMenuItems") {
  const items = [
    { id: "item001", name: "Classic Burger", price: 8.99 },
    { id: "item002", name: "Cheese Burger", price: 10.49 },
    { id: "item003", name: "Veggie Wrap", price: 7.99 },
    { id: "item004", name: "Fries Combo", price: 5.49 }
  ];

  return res.json({ items });
}

if (tool === "addToCart") {
  const itemId = args.itemId;

  const menu = [
    { id: "item001", name: "Classic Burger", price: 8.99 },
    { id: "item002", name: "Cheese Burger", price: 10.49 },
    { id: "item003", name: "Veggie Wrap", price: 7.99 },
    { id: "item004", name: "Fries Combo", price: 5.49 }
  ];

  const item = menu.find(x => x.id === itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  cart.push(item);
  return res.json({ success: true, cart });
}

if (tool === "getCart") {
  return res.json({ cart });
}

if (tool === "findMealsForGroup") {
  const { people, budget } = args;

  const menu = [
    { id: "item001", name: "Classic Burger", price: 8.99 },
    { id: "item002", name: "Cheese Burger", price: 10.49 },
    { id: "item003", name: "Veggie Wrap", price: 7.99 },
    { id: "item004", name: "Fries Combo", price: 5.49 }
  ];

  const maxPerPerson = budget / people;
  const affordableItems = menu.filter(item => item.price <= maxPerPerson);

  return res.json({
    people,
    budget,
    maxPerPerson: Number(maxPerPerson.toFixed(2)),
    items: affordableItems
  });
}




  if (tool === "ping") {
    return res.json({
      reply: `MCP server received: ${args.message}`
    });
  }

  return res.status(400).json({ error: "Unknown tool" });
});

/* ----------------------------------------
   4️⃣ Start Server
----------------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCP server running on port ${PORT}`));
