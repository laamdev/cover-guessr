import { redirect } from "next/navigation"

import { getSession, supabase } from "@/lib/queries"
import { ResultsTable } from "@/components/leaderboard/results-table"

export default async function LeaderboardPage() {
  const { data: scores } = await supabase
    .from("score")
    .select("*, user(*)")
    .order("points", { ascending: false })
    .limit(10)

  return (
    <div>
      <div className="flex flex-col items-center">
        <h1 className="text-bold mt-5 text-4xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
          Leaderboard
        </h1>
        <p className="prose md:prose-xl mt-2.5 max-w-prose text-center">
          {`These are the 10 best scores and the users who got them. Do you think you can be one of them?`}
        </p>
      </div>
      <ResultsTable scores={scores} />
    </div>
  )
}
