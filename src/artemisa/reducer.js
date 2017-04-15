import { storagePropertyNameForAction, isArtemisaAction } from './dispatch'
import { isRequest, isReceive, isError } from '../core/actions'
import { State, isFetchingSlot, isFetchedSlot } from '../core/model'

//
// TODO: 
//  - implement a cache timeout (store fetched date, and refetch after some time)
//  - implement an LRU to cache not only the last value but a couple of them for each URL

export function artemisa(state = {}, action) {
  if (action.originType && isArtemisaAction(action)) {
    return processApiAction(storagePropertyNameForAction(action), state, action)
  }
  return state
}

export function processApiAction(stateProperty, state, action) {
  if (isRequest(action)) {
    return {
      ...state,
      [stateProperty]: {
        state: State.FETCHING,
        path: action.path
      }
    }
  }
  if (isReceive(action)) {
    const { [stateProperty]: myState, ...restOfState } = state
    return (!myState || myState.path === action.path)
      ? {
        ...restOfState,
        [stateProperty]: {
          state: State.FETCHED,
          path: action.path,
          value: action.data
        }
      }
      // Received action does not correspond to the path in FETCHING state,
      // we asume that the data received corresponds to an old request is old and discard it.
      : state
  }
  if (isError(action)) {
    return {
      ...state,
      [stateProperty]: {
        state: State.ERROR,
        path: action.path,
        error: action.error
      }
    }
  }
  throw new Error('Unknown API action', action)
}

// checking state (should be moved to another file ?)
export const isFetching = (state, stateProperty) => isFetchingSlot(state[stateProperty])
export const isFetched = (state, stateProperty) => isFetchedSlot(state[stateProperty])