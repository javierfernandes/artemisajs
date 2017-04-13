import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import expect from 'expect'
import { asyncFetch, asyncMethod } from 'fetch/fetch-actions'
import tp from 'fetch/template'

const RECEIVE_ACTION = 'RECEIVE'
const REQUEST_ACTION = 'REQUEST'

const actions = {
  receive: RECEIVE_ACTION,
  request: REQUEST_ACTION
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('Asynch fetch actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  beforeEach(() => {
    nock('http://artemisajs.org/')
      .get('/foo/bar')
      .reply(200, [{ foo: 'bar' }])
      .get('/customer/1/bar')
      .reply(200, [{ customer: 1 }])
  })

  it('creates receive when it fetches', () => {
    const expectedActions = [
      { type: REQUEST_ACTION },
      { type: RECEIVE_ACTION, data: [{ foo: 'bar' }] }
    ]

    const foo = asyncFetch({ actions, path: 'foo/bar' })
    const store = mockStore({})

    return store.dispatch(foo.fetch())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
  })

  it('can take parameters on fetch path', () => {
    const expectedActions = [
      { type: REQUEST_ACTION, urlParams: { customerId: 1 } },
      { type: RECEIVE_ACTION, data: [{ customer: 1 }] }
    ]

    const foo = asyncFetch({ actions, path: tp`customer/${'customerId'}/bar` })
    const store = mockStore({})

    return store.dispatch(foo.fetch({ urlParams: { customerId: 1 } }))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
  })

  it('does not fetch if shouldFetch condition is not met', () => {
    const callbacks = {
      shouldFetch: () => false
    }
    const foo = asyncFetch({ actions, path: 'foo/bar', callbacks })
    const store = mockStore({})

    return store.dispatch(foo.fetch({ customerId: 1 }))
      .then(() => {
        expect(store.getActions()).toEqual([]);
      })
  })

  it('accepts a callback to decorate response', () => {
    const expectedActions = [
      { type: REQUEST_ACTION },
      { type: RECEIVE_ACTION, data: { decorated: [{ foo: 'bar' }] } }
    ]

    const callbacks = {
      decorateResponse: (data) => ({ decorated: data })
    }
    const foo = asyncFetch({ actions, path: 'foo/bar', callbacks })
    const store = mockStore({})

    return store.dispatch(foo.fetch())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
  })

  it('passes state to shouldFetch', () => {
    const expectedActions = [
      { type: REQUEST_ACTION },
      { type: RECEIVE_ACTION, data: [{ foo: 'bar' }] }
    ]

    const callbacks = {
      shouldFetch: (state) => (state.some)
    }

    const foo = asyncFetch({ actions, path: 'foo/bar', callbacks })
    const store = mockStore()
    const storeWithData = mockStore({ some: true })

    return Promise.all([
      store.dispatch(foo.fetch())
      .then(() => {
        expect(store.getActions()).toEqual([])
      }),
      storeWithData.dispatch(foo.fetch())
      .then(() => {
        expect(storeWithData.getActions()).toEqual(expectedActions)
      })
    ])
  })

  it('passes params to decorate response', () => {
    const expectedActions = [
      { type: REQUEST_ACTION, urlParams: { customerId: 1 } },
      { type: RECEIVE_ACTION, data: { 1: [{ customer: 1 }] } }
    ]

    const callbacks = {
      decorateResponse: (data, params) => ({ [params.customerId]: data })
    }
    const foo = asyncFetch({ actions, path: tp`customer/${'customerId'}/bar`, callbacks })
    const store = mockStore({})

    return store.dispatch(foo.fetch({ urlParams: { customerId: 1 } }))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
  })

  it('can override more than one callback at once', () => {
    const expectedActions = [
      { type: REQUEST_ACTION },
      { type: RECEIVE_ACTION, data: { decorated: [{ foo: 'bar' }] } }
    ]

    const callbacks = {
      shouldFetch: (state) => (state.some),
      decorateResponse: (data) => ({ decorated: data })
    }

    const foo = asyncFetch({ actions, path: 'foo/bar', callbacks })
    const store = mockStore()
    const storeWithData = mockStore({ some: true })

    return Promise.all([
      store.dispatch(foo.fetch())
      .then(() => {
        expect(store.getActions()).toEqual([]);
      }),
      storeWithData.dispatch(foo.fetch())
      .then(() => {
        expect(storeWithData.getActions()).toEqual(expectedActions)
      })
    ])
  })

  describe('action payload', () => {

    it('supports sending a payload on RECEIVE action', () => {
      const thePayload = { something: 'respect' }

      const callbacks = {
        shouldFetch: (state) => (state.some),
        decorateResponse: (data) => ({ decorated: data })
      }

      const call = asyncMethod('GET', { actions, path: 'foo/bar', callbacks })
      const store = mockStore()

      return store.dispatch(call({ actionPayload: { [RECEIVE_ACTION]: thePayload } }))
          .then(() => {
            expect(store.getActions()).toEqual([
              { type: REQUEST_ACTION },
              { type: RECEIVE_ACTION, data: { decorated: [{ foo: 'bar' }] }, payload: thePayload }
            ])
          })
    })

    it('supports sending a payload on REQUEST action', () => {
      const thePayload = { something: 'respect' }

      const callbacks = {
        shouldFetch: (state) => (state.some),
        decorateResponse: (data) => ({ decorated: data })
      }

      const call = asyncMethod('GET', { actions, path: 'foo/bar', callbacks })
      const store = mockStore()

      return store.dispatch(call({ actionPayload: {
        [REQUEST_ACTION]: thePayload }
      }))
          .then(() => {
            expect(store.getActions()).toEqual([
              { type: REQUEST_ACTION, payload: thePayload },
              { type: RECEIVE_ACTION, data: { decorated: [{ foo: 'bar' }] }}
            ])
          })
    })

  })


})
