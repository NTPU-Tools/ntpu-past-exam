import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const originalAxiosAdapter = axios.defaults.adapter
let cookieWrites: string[]

const successResponse = (
  config: InternalAxiosRequestConfig,
  data: unknown
) => ({
  config,
  data,
  headers: new AxiosHeaders(),
  status: 200,
  statusText: "OK",
})

const unauthorized = (config: InternalAxiosRequestConfig) => {
  const response = {
    config,
    data: { detail: "Unauthorized" },
    headers: new AxiosHeaders(),
    status: 401,
    statusText: "Unauthorized",
  }

  return new AxiosError(
    "Request failed with status code 401",
    "ERR_BAD_REQUEST",
    config,
    undefined,
    response
  )
}

const setUpBrowserGlobals = () => {
  cookieWrites = []
  const documentMock = {} as Document

  Object.defineProperty(documentMock, "cookie", {
    get: () => "",
    set: (cookie: string) => cookieWrites.push(cookie),
  })

  vi.stubGlobal("document", documentMock)
  vi.stubGlobal("window", {
    location: {
      href: "https://app.test/course",
      pathname: "/course",
      protocol: "https:",
    },
  })
}

describe("API client session handling", () => {
  beforeEach(() => {
    vi.resetModules()
    setUpBrowserGlobals()
  })

  afterEach(() => {
    axios.defaults.adapter = originalAxiosAdapter
    vi.unstubAllGlobals()
  })

  it("bootstraps an access token from the HttpOnly refresh cookie contract", async () => {
    let refreshCalls = 0
    const adapter: AxiosAdapter = async (config) => {
      expect(config.url).toBe("/refresh")
      expect(config.withCredentials).toBe(true)

      const headers = AxiosHeaders.from(config.headers)
      expect(headers.get("X-CSRF-Protection")).toBe("1")
      expect(headers.get("Authorization")).toBeFalsy()
      refreshCalls += 1

      return successResponse(config, {
        access_token: "fresh-access",
        token_type: "bearer",
      })
    }

    axios.defaults.adapter = adapter
    const { refreshSession } = await import("@/api-client/instance")
    const { getAccessToken } = await import("@/api-client/session")

    await expect(refreshSession()).resolves.toBe("fresh-access")
    expect(getAccessToken()).toBe("fresh-access")
    expect(refreshCalls).toBe(1)
    expect(cookieWrites).toEqual([])
  })

  it("shares one refresh request across concurrent 401s and retries both requests", async () => {
    let refreshCalls = 0
    const resourceAttempts = new Map<string, number>()

    const adapter: AxiosAdapter = async (config) => {
      if (config.url === "/refresh") {
        refreshCalls += 1
        const headers = AxiosHeaders.from(config.headers)
        expect(headers.get("X-CSRF-Protection")).toBe("1")
        expect(headers.get("Authorization")).toBeFalsy()
        expect(config.withCredentials).toBe(true)
        await new Promise((resolve) => setTimeout(resolve, 25))
        return successResponse(config, {
          access_token: "fresh-access",
          token_type: "bearer",
        })
      }

      if (config.url?.startsWith("/resource/")) {
        resourceAttempts.set(
          config.url,
          (resourceAttempts.get(config.url) ?? 0) + 1
        )
        if (
          AxiosHeaders.from(config.headers).get("Authorization") !==
          "Bearer fresh-access"
        ) {
          throw unauthorized(config)
        }
        return successResponse(config, { ok: true, url: config.url })
      }

      throw new Error(`Unexpected request: ${config.url}`)
    }

    axios.defaults.adapter = adapter
    const { default: instance } = await import("@/api-client/instance")
    const { getAccessToken, setAccessToken } =
      await import("@/api-client/session")
    instance.defaults.adapter = adapter
    setAccessToken("expired-access")

    const responses = await Promise.all([
      instance.get("/resource/one"),
      instance.get("/resource/two"),
    ])

    expect(responses).toEqual([
      { ok: true, url: "/resource/one" },
      { ok: true, url: "/resource/two" },
    ])
    expect(instance.defaults.timeout).toBe(30_000)
    expect(refreshCalls).toBe(1)
    expect(resourceAttempts.get("/resource/one")).toBe(2)
    expect(resourceAttempts.get("/resource/two")).toBe(2)
    expect(getAccessToken()).toBe("fresh-access")
    expect(cookieWrites).toEqual([])
  })

  it("serializes refresh-cookie rotation across independently loaded tabs", async () => {
    let lockTail = Promise.resolve()
    let refreshCalls = 0
    let cookieVersion = 0

    vi.stubGlobal("navigator", {
      locks: {
        request: <T>(_name: string, callback: () => Promise<T>) => {
          const result = lockTail.then(callback)
          lockTail = result.then(
            () => undefined,
            () => undefined
          )
          return result
        },
      },
    })

    const adapter: AxiosAdapter = async (config) => {
      expect(config.url).toBe("/refresh")
      refreshCalls += 1
      const presentedCookieVersion = cookieVersion
      await new Promise((resolve) => setTimeout(resolve, 10))

      if (presentedCookieVersion !== cookieVersion) {
        throw unauthorized(config)
      }

      cookieVersion += 1
      return successResponse(config, {
        access_token: `fresh-access-${cookieVersion}`,
        token_type: "bearer",
      })
    }

    axios.defaults.adapter = adapter
    const firstTab = await import("@/api-client/instance")
    vi.resetModules()
    axios.defaults.adapter = adapter
    const secondTab = await import("@/api-client/instance")

    await expect(
      Promise.all([firstTab.refreshSession(), secondTab.refreshSession()])
    ).resolves.toEqual(["fresh-access-1", "fresh-access-2"])
    expect(refreshCalls).toBe(2)
    expect(cookieVersion).toBe(2)
  })

  it("passes through network errors without trying to refresh", async () => {
    let refreshCalls = 0
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === "/refresh") refreshCalls += 1
      throw new AxiosError("Network Error", "ERR_NETWORK", config)
    }

    axios.defaults.adapter = adapter
    const { default: instance } = await import("@/api-client/instance")
    instance.defaults.adapter = adapter

    await expect(instance.get("/network-error")).rejects.toThrow(
      "Network Error"
    )
    expect(refreshCalls).toBe(0)
    expect(window.location.href).toBe("https://app.test/course")
  })

  it("logs out with the CSRF header and always clears the memory token", async () => {
    let logoutCalls = 0
    const adapter: AxiosAdapter = async (config) => {
      expect(config.url).toBe("/refresh/logout")
      expect(config.withCredentials).toBe(true)

      const headers = AxiosHeaders.from(config.headers)
      expect(headers.get("X-CSRF-Protection")).toBe("1")
      expect(headers.get("Authorization")).toBeFalsy()
      logoutCalls += 1
      return successResponse(config, null)
    }

    axios.defaults.adapter = adapter
    const { logoutSession } = await import("@/api-client/instance")
    const { getAccessToken, setAccessToken } =
      await import("@/api-client/session")
    setAccessToken("current-access")

    await logoutSession()

    expect(logoutCalls).toBe(1)
    expect(getAccessToken()).toBeNull()
  })

  it("clears the memory token even when logout fails", async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError("Network Error", "ERR_NETWORK", config)
    }

    axios.defaults.adapter = adapter
    const { logoutSession } = await import("@/api-client/instance")
    const { getAccessToken, setAccessToken } =
      await import("@/api-client/session")
    setAccessToken("current-access")

    await expect(logoutSession()).rejects.toThrow("Network Error")
    expect(getAccessToken()).toBeNull()
  })

  it("does not let a late refresh response recreate the session after logout", async () => {
    let releaseRefresh!: () => void
    let markRefreshStarted!: () => void
    const refreshStarted = new Promise<void>((resolve) => {
      markRefreshStarted = resolve
    })
    const refreshRelease = new Promise<void>((resolve) => {
      releaseRefresh = resolve
    })
    const requestOrder: string[] = []
    let refreshCookie: string | null = "current-refresh"
    let logoutCalls = 0
    let resourceAttempts = 0

    const adapter: AxiosAdapter = async (config) => {
      if (config.url === "/refresh") {
        markRefreshStarted()
        await refreshRelease
        requestOrder.push("refresh-response")
        refreshCookie = "rotated-refresh"
        return successResponse(config, {
          access_token: "late-access",
          token_type: "bearer",
        })
      }

      if (config.url === "/refresh/logout") {
        logoutCalls += 1
        requestOrder.push("logout-request")
        refreshCookie = null
        return successResponse(config, null)
      }

      if (config.url === "/resource/race") {
        resourceAttempts += 1
        if (
          AxiosHeaders.from(config.headers).get("Authorization") !==
          "Bearer late-access"
        ) {
          throw unauthorized(config)
        }
        return successResponse(config, { ok: true })
      }

      throw new Error(`Unexpected request: ${config.url}`)
    }

    axios.defaults.adapter = adapter
    const { default: instance, logoutSession } =
      await import("@/api-client/instance")
    const { getAccessToken, setAccessToken } =
      await import("@/api-client/session")
    instance.defaults.adapter = adapter
    setAccessToken("expired-access")

    const resourceOutcome = instance.get("/resource/race").then(
      () => "resolved",
      () => "rejected"
    )
    await refreshStarted

    const logoutPromise = logoutSession()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const logoutCallsBeforeRefreshResolved = logoutCalls

    releaseRefresh()
    await logoutPromise

    expect(await resourceOutcome).toBe("rejected")
    expect(logoutCallsBeforeRefreshResolved).toBe(0)
    expect(requestOrder).toEqual(["refresh-response", "logout-request"])
    expect(resourceAttempts).toBe(1)
    expect(refreshCookie).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(window.location.href).toBe("https://app.test/course")
  })

  it("removes both legacy JavaScript token cookies", async () => {
    const { clearLegacyTokenCookies } = await import("@/api-client/session")

    clearLegacyTokenCookies()

    expect(cookieWrites).toHaveLength(2)
    expect(cookieWrites).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "ntpu-past-exam-access-token=; Path=/; Max-Age=0"
        ),
        expect.stringContaining(
          "ntpu-past-exam-refresh-token=; Path=/; Max-Age=0"
        ),
      ])
    )
  })
})
