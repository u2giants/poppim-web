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
    unmount() {
      mounted = false
      latestRequest += 1
    },
  }
}
