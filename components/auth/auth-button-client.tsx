"use client"

import { useRouter } from "next/navigation"
import { Button } from "@nextui-org/react"
import {
  createClientComponentClient,
  type Session,
} from "@supabase/auth-helpers-nextjs"

import { GithubIcon } from "@/components/icons/github-icon"

export const AuthButtonClient = ({ session }: { session: Session }) => {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: "laanayam333@gmail.com",
      options: {
        emailRedirectTo: window.location.origin,
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
        <Button onClick={handleSignIn} variant="solid" color="primary">
          <GithubIcon />
          Sign in with Github
        </Button>
      ) : (
        <Button onClick={handleSignOut} variant="solid" color="primary">
          Sign out
        </Button>
      )}
    </div>
  )
}
