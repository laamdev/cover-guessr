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
      <SelectButton icon={<ShapesIcon className="h-5 w-5" />} category="all" />
      <SelectButton
        icon={<ClapperboardIcon className="h-5 w-5" />}
        category="movies"
      />
      <SelectButton
        icon={<Disc3Icon className="h-5 w-5" />}
        category="albums"
      />
      <SelectButton
        icon={<Gamepad2Icon className="h-5 w-5" />}
        category="videogames"
      />
    </div>
  )
}
