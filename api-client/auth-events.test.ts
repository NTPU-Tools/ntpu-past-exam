import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type MessageListener = (event: MessageEvent<unknown>) => void

class FakeBroadcastChannel {
  static channels = new Set<FakeBroadcastChannel>()

  readonly name: string
  closed = false
  private listeners = new Set<MessageListener>()

  constructor(name: string) {
    this.name = name
    FakeBroadcastChannel.channels.add(this)
  }

  addEventListener(type: string, listener: MessageListener) {
    if (type === "message") this.listeners.add(listener)
  }

  removeEventListener(type: string, listener: MessageListener) {
    if (type === "message") this.listeners.delete(listener)
  }

  postMessage(data: unknown) {
    for (const peer of FakeBroadcastChannel.channels) {
      if (peer === this || peer.closed || peer.name !== this.name) continue
      for (const listener of peer.listeners) {
        listener({ data } as MessageEvent<unknown>)
      }
    }
  }

  close() {
    this.closed = true
    FakeBroadcastChannel.channels.delete(this)
  }
}

describe("cross-tab auth events", () => {
  beforeEach(() => {
    vi.resetModules()
    FakeBroadcastChannel.channels.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("broadcasts logout to peer tabs and closes its channel on unsubscribe", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel)
    const peer = new FakeBroadcastChannel("ntpu-past-exam-auth")
    const peerLogout = vi.fn()
    peer.addEventListener("message", (event) => {
      if ((event.data as { type?: string }).type === "logout") peerLogout()
    })

    const { broadcastLogout, subscribeToLogout } = await import(
      "@/api-client/auth-events"
    )
    const sameTabLogout = vi.fn()
    const unsubscribe = subscribeToLogout(sameTabLogout)
    const localChannel = [...FakeBroadcastChannel.channels].find(
      (candidate) => candidate !== peer,
    )

    broadcastLogout()

    expect(peerLogout).toHaveBeenCalledOnce()
    expect(sameTabLogout).not.toHaveBeenCalled()
    unsubscribe()
    expect(() => unsubscribe()).not.toThrow()
    expect(localChannel?.closed).toBe(true)
    peer.close()
  })

  it("is a safe no-op when BroadcastChannel is unavailable", async () => {
    vi.stubGlobal("BroadcastChannel", undefined)
    const { broadcastLogout, subscribeToLogout } = await import(
      "@/api-client/auth-events"
    )

    const unsubscribe = subscribeToLogout(vi.fn())

    expect(() => broadcastLogout()).not.toThrow()
    expect(() => unsubscribe()).not.toThrow()
  })
})
