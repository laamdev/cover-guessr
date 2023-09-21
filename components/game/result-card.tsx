import { Card, CardBody, cn } from "@nextui-org/react"

export const ResultCard = ({
  label,
  content,
  destructive,
}: {
  label: string
  content: number
  destructive?: boolean
}) => {
  return (
    <Card className="overflow-hidden border border-primary">
      <CardBody className="flex flex-col items-center">
        <p className="text-center text-xs font-medium sm:text-sm">{label}</p>
        <h2 className="text-2xl  font-bold">{content}</h2>
      </CardBody>
    </Card>

    // <div className="col-span-1 flex flex-col items-center rounded-lg border-2 border-primary px-1 py-2">
    //   <p className="text-xs md:text-sm">{label}</p>
    //   <h3
    //     className={cn(
    //       "text-base font-bold md:text-lg",
    //       destructive && "text-red-500"
    //     )}
    //   >
    //     {content}
    //   </h3>
    // </div>
  )
}
