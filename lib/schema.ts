import { z } from "zod"

export const SignInSchema = z.object({
  email: z.string().nonempty("Email is required.").email("Invalid email."),
})

export type SignInInputs = z.infer<typeof SignInSchema>
