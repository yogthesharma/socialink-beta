import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    // If there's no token, just render the confirm page
    // The page will handle showing the appropriate message
    return NextResponse.next();
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify the user's email with the token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      console.error("Error verifying email:", error);
      // Continue to the page, which will show an error
      return NextResponse.next();
    }

    // Success - redirect to the confirm page with success param
    return NextResponse.redirect(
      requestUrl.origin + "/auth/confirm?status=success"
    );
  } catch (error) {
    console.error("Error in confirmation handler:", error);
    // Continue to the page, which will show an error
    return NextResponse.next();
  }
}
