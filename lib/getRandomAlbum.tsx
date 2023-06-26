import { IAlbum } from "@/db/types"

import getAllAlbums from "@/lib/getAllAlbums"

const prevAlbumObj = {
  prev: 1,
  setPrev: function (num: number) {
    this.prev = num
  },
}

export default async function getRandomAlbum(): Promise<IAlbum> {
  const results = await getAllAlbums()

  let randomIndex = prevAlbumObj.prev

  while (randomIndex === prevAlbumObj.prev) {
    randomIndex = Math.floor(Math.random() * results.length)
  }

  prevAlbumObj.setPrev(randomIndex)

  return results[randomIndex]
}
