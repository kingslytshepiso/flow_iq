import { createSession, getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Construct absolute URL for the database API
    const baseUrl = new URL(request.url).origin;
    const response = await fetch(`${baseUrl}/api/db`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        data: { email, password },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session with user data
    const session = await createSession(data.user.id, data.user.email);

    // Create response with user data
    const result = NextResponse.json({
      user: data.user,
      success: true,
    });

    // Set cache control headers
    result.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    result.headers.set("Pragma", "no-cache");
    result.headers.set("Expires", "0");

    // Verify session was created
    const verifiedSession = await getSession();
    if (!verifiedSession) {
      throw new Error("Failed to create session");
    }

    console.log("Login successful, session created:", {
      userId: data.user.id,
      email: data.user.email,
    });

    return result;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
