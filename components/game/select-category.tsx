import {
  ClapperboardIcon,
  Disc3Icon,
  Gamepad2Icon,
  ShapesIcon,
} from "lucide-react"

import { SelectButton } from "@/components/game/select-button"

export const SelectCategory = () => {
  return (
    <div className="mt-2.5 flex gap-x-5">
      <SelectButton icon={<ShapesIcon className="h-4 w-4" />} category="all" />
      <SelectButton
        icon={<ClapperboardIcon className="h-4 w-4" />}
        category="film"
      />
      <SelectButton icon={<Disc3Icon className="h-4 w-4" />} category="music" />
      <SelectButton
        icon={<Gamepad2Icon className="h-4 w-4" />}
        category="games"
      />
    </div>
  )
}
