// *************************
// ** HTTP Call Factories
// *************************

/**
 * Full call object can contain all this parameters
 * @param method
 * @param path
 * @param urlParams
 * @param body
 * @param token
 *
 * requiresAuthentication: boolean
 */
export const call = (method, path, urlParams, body, token) => {
  const obj = {
    method,
    path
  }
  if (urlParams) { obj.urlParams = urlParams }
  if (body) { obj.body = body }
  if (token) { obj.token = token }
  return obj
}

export const get = (path) => ({ method: 'GET', path })
export const post = (path, body) => ({ method: 'POST', path, body })

// This should eventually become an ecmascript decorator function
// to use it like
//
//  @auth
//  fetchTopology(device) { ... }
export const auth = (aCall) => ({ ...aCall, requiresAuthentication: true })
