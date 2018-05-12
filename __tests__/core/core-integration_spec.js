import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { dataService } from 'core/service'
import { call } from 'core/call'
import { ApiCallType } from 'core/actions'

const middlewares = [thunk, dataService];
const mockStore = configureMockStore(middlewares);

describe('Core Service - Integration Tests', () => {

  beforeEach(() => {
    nock('http://artemisajs.org/')
      .get('/ok')
      .reply(200, { blah: 'ok' })
  });

  afterEach(() => {
    nock.cleanAll();
  })

  it('Should dispatch an extra action to notify the REQUEST with convention on type', () => {
    nock('http://artemisajs.org/')
      .post('/todoItem')
      .reply(200, [{ status: 'ok' }])

    return dispatchAndAssert(
      { type: 'GET_WEATHER', dataApiCall: call('POST', 'todoItem') },
      (actions) =>
        expect(actions.find(
           a => a.type === 'GET_WEATHER_REQUEST' && a.apiCallType === ApiCallType.REQUEST)
        ).toExist()
    )
  })

})

function dispatchAndAssert(action, asserter) {
  const store = mockStore({});
  return store.dispatch(action)
    .then(() => asserter(store.getActions()))
}

