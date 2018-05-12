import isoFetch from 'isomorphic-fetch'

// HARDCODED: this should be configurable !
export const LOGOUT = 'LOGOUT'

const isBrowser = () => typeof __IS_BROWSER__ !== typeof undefined
const getBrowserUrl = (url) => `${location.protocol}//${location.host}/${url}`

export function apiFetch(url, options) {
  const finalUrl = isBrowser() ? getBrowserUrl(url) : `http://artemisajs.org/${url}`
  return isoFetch(finalUrl, options)
}

export const compileUrl = (path, params = {}) => (typeof(path) === 'string' ? path : path(params))

export function fetchOptions(method = 'GET', params = {}, authToken) {
  let headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
  let body = undefined

  if (method === 'POST' || method === 'PUT') {
    if (params.file) {
      body = new FormData()
      Object.keys(params).forEach((key) => {
        if (key !== 'file') {
          body.append(key, params[key])
        } else {
          body.append(params[key].name, params[key].file)
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
