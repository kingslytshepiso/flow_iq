import { UserWithPassword } from "@/lib/db/database";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("GET /api/auth/me: Starting request");
  try {
    // Get session directly using the session library
    const session = await getSession();
    console.log(
      "GET /api/auth/me: Session check:",
      session ? "Found" : "Not found"
    );

    if (!session) {
      console.log("GET /api/auth/me: No valid session found");
      return NextResponse.json(
        { error: "Not authenticated", details: "No valid session found" },
        { status: 401 }
      );
    }

    // Construct absolute URL for the database API
    const baseUrl = new URL(request.url).origin;
    const response = await fetch(`${baseUrl}/api/db`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getUser",
        data: { userId: session.userId },
      }),
    });

    if (!response.ok) {
      console.log("GET /api/auth/me: Database API error:", response.status);
      return NextResponse.json(
        { error: "Failed to get user data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const user = data.user;

    if (!user) {
      console.log("GET /api/auth/me: User not found in database");
      return NextResponse.json(
        { error: "Not authenticated", details: "User not found" },
        { status: 401 }
      );
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user as UserWithPassword;
    console.log(
      "GET /api/auth/me: Successfully returning user data for:",
      userWithoutPassword.email
    );

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("GET /api/auth/me: Error processing request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
