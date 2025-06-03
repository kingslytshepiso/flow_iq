import { User, UserWithPassword } from "@/lib/db/database";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Initialize database
const dbPath = path.join(process.cwd(), "flow_iq.db");
console.log("Database path:", dbPath); // Log the database path

let db: any;
try {
  db = new Database(dbPath);
  console.log("Database connection successful");
} catch (error) {
  console.error("Database connection error:", error);
  throw error;
}

// Create users table if it doesn't exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Users table created/verified successfully");
} catch (error) {
  console.error("Error creating users table:", error);
  throw error;
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    console.log("Received request:", {
      action,
      data: { ...data, password: "[REDACTED]" },
    });

    switch (action) {
      case "register": {
        const { email, password, name } = data;
        console.log("Processing registration for:", email);

        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log("Password hashed successfully");

          const result = db
            .prepare(
              `
              INSERT INTO users (email, password, name)
              VALUES (?, ?, ?)
              RETURNING id, email, name, created_at, updated_at
            `
            )
            .get(email, hashedPassword, name) as User;

          console.log("User registered successfully:", {
            id: result.id,
            email: result.email,
          });
          return NextResponse.json({ user: result });
        } catch (error: any) {
          console.error("Registration error:", error);
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
