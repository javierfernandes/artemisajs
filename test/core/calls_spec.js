import expect from 'expect';
import { call, get, post } from 'core/call'

describe('Core calls factory', () => {

  it('call() creates a simple get call spec', () => {
    expect(call('GET', 'weather/bsas')).toEqual({
      method: 'GET',
      path: 'weather/bsas'
    })
  })

  it('get() creates a simple GET call spec', () => {
    expect(get('weather/bsas')).toEqual({
      method: 'GET',
      path: 'weather/bsas'
    })
  })

  it('post() creates a simple POST without body', () => {
    expect(post('todoItem', { id: 1, text: 'hello world' })).toEqual({
      method: 'POST',
      path: 'todoItem',
      body: { id: 1, text: 'hello world' }
    })
  })

})
