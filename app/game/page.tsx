import getRandomAlbum from "@/lib/getRandomAlbum"
import { GamePage } from "@/components/game/game-page"

export default async function GameRoute() {
  const randomAlbum = await getRandomAlbum()
  return <GamePage album={randomAlbum} />
}
