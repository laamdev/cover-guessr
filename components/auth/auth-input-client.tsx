"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Spinner } from "@nextui-org/react"
import { type Session } from "@supabase/auth-helpers-nextjs"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"

import { SignInSchema, type SignInInputs } from "@/lib/schema"
import { signInAction, signOutAction } from "@/app/_actions"

export const AuthInputClient = ({ session }: { session: Session }) => {
  const [pending, startTransition] = useTransition()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  // // const [data, setData] = useState<SignInInputs>()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInInputs>({
    // @ts-expect-error
    resolver: zodResolver(SignInSchema),
  })

  const processForm: SubmitHandler<SignInInputs> = async (data) => {
    const result = await signInAction(data)

    setIsLoggingIn(true)

    if (!result) {
      toast.error("Something went wrong. Please try again in a minute.")
      setIsLoggingIn(false)

      return
    }

    if (result.error) {
      // // toast.error(result.error)
      // set local error state
      setIsLoggingIn(false)
      console.log(result.error)

      return
    }

    setIsLoggingIn(false)

    toast.success(
      "We sent an email to your inbox. Click the link in it to finish logging in."
    )

    reset()
    // // setData(result.data)
  }

  return (
    <>
      <div>
        {!session ? (
          <form
            onSubmit={handleSubmit(processForm)}
            className="flex items-center gap-x-2.5"
          >
            <div className="relative">
              <Input
                {...register("email")}
                size="sm"
                color="primary"
                label="Email"
                variant="faded"
                labelPlacement="outside"
                className="w-full"
              />
              {errors.email?.message && (
                <p className="absolute -bottom-5 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" size="sm" variant="solid" color="primary">
              {!isLoggingIn ? (
                <span>Sign in</span>
              ) : (
                <div>
                  <span>Signing in</span>
                  <Spinner color="primary" size="md" />
                </div>
              )}
            </Button>
          </form>
        ) : (
          <Button
            onClick={() => startTransition(() => signOutAction())}
            size="sm"
            variant="solid"
            color="primary"
          >
            Sign out
          </Button>
        )}
      </div>
    </>
  )
}
