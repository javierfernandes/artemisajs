import expect from 'expect'
import { fetchReducer } from 'fetch/fetch-reducer.js'

describe('Fetch reducer', () => {
  const REQUEST_ACTION = 'REQUEST'
  const RECEIVE_ACTION = 'RECEIVE'

  const actions = {
    request: REQUEST_ACTION,
    receive: RECEIVE_ACTION
  }

  it('Should start empty, not fetching and not ready', () => {
    const reducer = fetchReducer(actions)
    const state = reducer(undefined, {})
    expect(state.data).toBe(undefined)
    expect(state.fetching).toBe(false)
    expect(state.ready).toBe(false)
  })

  it('Should mark as fetching on REQUEST', () => {
    const reducer = fetchReducer(actions)
    const state = reducer(undefined, { type: REQUEST_ACTION })
    expect(state.fetching).toBe(true)
  })

  it('Should mark as not ready on REQUEST', () => {
    const reducer = fetchReducer(actions)
    const state = reducer({ ready: true }, { type: REQUEST_ACTION })
    expect(state.ready).toBe(false)
  })

  it('Should not remove data on REQUEST', () => {
    const data = { foo: 'bar' }
    const reducer = fetchReducer(actions)
    const state = reducer({ data }, { type: REQUEST_ACTION })
    expect(state.data).toEqual(data)
  })

  it('Should update data on RECEIVE', () => {
    const data = { foo: 'bar' }
    const reducer = fetchReducer(actions)
    const state = reducer(
      { some: 'other' },
      { type: RECEIVE_ACTION, data }
    )
    expect(state.data).toEqual(data)
  })

  it('Should mark as not fetching on RECEIVE', () => {
    const reducer = fetchReducer(actions)
    const state = reducer({ fetching: true }, { type: RECEIVE_ACTION })
    expect(state.fetching).toBe(false)
  })

  it('Should mark as ready on RECEIVE', () => {
    const reducer = fetchReducer(actions)
    const state = reducer({ ready: false }, { type: RECEIVE_ACTION })
    expect(state.ready).toBe(true)
  })

  it('Should accept a callback to proccess the data', () => {
    const data = { foo: 'foo' }
    const newData = { bar: 'bar' }
    const expectedData = { foo: 'foo', bar: 'bar' }
    const processData = (stateData, actionData) =>
      ({ ...stateData, ...actionData })

    const reducer = fetchReducer(actions, { processData })
    const state = reducer({ data }, { type: RECEIVE_ACTION, data: newData })
    expect(state.data).toEqual(expectedData)
  })
})
