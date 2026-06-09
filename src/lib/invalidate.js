const listeners = new Set()

export function invalidateQueries() {
  listeners.forEach((listener) => listener())
}

export function subscribeInvalidation(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
