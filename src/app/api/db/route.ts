import { User, UserWithPassword } from "@/lib/db/database";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Initialize database
const dbPath = path.join(process.cwd(), "flow_iq.db");
console.log("Database path:", dbPath);

let db: any;
try {
  db = new Database(dbPath);
  console.log("Database connection successful");
} catch (error) {
  console.error("Database connection error:", error);
  throw error;
}

// Create tables if they don't exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      min_quantity INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id)
    );
  `);
  console.log("Tables created/verified successfully");
} catch (error) {
  console.error("Error creating tables:", error);
  throw error;
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    console.log("Received request:", {
      action,
      data: { ...data, password: data.password ? "[REDACTED]" : undefined },
    });

    switch (action) {
      // User actions
      case "register": {
        const { email, password, name } = data;
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const result = db
            .prepare(
              `
              INSERT INTO users (email, password, name)
              VALUES (?, ?, ?)
              RETURNING id, email, name, created_at, updated_at
            `
            )
            .get(email, hashedPassword, name) as User;

          return NextResponse.json({ user: result });
        } catch (error: any) {
          if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return NextResponse.json(
              { error: "Email already exists" },
              { status: 409 }
            );
          }
          throw error;
        }
      }

      case "login": {
        const { email, password } = data;
        const user = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(email) as UserWithPassword;

        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 401 }
          );
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return NextResponse.json(
            { error: "Invalid password" },
            { status: 401 }
          );
        }

        const { password: _, ...userWithoutPassword } = user;
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
          expiresIn: "7d",
        });

        return NextResponse.json({
          user: userWithoutPassword,
          token,
        });
      }

      case "getUser": {
        const { userId } = data;
        const user = db
          .prepare(
            "SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?"
          )
          .get(userId) as User;

        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ user });
      }

      // Cashflow actions
      case "addSale": {
        const { amount, description, userId } = data;
        const result = db
          .prepare(
            `
            INSERT INTO sales (amount, description, user_id)
            VALUES (?, ?, ?)
            RETURNING *
          `
          )
          .get(amount, description, userId);

        return NextResponse.json({ data: result });
      }

      case "addExpense": {
        const { amount, description, userId } = data;
        const result = db
          .prepare(
            `
            INSERT INTO expenses (amount, description, user_id)
            VALUES (?, ?, ?)
            RETURNING *
          `
          )
          .get(amount, description, userId);

        return NextResponse.json({ data: result });
      }

      case "getSalesByDateRange": {
        const { startDate, endDate, userId } = data;
        const sales = db
          .prepare(
            `
            SELECT * FROM sales 
            WHERE date BETWEEN ? AND ?
            AND user_id = ?
            ORDER BY date DESC
          `
          )
          .all(startDate, endDate, userId);

        return NextResponse.json({ data: sales });
      }

      case "getExpensesByDateRange": {
        const { startDate, endDate, userId } = data;
        const expenses = db
          .prepare(
            `
            SELECT * FROM expenses 
            WHERE date BETWEEN ? AND ?
            AND user_id = ?
            ORDER BY date DESC
          `
          )
          .all(startDate, endDate, userId);

        return NextResponse.json({ data: expenses });
      }

      case "getTotalSales": {
        const { startDate, endDate, userId } = data;
        const result = db
          .prepare(
            `
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM sales 
            WHERE date BETWEEN ? AND ?
            AND user_id = ?
          `
          )
          .get(startDate, endDate, userId);

        return NextResponse.json({ total: result.total });
      }

      case "getTotalExpenses": {
        const { startDate, endDate, userId } = data;
        const result = db
          .prepare(
            `
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM expenses 
            WHERE date BETWEEN ? AND ?
            AND user_id = ?
          `
          )
          .get(startDate, endDate, userId);

        return NextResponse.json({ total: result.total });
      }

      // Inventory actions
      case "addInventoryItem": {
        const { name, description, category, price } = data;
        const result = db
          .prepare(
            `
            INSERT INTO inventory_items (name, description, category, price)
            VALUES (?, ?, ?, ?)
            RETURNING *
          `
          )
          .get(name, description, category, price);

        return NextResponse.json({ data: result });
      }

      case "updateStockLevel": {
        const { itemId, newLevel } = data;
        const result = db
          .prepare(
            `
            INSERT INTO stock_levels (item_id, quantity)
            VALUES (?, ?)
            ON CONFLICT(item_id) DO UPDATE SET
              quantity = ?,
              updated_at = CURRENT_TIMESTAMP
            RETURNING *
          `
          )
          .get(itemId, newLevel, newLevel);

        return NextResponse.json({ data: result });
      }

      case "getInventoryItem": {
        const { itemId } = data;
        const item = db
          .prepare("SELECT * FROM inventory_items WHERE id = ?")
          .get(itemId);

        if (!item) {
          return NextResponse.json(
            { error: "Item not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ data: item });
      }

      case "getStockLevel": {
        const { itemId } = data;
        const stock = db
          .prepare("SELECT * FROM stock_levels WHERE item_id = ?")
          .get(itemId);

        if (!stock) {
          return NextResponse.json(
            { error: "Stock level not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ data: stock });
      }

      case "getItemsByCategory": {
        const { category } = data;
        const items = db
          .prepare("SELECT * FROM inventory_items WHERE category = ?")
          .all(category);

        return NextResponse.json({ data: items });
      }

      case "getLowStockItems": {
        const items = db
          .prepare(
            `
            SELECT i.*, s.quantity, s.min_quantity
            FROM inventory_items i
            JOIN stock_levels s ON i.id = s.item_id
            WHERE s.quantity <= s.min_quantity
          `
          )
          .all();

        return NextResponse.json({ data: items });
      }

      case "getTotalInventoryValue": {
        const result = db
          .prepare(
            `
            SELECT COALESCE(SUM(i.price * s.quantity), 0) as total
            FROM inventory_items i
            JOIN stock_levels s ON i.id = s.item_id
          `
          )
          .get();

        return NextResponse.json({ total: result.total });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
