import { Badge, Button } from "@nextui-org/react"
import { AwardIcon, HeartIcon } from "lucide-react"

export const Score = ({ score, lives }: { score: number; lives: number }) => {
  return (
    <section className="flex items-center justify-center gap-x-10">
      <Badge content={`${lives}`} shape="circle" color="danger">
        <Button
          radius="full"
          isIconOnly
          aria-label="lives"
          variant="ghost"
          className="pointer-events-none"
        >
          <HeartIcon size={24} />
        </Button>
      </Badge>
      <Badge content={`${score}`} shape="circle" color="success">
        <Button
          radius="full"
          isIconOnly
          aria-label="score"
          variant="ghost"
          className="pointer-events-none"
        >
          <AwardIcon size={24} />
        </Button>
      </Badge>
      {/* <Badge variant="outline" className="flex gap-x-2.5">
        <span className="text-neutral-700">Score</span>
        <span className="font-bold tabular-nums">{score}</span>
      </Badge>
      <Badge variant="outline" className="flex gap-x-2.5 bg-green-100">
        <span className="text-neutral-700">Lives</span>
        <span className="font-bold tabular-nums">{lives <= 0 ? 0 : lives}</span>
      </Badge> */}
    </section>
  )
}
