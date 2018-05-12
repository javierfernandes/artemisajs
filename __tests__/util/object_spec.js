import { hasValueInKey } from 'util/object'
import expect from 'expect'

describe('hasValueInKey', () => {
  const god = {
    id: 1,
    name: 'Zeuz'
  }

  it('returns true if the value is found', () => {
    expect(hasValueInKey(god, 'name', 'Zeuz')).toBe(true)
  })

  it('returns false if the value is not found', () => {
    expect(hasValueInKey(god, 'name', 'Athens')).toBe(false)
  })

  it('returns false if the key is not found', () => {
    expect(hasValueInKey(god, 'notAKey', 'Athens')).toBe(false)
  })

  it('returns false if the object is undefined', () => {
    expect(hasValueInKey(undefined, 'notAKey', 'Athens')).toBe(false)
  })
})
