import { create } from "zustand"
import { persist } from "zustand/middleware"

type State = {
  isResult: boolean
  lives: number
  score: number
}
type Actions = {
  setIsResult: () => void
  setLives: (diff: number) => void
  setScore: () => void
  reset: () => void
}

const initialState: State = {
  isResult: false,
  lives: 100,
  score: 0,
}

export const useGameStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setIsResult: () => set((state) => ({ isResult: !state.isResult })),
      setLives: (diff) => set((state) => ({ lives: state.lives - diff })),
      setScore: () => set((state) => ({ score: state.score + 1 })),
      reset: () => {
        set(initialState)
      },
    }),
    { name: "game-store" }
  )
)
