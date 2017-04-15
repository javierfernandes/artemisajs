
export const properties = obj => Object.keys(obj).map(name => ({ name, value: obj[name] }))

export const hasValueInKey = (obj, key, value) => !!obj && obj[key] === value
