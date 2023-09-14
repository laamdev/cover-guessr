"use client"

import { ReactNode, useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"

export const Hydrate = ({ children }: { children: ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <>
      {isHydrated ? (
        <>{children}</>
      ) : (
        <div className="grid h-screen place-content-center place-items-center">
          <Spinner size="md" />
        </div>
      )}
    </>
  )
}
