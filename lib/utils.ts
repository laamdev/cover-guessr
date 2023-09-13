import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const getDifference = (a: number, b: number) => {
  return Math.abs(a - b)
}

export const getCurrentYear = () => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  return year
}
