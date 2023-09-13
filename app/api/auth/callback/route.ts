import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

// prevents static cache of this route, always executed server-side
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    // the URL code returns the user session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // //   return NextResponse.redirect(requestUrl.origin)
  return NextResponse.redirect(requestUrl.origin)
}
