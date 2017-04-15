import expect from 'expect'
import { isArtemisaType } from 'artemisa/dispatch'

describe('isArtemisaType', () => {
  it('matches a string that begins with ARTEMISA', () => {
    expect(isArtemisaType('ARTEMISA_ACTION')).toBe(true)
  })
  it('matches a string that is exactly ARTEMISA', () => {
    expect(isArtemisaType('ARTEMISA')).toBe(true)
  })
  it('returns false if action does not begin with ARTEMISA', () => {
    expect(isArtemisaType('ACTION_ARTEMISA')).toBe(false)
  })
  it('returns false if action does not begin with ARTEMISA but is close :P', () => {
    expect(isArtemisaType('AARTEMISA')).toBe(false)
  })
  it('does not break if no parameters are passed', () => {
    isArtemisaType()
    expect(isArtemisaType).toNotThrow()
  })
})