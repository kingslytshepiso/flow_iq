import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import "server-only";

// Define session payload type
export interface SessionPayload extends JWTPayload {
  userId: number;
  email: string;
  expiresAt: Date;
}

// Get the secret key from environment variable
const secretKey = process.env.JWT_SECRET || "your-secret-key";
const encodedKey = new TextEncoder().encode(secretKey);

// Encrypt session data
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

// Decrypt session data
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.log("Failed to verify session");
    return null;
  }
}

// Create a new session
export async function createSession(userId: number, email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, email, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("auth_token", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  console.log("Session created:", {
    userId,
    email,
    expiresAt,
  });

  return session;
}

// Update session expiration
export async function updateSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_token")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newSession = await encrypt({
    userId: payload.userId,
    email: payload.email,
    expiresAt,
  });

  cookieStore.set("auth_token", newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return newSession;
}

// Delete session
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

// Get current session
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_token")?.value;
  return session ? await decrypt(session) : null;
}
