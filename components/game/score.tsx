import { Badge } from "@/components/ui/badge"

export const Score = ({ score, lives }: { score: number; lives: number }) => {
  return (
    <section className="flex items-center justify-center gap-x-2.5">
      <Badge variant="outline" className="flex gap-x-2.5">
        <span className="text-neutral-700">Score</span>
        <span className="font-bold tabular-nums">{score}</span>
      </Badge>
      <Badge variant="outline" className="flex gap-x-2.5 bg-green-100">
        <span className="text-neutral-700">Lives</span>
        <span className="font-bold tabular-nums">{lives <= 0 ? 0 : lives}</span>
      </Badge>
    </section>
  )
}
