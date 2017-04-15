export const isFunction = value => typeof(value) === 'function'
export const identity = x => x
export const constant = x => () => x
export const trueFn = constant(true)
