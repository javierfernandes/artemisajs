export const hasValueInKey = (obj, key, value) => {
  if (!obj) return false
  return obj[key] === value
}
