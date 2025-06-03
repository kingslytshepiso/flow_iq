import jwt from "jsonwebtoken";
import { User } from "../db/database";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class AuthService {
  static async register(
    email: string,
    password: string,
    name?: string
  ): Promise<User> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        data: { email, password, name },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to register");
    }

    return data.user;
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        data: { email, password },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to login");
    }

    return data;
  }

  static async getUserById(id: number): Promise<User | null> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getUser",
        data: { userId: id },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(data.error || "Failed to get user");
    }

    return data.user;
  }

  static verifyToken(token: string): { userId: number } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
