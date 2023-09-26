import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { getSession } from "@/lib/queries"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/unauthenticated")
  }

  return (
    <div>
      <h1>Hello, {session.user.email}</h1>
    </div>
  )
}
