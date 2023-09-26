import { getSession } from "@/lib/queries"
import { AuthInputClient } from "@/components/auth/auth-input-client"

export const AuthButtonServer = async () => {
  const session = await getSession()
  return <AuthInputClient session={session!} />
}
