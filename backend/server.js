require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL || "";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "items.json");

let pool = null;
let pgAvailable = false;

try {
  const { Pool } = require("pg");
  if (DATABASE_URL) {
    pool = new Pool({ connectionString: DATABASE_URL });
    pgAvailable = true;
  }
} catch (error) {
  console.warn("PostgreSQL client not installed yet; falling back to file-based storage.");
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readItemsFromFile() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeItemsToFile(items) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

async function getItems() {
  if (pgAvailable && pool) {
    try {
      const result = await pool.query(
        "SELECT id, name, description, created_at AS \"createdAt\" FROM items ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      console.warn("Database query failed, using file store instead:", error.message);
    }
  }

  return readItemsFromFile();
}

async function addItem(item) {
  if (pgAvailable && pool) {
    try {
      const result = await pool.query(
        "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at AS \"createdAt\"",
        [item.name, item.description]
      );
      return result.rows[0];
    } catch (error) {
      console.warn("Database insert failed, using file store instead:", error.message);
    }
  }

  const items = readItemsFromFile();
  const newItem = {
    id: Date.now().toString(),
    name: item.name,
    description: item.description,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  writeItemsToFile(items);
  return newItem;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.url === "/health") {
    sendJson(res, 200, { status: "ok", service: "backend", storage: pgAvailable ? "postgres" : "file" });
    return;
  }

  if (req.method === "GET" && req.url === "/api/items") {
    const items = await getItems();
    sendJson(res, 200, { items });
    return;
  }

  if (req.method === "POST" && req.url === "/api/items") {
    try {
      const payload = await parseJsonBody(req);
      if (!payload.name || !payload.description) {
        sendJson(res, 400, { error: "name and description are required" });
        return;
      }

      const newItem = await addItem(payload);
      sendJson(res, 201, { item: newItem });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
