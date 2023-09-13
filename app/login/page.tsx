import { AuthButtonServer } from "@/components/auth/auth-button-server"

export default async function LoginPage() {
  return (
    <section className="grid min-h-screen place-content-center place-items-center gap-y-5">
      <h1 className="text-xl font-bold">Sign in to Cover Guessr</h1>
      <AuthButtonServer />
    </section>
  )
}
