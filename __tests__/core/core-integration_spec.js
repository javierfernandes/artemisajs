import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { dataService, DEFAULT_BASE_URL } from 'core/service'
import { call } from 'core/call'
import { ApiCallType } from 'core/actions'

const middlewares = [thunk, dataService()];
const mockStore = configureMockStore(middlewares);

describe('Core Service - Integration Tests', () => {

  beforeEach(() => {
    nock(DEFAULT_BASE_URL)
      .get('/ok')
      .reply(200, { blah: 'ok' })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should dispatch an extra action to notify the REQUEST with convention on type', () => {
    nock(DEFAULT_BASE_URL)
      .post('/todoItem')
      .reply(200, [{ status: 'ok' }])

    return dispatchAndAssert(
      { type: 'GET_WEATHER', dataApiCall: call('POST', 'todoItem') },
      actions =>
        expect(actions).toMatchObject([
          { type: 'GET_WEATHER' },
          { type: 'GET_WEATHER_REQUEST', apiCallType: ApiCallType.REQUEST },
          { type: 'GET_WEATHER_RECEIVE', apiCallType: ApiCallType.RECEIVE }
        ])
    )
  })

})

const dispatchAndAssert = async (action, asserter) => {
  const store = mockStore({})
  await store.dispatch(action)
  asserter(store.getActions())
}

