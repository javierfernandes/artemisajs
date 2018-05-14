import { call, get, post } from 'core/call'

describe('Core calls factory', () => {
  describe('call()', () => {
    it('creates a simple get call spec', () => {
      expect(call('GET', 'weather/bsas')).toEqual({
        method: 'GET',
        path: 'weather/bsas'
      })
    })
    it('does not create keys for empty parameters', () => {
      const called = call('GET', 'weather/bsas')
      expect(called.urlParams).toEqual(undefined)
      expect(called.body).toEqual(undefined)
      expect(called.token).toEqual(undefined)
    })
    it('sets body correctly', () => {
      const called = call('POST', 'weather/bsas', undefined, { id: 1 })
      expect(called.body).toEqual({ id: 1 })
    })
    it('sets urlParams correctly', () => {
      const urlParams = { defree: 'celcius' }
      const called = call('POST', 'weather/bsas', urlParams)
      expect(called.urlParams).toEqual(urlParams)
    })
    it('sets token correctly', () => {
      const token = '$UP3RS3CR37'
      const called = call('POST', 'weather/bsas', undefined, undefined, token)
      expect(called.token).toEqual(token)
    })
  })

  describe('get()', () => {
    it('creates a simple GET call spec', () => {
      expect(get('weather/bsas')).toEqual({
        method: 'GET',
        path: 'weather/bsas'
      })
    })
  })

  describe('post()', () => {
    it('creates a simple POST with body', () => {
      expect(post('todoItem', { id: 1, text: 'hello world' })).toEqual({
        method: 'POST',
        path: 'todoItem',
        body: { id: 1, text: 'hello world' }
      })
    })
  })
})
