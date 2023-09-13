import { getSession } from "@/lib/get-session"
import { AuthButtonClient } from "@/components/auth/auth-button-client"

export const AuthButtonServer = async () => {
  const session = await getSession()
  return <AuthButtonClient session={session!} />
}
