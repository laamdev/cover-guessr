"use client"

import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react"
import { format } from "date-fns"

type Row = {
  key: string
  rank: number
  points: number
  player: string
  // // category: string
  // // date: string
}

export const ResultsTable = ({ scores }: { scores: any }) => {
  const columns = [
    {
      key: "rank",
      label: "RANK",
    },

    {
      key: "player",
      label: "PLAYER",
    },
    {
      key: "points",
      label: "POINTS",
    },
    // // {
    //   key: "category",
    //   label: "CATEGORY",
    // },
    // {
    //   key: "date",
    //   label: "DATE",
    // },
  ]

  const rows = scores.map((score: any, idx: number) => ({
    key: score.id,
    rank: `#${idx + 1}`,
    // // category: score.category,
    points: score.points,
    player: score.user.username,
    // // date: format(new Date(score.created_at), "P"),
  }))

  return (
    <Table aria-label="Leaderboard table." className="mt-10">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={rows} emptyContent={"No scores to display."}>
        {(item: Row) => (
          <TableRow key={item.key}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
