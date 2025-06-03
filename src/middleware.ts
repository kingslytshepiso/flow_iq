import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/", // Home page
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/me",
  "/api/db",
  "/api/db/users",
  "/api/db/auth",
];

// Define role-based route access
const roleBasedRoutes: Record<string, string[]> = {
  admin: [
    "/dashboard",
    "/cash-flow",
    "/inventory",
    "/reports",
    "/admin",
    "/admin/users",
    "/api/users",
  ],
  manager: [
    "/dashboard",
    "/cash-flow",
    "/inventory",
    "/reports",
    "/api/cash-flow",
    "/api/inventory",
    "/api/reports",
  ],
  accountant: [
    "/dashboard",
    "/cash-flow",
    "/reports",
    "/api/cash-flow",
    "/api/reports",
  ],
  inventory_manager: ["/dashboard", "/inventory", "/api/inventory"],
  viewer: ["/dashboard"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // Get the session token from cookies
  const sessionToken = request.cookies.get("auth_token")?.value;

  // If no session token, redirect to login
  if (!sessionToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Get user role from the session token
  // In a real application, you would verify the JWT token here
  // For now, we'll just check if the token exists
  try {
    // For now, we'll allow access to all authenticated routes
    // In a production environment, you would:
    // 1. Verify the JWT token
    // 2. Extract the user role from the token
    // 3. Check if the user has access to the requested route
    return NextResponse.next();
  } catch (error) {
    // If there's an error, redirect to login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth routes (to prevent circular dependencies)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/auth/).*)",
  ],
};
