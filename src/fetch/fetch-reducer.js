import {
  FETCH_REQUEST,
  FETCH_RECEIVE,
  FETCH_ERROR,
  // maybe customizable !?
  LOGOUT
} from 'fetch/fetch-actions'

const initialState = {
  data: undefined,
  fetching: false,
  ready: false,
  error: undefined
}

const defaultCallbacks = {
  processData: (stateData, actionData) => actionData
}

const defaultActions = {
  request: FETCH_REQUEST,
  receive: FETCH_RECEIVE,
  error: FETCH_ERROR
}

export function fetchReducer(actions, callbacks) {
  const finalActions = {
    ...defaultActions,
    ...actions
  }
  const finalCallbacks = {
    ...defaultCallbacks,
    ...callbacks
  }
  return (state = initialState, action) => {
    switch (action.type) {
      case finalActions.request:
        return { ...state, fetching: true, ready: false }
      case finalActions.receive:
        return {
          ...state,
          fetching: false,
          ready: true,
          data: finalCallbacks.processData(state.data, action.data)
        }
      case finalActions.error:
        return {
          data: undefined,
          fetching: false,
          ready: false,
          error: action.error
        }
      default:
        return state
    }
  }
}