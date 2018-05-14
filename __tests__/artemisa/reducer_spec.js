import { artemisa } from 'artemisa/reducer';

describe('Artemisa reducer', () => {

  it('should return the initial state if state is undefined', () => {
    const state = artemisa(undefined, {})
    expect(state).toEqual({})
  })

  it('should do nothing on initial action', () => {
    const action = {
      type: 'ARTEMISA_theWeather',
      dataApiCall: {
        method: 'GET',
        path: 'getWeather',
        requiresAuthentication: true,
        token: undefined
      }
    }
    const state = artemisa(undefined, action)
    expect(state).toEqual({});
  })

  it('should update state on REQUEST to fetching', () => {
    const action = {
      type: 'ARTEMISA_theWeather_REQUEST',
      apiCallType: 'REQUEST',
      originType: 'ARTEMISA_theWeather',
      path: 'getWeather'
    }
    const state = artemisa(undefined, action);
    expect(state).toEqual({
      theWeather: {
        state: 'fetching',
        path: 'getWeather'
      }
    })
  })

  it('should update state on RECEIVE to fetched', () => {
    const action = {
      type: 'ARTEMISA_theWeather_RECEIVE',
      apiCallType: 'RECEIVE',
      originType: 'ARTEMISA_theWeather',
      path: 'getWeather',
      data: { temp: '23 degrees' }
    }
    const state = artemisa(undefined, action);
    expect(state).toEqual({
      theWeather: {
        state: 'fetched',
        path: 'getWeather',
        value: { temp: '23 degrees' }
      }
    })
  })

  it('should update state on ERROR fetching', () => {
    const action = {
      type: 'ARTEMISA_theWeather_ERROR',
      apiCallType: 'ERROR',
      originType: 'ARTEMISA_theWeather',
      path: 'getWeather',
      error: 'connection problem'
    }
    const state = artemisa(undefined, action);
    expect(state).toEqual({
      theWeather: {
        state: 'error',
        path: 'getWeather',
        error: 'connection problem'
      }
    })
  })

  it('should fail if it is an unknown ARTEMISA_action', () => {
    const action = {
      type: 'ARTEMISA_theWeather_REQUEST',
      apiCallType: 'FRULA',
      originType: 'ARTEMISA_theWeather',
      path: 'getWeather'
    }
    expect(() => artemisa(undefined, action)).toThrow('Unknown API action');
  })

})
