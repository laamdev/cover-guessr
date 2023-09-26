import { redirect } from "next/navigation"

import { getSession } from "@/lib/queries"
import { AuthInputClient } from "@/components/auth/auth-input-client"

export default async function Unauthenticated() {
  const session = await getSession()
  if (session) {
    redirect("/")
  }

  return (
    <div>
      <p>Please sign in to see your profile.</p>

      <div className="mt-10 flex items-center justify-center gap-x-5">
        <AuthInputClient session={session!} />
      </div>
    </div>
  )
}
