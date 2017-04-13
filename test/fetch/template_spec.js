import template from 'fetch/template'
import expect from 'expect'

describe('template helper', () => {
  it('Interpolates values by position', () => {
    const result = template`Hello ${0}`('World')
    expect(result).toEqual('Hello World')
  })

  it('Interpolates several values by position', () => {
    const result = template`Hello ${0}! I'm ${1}`('World', 'a test')
    expect(result).toEqual("Hello World! I'm a test")
  })

  it('Ignores unnecesary parameters', () => {
    const result = template`Hello World`('This', 'is', 'rubbish')
    expect(result).toEqual('Hello World')
  })

  it('Interpolates key value parameters', () => {
    const result = template`Hello ${'place'}`({ place: 'World' })
    expect(result).toEqual('Hello World')
  })

  it('Interpolates multiple key value parameters', () => {
    const result = template`Goodbye ${'adjective'} ${'place'}`(
      { place: 'world', adjective: 'cruel' }
    )
    expect(result).toEqual('Goodbye cruel world')
  })
})
