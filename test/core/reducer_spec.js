import expect from 'expect';
import { State } from 'core/model'
import { fetchAndSet, withFetchs } from 'core/reducer'
import { ApiCallType } from 'core/actions'

describe('Core Reducer', () => {

  const dummyReducer = (state) => state

  describe('simple reducer decoration', () => {

    it('Should bypass any action without initial state', () => {
      const reducer = fetchAndSet(dummyReducer, 'weather');
      const state = reducer({}, {})
      expect(state).toEqual({})
    })

    it('Should bypass any action that is not a request', () => {
      const reducer = fetchAndSet(dummyReducer, 'weather');
      const state = reducer({ a: 'a' }, {})
      expect(state).toEqual({ a: 'a' })
    })

    it('Should set as FETCHING if it is a REQUEST action', () => {
      const originType = 'originAction'
      const reducer = fetchAndSet(dummyReducer, originType, 'weather');

      const action = {
        originType,
        type: 'getsomething',
        apiCallType: ApiCallType.REQUEST
      }

      const state = reducer({ a: 'a' }, action)
      expect(state).toEqual({
        a: 'a',
        weather: {
          state: State.FETCHING,
          path: undefined
        }
      })
    })

    it('Should set as FETCHED if it is a RECEIVE action', () => {
      const originType = 'originAction'
      const aWeather = { weath: '25' }

      const reducer = fetchAndSet(dummyReducer, originType, 'weather');
      const action = { originType, type: 'GET_WEATHER_RECEIVE', apiCallType: ApiCallType.RECEIVE, data: aWeather }

      const state = reducer({ a: 'a' }, action)
      expect(state).toEqual({
        a: 'a',
        weather: {
          state: State.FETCHED,
          value: aWeather,
          path: undefined
        }
      })
    })

    it('Should set as ERROR if it is an ERROR action', () => {
      const originType = 'originAction'
      const anError = { message: 'some error' }

      const reducer = fetchAndSet(dummyReducer, originType, 'weather');
      const action = { originType, type: 'GET_WEATHER_RECEIVE', apiCallType: ApiCallType.ERROR, error: anError }

      const state = reducer({ a: 'a' }, action)
      expect(state).toEqual({
        a: 'a',
        weather: {
          state: State.ERROR,
          error: anError,
          path: undefined
        }
      })
    })

  })

  describe('multiple reducers decorations', () => {

    it('should only handle the appropiated request', () => {
      const action = {
        originType: 'get another thing',
        type: 'getsomething',
        apiCallType: ApiCallType.REQUEST
      }

      const initialState = { a: 'a' }

      const reducer = fetchAndSet(dummyReducer, 'get weather', 'weather')

      const state = reducer(initialState, action)
      expect(state).toEqual(initialState)
    })

    it('should allow multiple decorations of reducers', () => {
      const getUser = {
        originType: 'get user',
        type: 'getuser',
        apiCallType: ApiCallType.REQUEST
      }
      const getRole = {
        originType: 'get role',
        type: 'getrole',
        apiCallType: ApiCallType.REQUEST
      }

      const reducer =
        fetchAndSet(
          fetchAndSet(dummyReducer, 'get user', 'user'),
          'get role', 'role'
        )

      // first action (getUser)
      let state = reducer({ a: 'a' }, getUser)
      expect(state).toEqual({
        a: 'a',
        user: { state: State.FETCHING, path: undefined }
      })

      //
      state = reducer(state, getRole)
      expect(state).toEqual({
        a: 'a',
        user: { state: State.FETCHING, path: undefined },
        role: { state: State.FETCHING, path: undefined }
      })
    })

    it('should allow multiple decorations expressed with withFechs() method', () => {
      const getUser = {
        originType: 'get user',
        type: 'getuser',
        apiCallType: ApiCallType.REQUEST
      }
      const getRole = {
        originType: 'get role',
        type: 'getrole',
        apiCallType: ApiCallType.REQUEST
      }
      const reducer = withFetchs(dummyReducer, {
        'get user': 'user',
        'get role': 'role'
      })

      // first action (getUser)
      let state = reducer({ a: 'a' }, getUser)
      expect(state).toEqual({
        a: 'a',
        user: { state: State.FETCHING, path: undefined }
      })

      //
      state = reducer(state, getRole)
      expect(state).toEqual({
        a: 'a',
        user: { state: State.FETCHING, path: undefined },
        role: { state: State.FETCHING, path: undefined }
      })
    })

  })

})
