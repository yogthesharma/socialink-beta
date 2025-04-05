import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth status for protected routes
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/(protected)");
  const isAdminRoute = req.nextUrl.pathname.startsWith("/(admin)");

  // Check if user is authenticated
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user is admin (you'll need to implement this logic based on your user roles)
  if (isAdminRoute) {
    // Placeholder for admin check - you'll need to customize this
    // TODO: I should be customizing this
    const isAdmin = session?.user?.email?.endsWith("@youradmindomain.com");

    if (!session || !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
