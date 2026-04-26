"use client";

import Link from "next/link";
import { useAuth, useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Disc3,
  Gamepad2,
  Trophy,
  ShieldCheck,
  Menu,
  LogIn,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const isAdmin =
    (user?.publicMetadata as Record<string, unknown> | undefined)?.role ===
    "admin";
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-dashed border-border">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
        {/* Logo — icon only on mobile, icon+text on desktop */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary transition-colors hover:text-foreground"
        >
          <Disc3 className="h-4 w-4" />
          <span className="hidden sm:inline">Cover Guessr</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Link href="/play">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Play
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Leaderboard
            </Button>
          </Link>
          {isSignedIn && isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
              >
                Admin
              </Button>
            </Link>
          )}
          {isSignedIn ? (
            <div className="ml-2 border-l border-dashed border-border pl-3">
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="ml-2 text-xs uppercase tracking-wider"
              >
                Sign In
              </Button>
            </SignInButton>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 sm:hidden">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                />
              }
            >
              <Menu className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-48 p-1">
              <nav className="flex flex-col">
                <Link
                  href="/play"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Play
                </Link>
                <Link
                  href="/leaderboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
                {isSignedIn && isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <div className="mt-1 border-t border-dashed border-border pt-2 px-3 pb-1">
                  {isSignedIn ? (
                    <UserButton />
                  ) : (
                    <SignInButton mode="modal">
                      <Button
                        size="sm"
                        className="w-full text-xs uppercase tracking-wider"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
