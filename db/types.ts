type Category = {
  name: string
}

export interface IMedia {
  title: string
  year: number
  author: string
  genre: string
  cover_url: string
  category: Category
}
