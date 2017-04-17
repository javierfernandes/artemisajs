import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { dataService } from 'core/service'
import { call, get } from 'core/call'
import { ApiCallType } from 'core/actions'

const middlewares = [thunk, dataService];
const mockStore = configureMockStore(middlewares);

describe('Core Service', () => {

  beforeEach(() => {
    nock('http://artemisajs.org/')
      .get('/ok')
      .reply(200, { blah: 'ok' })
  });

  afterEach(() => {
    nock.cleanAll();
  })

  it('Should dispatch the original action', () => (
    dispatchAndAssert(
      { type: 'GET_WEATHER' },
      (actions) =>
          expect(actions.find(a => a.type === 'GET_WEATHER')).toExist(true)
    )
  ))

  it('Should dispatch an extra action to notify the REQUEST with convention on type', () => {
    nock('http://artemisajs.org/')
      .get('/weather')
      .reply(200, [{ weather: 'someResponse' }])

    return dispatchAndAssert(
      { type: 'GET_WEATHER', dataApiCall: call('GET', 'weather') },
      (actions) =>
        expect(actions.find(
           a => a.type === 'GET_WEATHER_REQUEST' && a.apiCallType === ApiCallType.REQUEST)
        ).toExist()
    )
  })

  it('Should NOT dispatch a REQUEST action if is not an API CALL action', () => {
    return dispatchAndAssert(
      { type: 'GET_WEATHER' },
      actions =>
        expect(actions).toEqual([
          { type: 'GET_WEATHER' }
        ])
    )
  })

  it('Should dispatch a RECEIVE action if request was OK', () => {
    nock('http://artemisajs.org/')
        .get('/weather')
        .reply(200, { weather: 'someResponse' })

    return dispatchAndAssert(
      { type: 'GET_WEATHER', dataApiCall: call('GET', 'weather') },
      actions => {
        expect(actions).toEqual([
          { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'weather' } },
          { type: 'GET_WEATHER_REQUEST', originType: 'GET_WEATHER', apiCallType: ApiCallType.REQUEST, path: 'weather' },
          { type: 'GET_WEATHER_RECEIVE', originType: 'GET_WEATHER', apiCallType: ApiCallType.RECEIVE, data: { weather: 'someResponse' }, path: 'weather' }
        ])
      }
    )
  })

  it('Should dispatch an ERROR action if endpoint fails (not configured in nock)', () => {
    return dispatchAndAssert(
      { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'blah' } },
      actions =>
        expect(actions).toEqual([
          { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'blah' } },
          { type: 'GET_WEATHER_REQUEST', originType: 'GET_WEATHER', apiCallType: ApiCallType.REQUEST, path: 'blah' },
          { type: 'GET_WEATHER_ERROR', originType: 'GET_WEATHER', apiCallType: ApiCallType.ERROR, error: 'request to http://artemisajs.org/blah failed, reason: Nock: No match for request GET http://artemisajs.org/blah ', path: 'blah' }
        ])
    )
  })

  describe('Security', () => {

    it('Should get the token from the store state)', () => {
      nock('http://artemisajs.org/', {
        reqheaders: {
          Authorization: 'Bearer abc'
        }
      })
      .get('/weather')
      .reply(200, { weather: 'someResponse' })

      const theCall = get('weather')
      theCall.requiresAuthentication = true

      const store = mockStore({
        login: { token: 'abc' }
      });
      return store.dispatch({ type: 'GET_WEATHER', dataApiCall: theCall })
          .then(() => {
            expect(store.getActions()).toEqual([
              { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'weather', requiresAuthentication: true, token: 'abc' } },
              { type: 'GET_WEATHER_REQUEST', originType: 'GET_WEATHER', apiCallType: ApiCallType.REQUEST, path: 'weather' },
              { type: 'GET_WEATHER_RECEIVE', originType: 'GET_WEATHER', apiCallType: ApiCallType.RECEIVE, data: { weather: 'someResponse' }, path: 'weather' }
            ])
          }
      )
    })

  })

  describe('Transformations', () => {
    it('match and execute a registered transformations for action name', () => {
      nock('http://artemisajs.org/')
      .get('/temperature')
      .reply(200, { temperature: 21 })

      const theCall = get('temperature')

      dataService.registerTransformation('GET_TEMPERATURE', tempC => {
        return {
          temperature: tempC.temperature * 9 / 5 + 32
        }
      })

      const expectedTempH = 69.8

      const store = mockStore({});
      return store.dispatch({ type: 'GET_TEMPERATURE', dataApiCall: theCall })
        .then(() => {
          expect(store.getActions()).toEqual([
            { type: 'GET_TEMPERATURE', dataApiCall: { method: 'GET', path: 'temperature' } },
            { type: 'GET_TEMPERATURE_REQUEST', originType: 'GET_TEMPERATURE', apiCallType: ApiCallType.REQUEST, path: 'temperature' },
            { type: 'GET_TEMPERATURE_RECEIVE', originType: 'GET_TEMPERATURE', apiCallType: ApiCallType.RECEIVE, data: { temperature: expectedTempH }, path: 'temperature' }
          ])
        }
      )
    })
  })

})

function dispatchAndAssert(action, asserter) {
  const store = mockStore({});
  return store.dispatch(action)
    .then(() => asserter(store.getActions()))
}

