import { redirect } from "next/navigation"

import { getSession } from "@/lib/get-session"

export default async function ResultsPage() {
  const session = await getSession()
  if (session === null) {
    redirect("/login")
  }

  return <div>page</div>
}
