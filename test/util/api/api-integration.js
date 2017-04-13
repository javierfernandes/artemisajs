import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { dataService } from '../../../src/util/api/api-service'
import { call } from '../../../src/util/api/api-call'
import { ApiCallType } from '../../../src/util/api/api-actions'

const middlewares = [thunk, dataService];
const mockStore = configureMockStore(middlewares);

describe('Api Service - Integration Tests', () => {

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
      { type: 'GET_TOPOLOGY', dataApiCall: call('POST', 'todoItem') },
      (actions) =>
        expect(actions.find(
           a => a.type === 'GET_TOPOLOGY_REQUEST' && a.apiCallType === ApiCallType.REQUEST)
        ).toExist()
    )
  })

})

function dispatchAndAssert(action, asserter) {
  const store = mockStore({});
  return store.dispatch(action)
    .then(() => asserter(store.getActions()))
}

