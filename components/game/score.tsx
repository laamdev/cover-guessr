import { Badge } from "@nextui-org/badge"
import { Button } from "@nextui-org/button"
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
    </section>
  )
}
