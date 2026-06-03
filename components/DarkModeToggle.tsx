"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="relative" aria-label="切換佈景主題">
          <Sun className="size-3.5 rotate-0 scale-100 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-3.5 rotate-90 scale-0 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>淺色</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>深色</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>系統</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
