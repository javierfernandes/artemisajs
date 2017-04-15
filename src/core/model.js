import { hasValueInKey } from '../util/object'

export const State = {
  FETCHING: 'fetching',
  FETCHED: 'fetched',
  ERROR: 'error'
}

// checking value
export const isFetchingSlot = slot => hasValueInKey(slot, 'state', State.FETCHING)
export const isFetchedSlot = slot => hasValueInKey(slot, 'state', State.FETCHED)
export const isErrorSlot = slot => hasValueInKey(slot, 'state', State.ERROR)
