export const ApiCallType = {
  REQUEST: 'REQUEST',
  RECEIVE: 'RECEIVE',
  ERROR: 'ERROR'
}

export const onRequestActionCreator = action => ({
  originType: action.type,
  type: `${action.type}_REQUEST`,
  apiCallType: ApiCallType.REQUEST,
  path: action.dataApiCall.path
})

export const receiveTypeFor = type => `${type}_RECEIVE`

export const onReceiveActionCreator = action => data => ({
  originType: action.type,
  type: receiveTypeFor(action.type),
  apiCallType: ApiCallType.RECEIVE,
  path: action.dataApiCall.path,
  data
})

export const onErrorActionCreator = action => error => ({
  originType: action.type,
  type: `${action.type}_ERROR`,
  apiCallType: ApiCallType.ERROR,
  path: action.dataApiCall.path,
  error
})

export const callFromAction = (store, action) => {
  const call = action.dataApiCall
  if (call.requiresAuthentication) {
    call.token = getAuthToken(store.getState())
  }
  return call
}

// HARDCODED: coupled with our app. This is the only point to become
// apiCalls an external library
const getAuthToken = (state) => (
  state.login ? state.login.token : undefined
);

export const isApiCall = action => action.dataApiCall

export const simulateDataReceive = (action, data) =>
    onReceiveActionCreator(action)(data)
