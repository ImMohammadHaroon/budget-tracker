import { useEffect } from 'react'
import { subscribeInvalidation } from '../lib/invalidate'

export function useInvalidate(callback) {
  useEffect(() => subscribeInvalidation(callback), [callback])
}
