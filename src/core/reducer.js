import { isDerivedActionFor, isRequest, isReceive, isError } from './actions'
import { State, isFetchingSlot, isFetchedSlot } from './model'

export const identityWithInitial = initial => state => state || initial

export const identity = (state = {}) => state

// checking state
export const isFetching = (state, stateProperty) => isFetchingSlot(state[stateProperty])
export const isFetched = (state, stateProperty) => isFetchedSlot(state[stateProperty])

export const dispatchIfNecessary = actionCreator => (dispatch, getState) => {
  const update = (reducerState, fetchMapping, action) =>
    (shouldFetch(reducerState[fetchMapping[action.type]], action.dataApiCall.path, s => s.path)
      ? dispatch(action)
      : Promise.resolve())

  return actionCreator(update, getState())
}

/**
 * If we have a piece state managed by this framework, and the value has a transformerId,
 * this function tells if it is necessary to do a new fetch.
 */
export function shouldFetch(fetchState, key, keyProvider) {

  // No key => no fetch
  if (!key) return false

  // fecthState is not even initialized, do a first fetch
  if (!fetchState) return true

  // We are already fetching
  if (fetchState.state === State.FETCHING && (!keyProvider || keyProvider(fetchState) === key)) return false

  // Handle errors
  if (fetchState.state === State.ERROR) {
    /* eslint-disable no-console */
    console.log(`Ignoring request to fetch '${key}' because of previous error: '${fetchState.error}'`)
    return false
  }

  return (keyProvider || (s => s.value.transformerId))(fetchState) !== key
}

export const withFetchs = (reducer, actionToStateMapping) => (
  Object.keys(actionToStateMapping)
    .reduce((red, key) =>
      fetchAndSet(red, key, actionToStateMapping[key]), reducer
    )
)

/**
 * Decorates a given reducer in order to intercept
 * api calls actions (REQUEST, RECEIVE, ERROR),
 * and it updates a state property with a particular status
 *
 * For example:
 *    export default fetchAndSet(myReducer, 'weather')
 *
 * This will mutate the "weather" property of the state according
 * to the actions received from the the ApiService (calls)
 *
 * on REQUEST =>  { weather: { state: FETCHING } }
 * on RECEIVED =>  { weather: { state: FETCHED, value: <received object> } }
 * on ERROR =>  { weather: { state: ERROR, error: <received error> } }
 */
export const fetchAndSet = (reducer, apiActionType, stateProperty) => (state, action) => {
  const newState = isDerivedActionFor(action, apiActionType) ?
      processApiAction(stateProperty, state, action) : state
  // always default first to decoratee
  return reducer(newState, action)
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
