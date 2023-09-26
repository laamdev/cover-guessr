import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export const supabase = createServerComponentClient({ cookies })

export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export const getUsers = async () => {
  const { data } = await supabase.from("user").select()
  return data
}
