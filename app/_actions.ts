"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

import { SignInInputs, SignInSchema } from "@/lib/schema"

export const signInAction = async (data: SignInInputs) => {
  const result = SignInSchema.safeParse(data)

  if (result.success) {
    const email = result.data.email
    const username = email.toString().split("@")[0]

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://cover-guessr.vercel.app"

    const supabase = createServerActionClient({ cookies })

    await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${baseUrl}/api/auth/callback`,
        data: {
          username: username,
        },
      },
    })

    return { success: true, data: result.data }
  }

  if (result.error) {
    return { success: false, error: result.error.format() }
  }
}

export const signOutAction = async () => {
  const supabase = createServerActionClient({ cookies })

  await supabase.auth.signOut()
  revalidatePath("/")
}

export const addScoreAction = async ({
  currentUserId,
  points,
  category,
}: {
  currentUserId: string
  points: number
  category: string
}) => {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from("score")
    .insert({ user_id: currentUserId, points: points, category: category })
    .select()

  revalidatePath("/")
}
