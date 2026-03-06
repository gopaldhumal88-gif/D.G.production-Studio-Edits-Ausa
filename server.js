const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

const dbPath = path.join(__dirname, "dg-production.db");
const db = new sqlite3.Database(dbPath);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const countRow = await get("SELECT COUNT(*) AS count FROM gallery_items");
  if (countRow && countRow.count === 0) {
    const seeds = [
      {
        title: "Royal Wedding",
        category: "wedding",
        url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Studio Portrait",
        category: "studio",
        url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Maternity Story",
        category: "maternity",
        url: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Candid Couple",
        category: "wedding",
        url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Baby Session",
        category: "studio",
        url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80"
      }
    ];

    for (const item of seeds) {
      await run(
        "INSERT INTO gallery_items (title, category, url) VALUES (?, ?, ?)",
        [item.title, item.category, item.url]
      );
    }
  }
}

function requireAdmin(req, res, next) {
  const user = req.header("x-admin-user");
  const pass = req.header("x-admin-pass");
  if (user === ADMIN_USER && pass === ADMIN_PASS) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

app.get("/api/gallery", async (req, res) => {
  try {
    const category = (req.query.category || "all").toString();
    const sql =
      category === "all"
        ? "SELECT id, title, category, url, created_at FROM gallery_items ORDER BY id DESC"
        : "SELECT id, title, category, url, created_at FROM gallery_items WHERE category = ? ORDER BY id DESC";
    const params = category === "all" ? [] : [category];
    const rows = await all(sql, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch gallery items" });
  }
});

app.post("/api/gallery", requireAdmin, async (req, res) => {
  try {
    const title = (req.body.title || "").toString().trim();
    const category = (req.body.category || "").toString().trim();
    const url = (req.body.url || "").toString().trim();

    if (!title || !category || !url) {
      return res.status(400).json({ error: "title, category and url are required" });
    }

    const insert = await run(
      "INSERT INTO gallery_items (title, category, url) VALUES (?, ?, ?)",
      [title, category, url]
    );
    const row = await get(
      "SELECT id, title, category, url, created_at FROM gallery_items WHERE id = ?",
      [insert.lastID]
    );
    return res.status(201).json(row);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create gallery item" });
  }
});

app.delete("/api/gallery/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id" });

    const result = await run("DELETE FROM gallery_items WHERE id = ?", [id]);
    if (!result.changes) return res.status(404).json({ error: "Item not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete gallery item" });
  }
});

app.post("/api/inquiries", async (req, res) => {
  try {
    const name = (req.body.name || "").toString().trim();
    const email = (req.body.email || "").toString().trim();
    const phone = (req.body.phone || "").toString().trim();
    const message = (req.body.message || "").toString().trim();

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await run(
      "INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)",
      [name, email, phone, message]
    );
    return res.status(201).json({ ok: true, message: "Inquiry submitted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

app.get("/api/inquiries", requireAdmin, async (req, res) => {
  try {
    const rows = await all(
      "SELECT id, name, email, phone, message, created_at FROM inquiries ORDER BY id DESC"
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

app.delete("/api/inquiries/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id" });
    const result = await run("DELETE FROM inquiries WHERE id = ?", [id]);
    if (!result.changes) return res.status(404).json({ error: "Inquiry not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

app.use(express.static(__dirname));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DG Production server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
