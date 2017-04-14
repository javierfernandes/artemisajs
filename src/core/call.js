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
 * requiresAuthentication: boolean
 */
export const call = (method, path, urlParams, body, token) => ({
  method,
  path,
  ...urlParams,
  ...body,
  ...token
})

export const get = (path) => ({ method: 'GET', path })
export const post = (path, body) => ({ method: 'POST', path, body })

// This should eventually become an ecmascript decorator function
// to use it like
//
//  @auth
//  fetchWeather(city) { ... }
export const auth = (aCall) => ({ ...aCall, requiresAuthentication: true })
