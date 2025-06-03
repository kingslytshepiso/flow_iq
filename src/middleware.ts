import jwt from "jsonwebtoken";
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
    "/api/cashflow",
    "/api/inventory",
    "/api/reports",
  ],
  manager: [
    "/dashboard",
    "/cash-flow",
    "/inventory",
    "/reports",
    "/api/cashflow",
    "/api/inventory",
    "/api/reports",
  ],
  accountant: [
    "/dashboard",
    "/cash-flow",
    "/reports",
    "/api/cashflow",
    "/api/reports",
  ],
  inventory_manager: ["/dashboard", "/inventory", "/api/inventory"],
  viewer: ["/dashboard"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get user role from token
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      userId: string;
      role: string;
    };

    // Check if user has access to the route
    const allowedRoutes = roleBasedRoutes[decoded.role] || [];
    if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
