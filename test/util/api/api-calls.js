import expect from 'expect';
import { call, get, post } from '../../../src/util/api/api-call'

describe('Api Service', () => {

  it('call() creates a simple get call spec', () => {
    expect(call('GET', 'topology')).toEqual({
      method: 'GET',
      path: 'topology'
    })
  })

  it('get() creates a simple GET call spec', () => {
    expect(get('topology')).toEqual({
      method: 'GET',
      path: 'topology'
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
