const AUTH_CHANNEL_NAME = "ntpu-past-exam-auth"
const LOGOUT_EVENT = { type: "logout" } as const

let channel: BroadcastChannel | null = null
let subscriberCount = 0

function createChannel() {
  if (typeof BroadcastChannel === "undefined") return null
  return new BroadcastChannel(AUTH_CHANNEL_NAME)
}

export function subscribeToLogout(onLogout: () => void) {
  channel ??= createChannel()
  if (!channel) return () => undefined

  const currentChannel = channel
  const handleMessage = (event: MessageEvent<unknown>) => {
    if (
      typeof event.data === "object" &&
      event.data !== null &&
      "type" in event.data &&
      event.data.type === LOGOUT_EVENT.type
    ) {
      onLogout()
    }
  }

  subscriberCount += 1
  currentChannel.addEventListener("message", handleMessage)
  let subscribed = true

  return () => {
    if (!subscribed) return
    subscribed = false
    currentChannel.removeEventListener("message", handleMessage)
    subscriberCount -= 1

    if (subscriberCount === 0 && channel === currentChannel) {
      currentChannel.close()
      channel = null
    }
  }
}

export function broadcastLogout() {
  if (channel) {
    channel.postMessage(LOGOUT_EVENT)
    return
  }

  const broadcaster = createChannel()
  if (!broadcaster) return
  broadcaster.postMessage(LOGOUT_EVENT)
  broadcaster.close()
}
