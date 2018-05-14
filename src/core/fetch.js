import isoFetch from 'isomorphic-fetch'
import { DEFAULT_BASE_URL } from 'core/service'

// HARDCODED: this should be configurable !
// TODO: remove this as its never imported form anywhere?
export const LOGOUT = 'LOGOUT'

const isBrowser = () => typeof __IS_BROWSER__ !== typeof undefined
const concatUrl = (base, endUrl) => `${base}/${endUrl}`
const getBrowserUrl = () => `${location.protocol}//${location.host}`

export function apiFetch(url, options) {
  const baseUrl = isBrowser() ? getBrowserUrl(url) : options.baseUrl || DEFAULT_BASE_URL
  return isoFetch(concatUrl(baseUrl, url), options)
}

export const compileUrl = (path, params = {}) => (typeof(path) === 'string' ? path : path(params))

export function fetchOptions(method = 'GET', params = {}, authToken) {
  let headers = {}
  let body = undefined
  if (authToken) {
    headers = {
      ...headers,
      Authorization: `Bearer ${authToken}`
    }
  }
  if (method === 'POST' || method === 'PUT') {
    if (params.file) {
      body = new FormData();
      Object.keys(params).forEach((key) => {
        if (key !== 'file') {
          body.append(key, params[key]);
        } else {
          body.append(params[key].name, params[key].file);
        }
      })
    } else {
      headers = {
        ...headers,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
      body = JSON.stringify(params)
    }
  }
  return { method, headers, body }
}
