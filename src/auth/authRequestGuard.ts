export function createAuthRequestGuard() {
  let mounted = true
  let latestRequest = 0
  return {
    begin() {
      latestRequest += 1
      return latestRequest
    },
    isCurrent(request: number) {
      return mounted && request === latestRequest
    },
    // StrictMode (dev) runs effect cleanup then setup again on the same
    // instance, so setup must re-arm the guard that cleanup disarmed.
    mount() {
      mounted = true
    },
    unmount() {
      mounted = false
      latestRequest += 1
    },
  }
}
