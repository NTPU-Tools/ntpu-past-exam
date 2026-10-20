import { formatRelative } from "date-fns"
import { zhTW } from "date-fns/locale"

export function parseUTC(iso: string): Date {
  const value = /Z|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`
  return new Date(value)
}

export function formatDate(iso: string): string {
  try {
    return formatRelative(parseUTC(iso), new Date(), { locale: zhTW })
  } catch {
    return iso
  }
}
