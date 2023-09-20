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
      <SelectButton icon={<ShapesIcon />} category="all" />
      <SelectButton icon={<ClapperboardIcon />} category="film" />
      <SelectButton icon={<Disc3Icon />} category="music" />
      <SelectButton icon={<Gamepad2Icon />} category="games" />
    </div>
  )
}
