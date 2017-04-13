import {
    onRequestActionCreator,
    onErrorActionCreator,
    onReceiveActionCreator,
    callFromAction,
    isApiCall
} from './api-actions'
import { apiFetch, compileUrl, fetchOptions } from 'actions/utils'

/* eslint no-unused-vars: 0 */
export const dataService = store => next => action => {
  next(action)
  return isApiCall(action) ? callEndpoint(store, action, next) : Promise.resolve()
}

function callEndpoint(store, action, next) {
  next(onRequestActionCreator(action))

  return doCallEndpoint(
    callFromAction(store, action),
    next,
    onReceiveActionCreator(action),
    onErrorActionCreator(action)
  )
}

/* eslint-disable no-console */
function doCallEndpoint(callSpec, next, onReceive, onError) {
  const { method, path, urlParams, body, token } = callSpec
  return apiFetch(compileUrl(path, urlParams), fetchOptions(method, body, token))
    .then(response =>
      // TODO
      // if (response.status === 401) {
      //   next(unauthorized());
      // }
      (response.ok
        ? response.json().then(json => next(onReceive(json)))
        : response.json().then(json => next(onError(json.error.message))))
    )
    .catch(error => {
      console.error('ERROR on API Call', error)
      next(onError(error.message))
    })
}
