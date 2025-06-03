import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Attempting to register user:", { email, name });

    // Call the database API to register the user
    const dbResponse = await fetch(new URL("/api/db", request.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        action: "register",
        data: { email, password, name },
      }),
    });

    console.log("Database API response status:", dbResponse.status);
    console.log(
      "Database API response headers:",
      Object.fromEntries(dbResponse.headers.entries())
    );

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text();
      console.error("Database API error response:", errorText);
      return NextResponse.json(
        { error: "Registration failed" },
        { status: dbResponse.status }
      );
    }

    const dbData = await dbResponse.json();
    console.log("Database API response data:", dbData);

    if (!dbData.user) {
      console.error("Invalid database response:", dbData);
      return NextResponse.json(
        { error: "Invalid response from database" },
        { status: 500 }
      );
    }

    console.log("User registered successfully:", { email: dbData.user.email });

    // Generate JWT token
    const token = jwt.sign(
      { userId: dbData.user.id },
      process.env.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "7d",
      }
    );

    // Set the token in an HTTP-only cookie
    const response = NextResponse.json({ user: dbData.user }, { status: 201 });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
