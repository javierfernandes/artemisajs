export const State = {
  FETCHING: 'fetching',
  FETCHED: 'fetched',
  ERROR: 'error'
}

// checking value
const stateIs = value => obj => !!obj && obj.state === value
export const isFetchingSlot = stateIs(State.FETCHING)
export const isFetchedSlot = stateIs(State.FETCHED)
export const isErrorSlot = stateIs(State.ERROR)
