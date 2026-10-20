import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/api-client/session"
import { broadcastLogout } from "@/api-client/auth-events"
import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_ORIGIN
const REFRESH_EXCLUDED_ROUTES = ["/login", "/exchange", "/refresh"]
const CSRF_HEADERS = { "X-CSRF-Protection": "1" } as const
const REFRESH_LOCK_NAME = "ntpu-past-exam-refresh"

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type DataAxiosInstance = Omit<
  AxiosInstance,
  | "request"
  | "get"
  | "delete"
  | "post"
  | "put"
  | "patch"
  | "postForm"
  | "putForm"
> & {
  request<T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T>
  get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  delete<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  postForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
  putForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
}

interface RefreshResponse {
  access_token: string
  token_type: string
}

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
  withCredentials: true,
})

let refreshPromise: Promise<string> | null = null
let logoutPromise: Promise<void> | null = null
let sessionGeneration = 0
let logoutInProgress = false

class SessionInvalidatedError extends Error {
  constructor() {
    super("The session was invalidated while refreshing")
    this.name = "SessionInvalidatedError"
  }
}

const clearSessionAndRedirect = () => {
  clearAccessToken()

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

const refreshAccessToken = async (generation: number) => {
  const requestRefresh = async () => {
    const { data } = await axios.post<RefreshResponse>("/refresh", undefined, {
      baseURL,
      headers: CSRF_HEADERS,
      timeout: 30_000,
      withCredentials: true,
    })

    return data
  }

  // The refresh cookie is shared by every tab, but refreshPromise is not.
  // Serialize rotations across tabs so a second tab reads the newly rotated
  // HttpOnly cookie instead of replaying the previous token.
  const data =
    typeof navigator !== "undefined" && navigator.locks
      ? await navigator.locks.request(REFRESH_LOCK_NAME, requestRefresh)
      : await requestRefresh()

  if (generation !== sessionGeneration || logoutInProgress) {
    throw new SessionInvalidatedError()
  }

  if (!data.access_token) {
    throw new Error("Refresh response did not include an access token")
  }

  setAccessToken(data.access_token)
  return data.access_token
}

export function refreshSession() {
  if (logoutInProgress) {
    return Promise.reject(new SessionInvalidatedError())
  }

  const generation = sessionGeneration
  refreshPromise ??= refreshAccessToken(generation).finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export function logoutSession({
  broadcast = true,
}: { broadcast?: boolean } = {}) {
  if (logoutPromise) return logoutPromise

  logoutInProgress = true
  sessionGeneration += 1
  clearAccessToken()
  const pendingRefresh = refreshPromise

  logoutPromise = (async () => {
    try {
      await pendingRefresh?.catch(() => undefined)
      await axios.post("/refresh/logout", undefined, {
        baseURL,
        headers: CSRF_HEADERS,
        timeout: 30_000,
        withCredentials: true,
      })
      if (broadcast) broadcastLogout()
    } finally {
      clearAccessToken()
      logoutInProgress = false
      logoutPromise = null
    }
  })()

  return logoutPromise
}

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const response = error.response
    const request = error.config as RetryableRequestConfig | undefined
    const requestUrl = request?.url ?? ""
    const isRefreshExcluded = REFRESH_EXCLUDED_ROUTES.some((route) =>
      requestUrl.includes(route)
    )

    if (
      !response ||
      response.status !== 401 ||
      !request ||
      request._retry ||
      isRefreshExcluded
    ) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      const accessToken = await refreshSession()
      request.headers = AxiosHeaders.from(request.headers)
      request.headers.set("Authorization", `Bearer ${accessToken}`)

      return axiosInstance.request(request)
    } catch (refreshError) {
      if (!(refreshError instanceof SessionInvalidatedError)) {
        clearSessionAndRedirect()
      }
      return Promise.reject(refreshError)
    }
  }
)

export default axiosInstance as DataAxiosInstance
