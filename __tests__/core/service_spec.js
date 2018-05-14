import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { dataService, DEFAULT_BASE_URL } from 'core/service'
import { call, get } from 'core/call'
import { ApiCallType } from 'core/actions'

const middlewares = [thunk, dataService()];
const mockStore = configureMockStore(middlewares);

describe('Core Service', () => {

  beforeEach(() => {
    nock(DEFAULT_BASE_URL)
      .get('/ok')
      .reply(200, { blah: 'ok' })
  })

  afterEach(() => {
    nock.cleanAll();
  })

  const getWeatherOkAsserter = actions => {
    expect(actions).toEqual([
      { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'weather' } },
      { type: 'GET_WEATHER_REQUEST', originType: 'GET_WEATHER', apiCallType: ApiCallType.REQUEST, path: 'weather' },
      { type: 'GET_WEATHER_RECEIVE', originType: 'GET_WEATHER', apiCallType: ApiCallType.RECEIVE, data: { weather: 'someResponse' }, path: 'weather' }
    ])
  }

  it('should dispatch the original action', () => (
    dispatchAndAssert(
      { type: 'GET_WEATHER' },
      (actions) =>
          expect(actions.find(a => a.type === 'GET_WEATHER')).toBeTruthy()
    )
  ))

  it('should honor the baseUrl custom configuration', () => {
    const CUSTOM_BASE_URL = 'https://weather.com'
    nock(CUSTOM_BASE_URL)
      .get('/weather')
      .reply(200, { weather: 'someResponse' })
    const customDataService = dataService({ call: { baseUrl: CUSTOM_BASE_URL } })
    const customMockStore = configureMockStore([thunk, customDataService])

    const customStore = customMockStore({});
    return customStore
      .dispatch({ type: 'GET_WEATHER', dataApiCall: call('GET', 'weather') })
      .then(() => getWeatherOkAsserter(customStore.getActions()))
  })

  it('should dispatch an extra action to notify the REQUEST with convention on type', () => {
    nock(DEFAULT_BASE_URL)
      .get('/weather')
      .reply(200, [{ weather: 'someResponse' }])

    return dispatchAndAssert(
      { type: 'GET_WEATHER', dataApiCall: call('GET', 'weather') },
      actions =>
        expect(actions.find(
           a => a.type === 'GET_WEATHER_REQUEST' && a.apiCallType === ApiCallType.REQUEST)
        ).toBeTruthy()
    );
  })

  it('should NOT dispatch a REQUEST action if is not an API CALL action', () => {
    return dispatchAndAssert(
      { type: 'GET_WEATHER' },
      actions =>
        expect(actions).toEqual([
          { type: 'GET_WEATHER' }
        ])
    )
  })

  it('should dispatch a RECEIVE action if request was OK', () => {
    nock(DEFAULT_BASE_URL)
        .get('/weather')
        .reply(200, { weather: 'someResponse' })

    return dispatchAndAssert(
      { type: 'GET_WEATHER', dataApiCall: call('GET', 'weather') },
      getWeatherOkAsserter
    )
  })

  describe('error handling', () => {

    it('should dispatch an ERROR action if endpoint fails (not configured in nock)', () => {
      return dispatchAndAssert(
        { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'blah' } },
        actions =>
          expect(actions).toEqual([
            { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'blah' } },
            { type: 'GET_WEATHER_REQUEST', originType: 'GET_WEATHER', apiCallType: ApiCallType.REQUEST, path: 'blah' },
            { type: 'GET_WEATHER_ERROR', originType: 'GET_WEATHER', apiCallType: ApiCallType.ERROR, error: `request to ${DEFAULT_BASE_URL}/blah failed, reason: Nock: No match for request GET ${DEFAULT_BASE_URL}/blah `, path: 'blah' }
          ])
      )
    })
  
    it('should dispatch an ERROR server response is 500', () => {
      nock('http://artemisajs.org/')
      .get('/blah')
      .reply(500, { error: { message: 'Something went really wrong' } })

      return dispatchAndAssert(
        { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'blah' } },
        actions =>
          expect(actions).toEqual([
            { type: 'GET_WEATHER', dataApiCall: { method: 'GET', path: 'blah' } },
            { type: 'GET_WEATHER_REQUEST', originType: 'GET_WEATHER', apiCallType: ApiCallType.REQUEST, path: 'blah' },
            { type: 'GET_WEATHER_ERROR', originType: 'GET_WEATHER', apiCallType: ApiCallType.ERROR, error: 'Something went really wrong', path: 'blah' }
          ])
      )
    })

  })

  describe('Security', () => {

    it('should get the token from the store state)', () => {
      nock(DEFAULT_BASE_URL, {
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
      nock(DEFAULT_BASE_URL)
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

    it('uses the store in a registered transformations', () => {
      const celciusT = 21

      nock(DEFAULT_BASE_URL)
        .get('/temperature')
        .times(2)
        .reply(200, { temperature: celciusT })

      const theCall = get('temperature')

      dataService.registerTransformation('GET_TEMPERATURE', (tempC, store) => {
        return {
          temperature: store.getState().farenheit ? (tempC.temperature * 9 / 5 + 32) : tempC.temperature
        }
      })

      const expectedTempH = 69.8

      const storeExpectations = (store, temperature) =>
        expect(store.getActions()).toEqual([
          { type: 'GET_TEMPERATURE', dataApiCall: { method: 'GET', path: 'temperature' } },
          { type: 'GET_TEMPERATURE_REQUEST', originType: 'GET_TEMPERATURE', apiCallType: ApiCallType.REQUEST, path: 'temperature' },
          { type: 'GET_TEMPERATURE_RECEIVE', originType: 'GET_TEMPERATURE', apiCallType: ApiCallType.RECEIVE, data: { temperature: temperature }, path: 'temperature' }
        ])


      const farenheitTrueStore = mockStore({ farenheit: true });
      return farenheitTrueStore.dispatch({ type: 'GET_TEMPERATURE', dataApiCall: theCall })
        .then(() => storeExpectations(farenheitTrueStore, expectedTempH))
        .then(() => {
          const farenheitFalseStore = mockStore({ farenheit: false });
          return farenheitFalseStore.dispatch({ type: 'GET_TEMPERATURE', dataApiCall: theCall })
            .then(() => storeExpectations(farenheitFalseStore, celciusT))
        })
    })

  })

})

const dispatchAndAssert = async (action, asserter) => {
  const store = mockStore({})
  await store.dispatch(action)
  asserter(store.getActions())
}

