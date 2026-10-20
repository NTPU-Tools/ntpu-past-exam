const LEGACY_TOKEN_COOKIES = [
  "ntpu-past-exam-access-token",
  "ntpu-past-exam-refresh-token",
] as const

let accessToken: string | null = null

export function getAccessToken() {
  return accessToken
}

export function hasAccessToken() {
  return accessToken !== null
}

export function setAccessToken(token: string) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

export function clearLegacyTokenCookies() {
  if (typeof document === "undefined") return

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : ""

  for (const name of LEGACY_TOKEN_COOKIES) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
  }
}
