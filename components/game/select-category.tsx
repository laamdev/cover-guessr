import {
  ClapperboardIcon,
  Disc3Icon,
  Gamepad2Icon,
  ShapesIcon,
} from "lucide-react"

import { SelectButton } from "@/components/game/select-button"

export const SelectCategory = () => {
  return (
    <div className="mt-5 grid grid-cols-4 gap-x-5">
      <SelectButton icon={<ShapesIcon className="h-4 w-4" />} category="all" />
      <SelectButton
        icon={<ClapperboardIcon className="h-4 w-4" />}
        category="movies"
      />
      <SelectButton
        icon={<Disc3Icon className="h-4 w-4" />}
        category="albums"
      />
      <SelectButton
        icon={<Gamepad2Icon className="h-4 w-4" />}
        category="videogames"
      />
    </div>
  )
}
