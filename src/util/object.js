
export const properties = obj => Object.keys(obj).map(name => ({ name, value: obj[name] }))

