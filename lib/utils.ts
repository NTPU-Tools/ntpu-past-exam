import { clsx, type ClassValue } from "clsx"
import { formatRelative } from "date-fns"
import { zhTW } from "date-fns/locale"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseUTC(iso: string): Date {
  const s = /Z|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z"
  return new Date(s)
}

export function formatDate(iso: string): string {
  try {
    return formatRelative(parseUTC(iso), new Date(), { locale: zhTW })
  } catch {
    return iso
  }
}
