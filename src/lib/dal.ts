import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { AuthService } from "./auth/auth.service";
import { UserWithPassword } from "./db/database";
import { decrypt } from "./session";

export const verifySession = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    console.log("Token from cookie:", token ? "Present" : "Missing");

    if (!token) {
      console.log("No auth token found in cookies");
      return { isAuth: false, error: "No token found" };
    }

    try {
      const payload = await decrypt(token);
      if (!payload) {
        console.error("Failed to decrypt token");
        return { isAuth: false, error: "Invalid token" };
      }

      console.log("Token verified successfully for userId:", payload.userId);
      return { isAuth: true, userId: payload.userId };
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return { isAuth: false, error: "Invalid token" };
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    return { isAuth: false, error: "Invalid session" };
  }
});

export const getUser = cache(async () => {
  console.log("getUser: Starting user retrieval");
  const session = await verifySession();
  console.log("getUser: Session verification result:", session);

  if (!session.isAuth || !session.userId) {
    console.log("getUser: No valid session or userId");
    return null;
  }

  try {
    const user = await AuthService.getUserById(session.userId);
    console.log("getUser: User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("getUser: User not found in database");
      return null;
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user as UserWithPassword;
    console.log(
      "getUser: Successfully retrieved user data for:",
      userWithoutPassword.email
    );
    return userWithoutPassword;
  } catch (error) {
    console.error("getUser: Failed to fetch user:", error);
    return null;
  }
});
