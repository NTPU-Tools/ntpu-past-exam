import { describe, expect, it } from "vitest"
import { clearSWRCache } from "@/lib/swr-cache"

describe("clearSWRCache", () => {
  it("removes every cached key, including private account data", () => {
    const cache = new Map<string, unknown>([
      ["user-me", { username: "first-account" }],
      ["department-private", [{ id: "private-post" }]],
      ["public-data", { id: "public" }],
    ])

    clearSWRCache(cache)

    expect(cache.size).toBe(0)
  })
})
