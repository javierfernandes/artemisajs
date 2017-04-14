import expect from 'expect';
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
