"use client"

import { useRouter } from "next/navigation"
import {
  createClientComponentClient,
  type Session,
} from "@supabase/auth-helpers-nextjs"

import { Button } from "@/components/ui/button"
import { GithubIcon } from "@/components/icons/github-icon"

export const AuthButtonClient = ({ session }: { session: Session }) => {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div>
      {session === null ? (
        <Button onClick={handleSignIn}>
          <GithubIcon />
          Sign in with Github
        </Button>
      ) : (
        <Button onClick={handleSignOut} variant="outline">
          Sign out
        </Button>
      )}
    </div>
  )
}
