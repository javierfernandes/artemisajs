import {
    onRequestActionCreator,
    onErrorActionCreator,
    onReceiveActionCreator,
    callFromAction,
    isApiCall
} from './actions'
import { apiFetch, compileUrl, fetchOptions } from './fetch'

export const dataService = store => next => action => {
  const r = next(action)
  return isApiCall(action) ? callEndpoint(store, action, next) : Promise.resolve(r)
}

const callEndpoint = (store, action, next) => {
  next(onRequestActionCreator(action))

  return doCallEndpoint(
    callFromAction(store, action),
    next,
    onReceiveActionCreator(action),
    onErrorActionCreator(action),
    store
  )
}

// data Service as an object to configure transformations
dataService.transformations = []
dataService.registerTransformation = (actionType, fn) => {
  dataService.transformations[actionType] = fn
}

const transformReceiveAction = (receive, store) => ({
  ...receive,
  data: transform(receive.originType, receive.data, store)
})

const transform = (actionType, value, store) => {
  const t = dataService.transformations[actionType]
  return t ? t(value, store) : value
}

/* eslint-disable no-console */
function doCallEndpoint(callSpec, next, onReceive, onError, store) {
  const { method, path, urlParams, body, token } = callSpec
  return apiFetch(compileUrl(path, urlParams), fetchOptions(method, body, token))
    .then(response =>
      // TODO
      // if (response.status === 401) {
      //   next(unauthorized());
      // }
      (response.ok
        ? response.json().then(json => next(transformReceiveAction(onReceive((json)), store)))
        // TODO: error parsing should be configurable globally (here we assume that a json object comes
        // with { error: { message } }
        : response.json().then(json => next(onError(json.error.message))))
    )
    .catch(error => {
      // console.error('ERROR on API Call', error)
      next(onError(error.message))
    })
}
