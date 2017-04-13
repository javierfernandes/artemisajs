
export const State = {
  FETCHING: 'fetching',
  FETCHED: 'fetched',
  ERROR: 'error'
}

// checking value
export const isFetchingSlot = slot => isInStateSlot(slot, State.FETCHING)
export const isFetchedSlot = slot => isInStateSlot(slot, State.FETCHED)
export const isErrorSlot = slot => isInStateSlot(slot, State.ERROR)
export const isInStateSlot = (slot, state) => slot && slot.state === state
