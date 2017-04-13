import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { dataService } from '../../../src/util/api/api-service'
import { call, get } from '../../../src/util/api/api-call'
import { ApiCallType } from '../../../src/util/api/api-actions'

const middlewares = [thunk, dataService];
const mockStore = configureMockStore(middlewares);

describe('Api Service', () => {

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
      { type: 'GET_TOPOLOGY' },
      (actions) =>
          expect(actions.find(a => a.type === 'GET_TOPOLOGY')).toExist(true)
    )
  ))

  it('Should dispatch an extra action to notify the REQUEST with convention on type', () => {
    nock('http://artemisajs.org/')
      .get('/topology')
      .reply(200, [{ topology: 'someResponse' }])

    return dispatchAndAssert(
      { type: 'GET_TOPOLOGY', dataApiCall: call('GET', 'topology') },
      (actions) =>
        expect(actions.find(
           a => a.type === 'GET_TOPOLOGY_REQUEST' && a.apiCallType === ApiCallType.REQUEST)
        ).toExist()
    )
  })

  it('Should NOT dispatch a REQUEST action if is not an API CALL action', () => {
    return dispatchAndAssert(
      { type: 'GET_TOPOLOGY' },
      actions =>
        expect(actions).toEqual([
          { type: 'GET_TOPOLOGY' }
        ])
    )
  })

  it('Should dispatch a RECEIVE action if request was OK', () => {
    nock('http://artemisajs.org/')
        .get('/topology')
        .reply(200, { topology: 'someResponse' })

    return dispatchAndAssert(
      { type: 'GET_TOPOLOGY', dataApiCall: call('GET', 'topology') },
      actions => {
        expect(actions).toEqual([
          { type: 'GET_TOPOLOGY', dataApiCall: { method: 'GET', path: 'topology' } },
          { type: 'GET_TOPOLOGY_REQUEST', originType: 'GET_TOPOLOGY', apiCallType: ApiCallType.REQUEST, path: 'topology' },
          { type: 'GET_TOPOLOGY_RECEIVE', originType: 'GET_TOPOLOGY', apiCallType: ApiCallType.RECEIVE, data: { topology: 'someResponse' }, path: 'topology' }
        ])
      }
    )
  })

  it('Should dispatch an ERROR action if endpoint fails (not configured in nock)', () => {
    return dispatchAndAssert(
      { type: 'GET_TOPOLOGY', dataApiCall: { method: 'GET', path: 'blah' } },
      actions =>
        expect(actions).toEqual([
          { type: 'GET_TOPOLOGY', dataApiCall: { method: 'GET', path: 'blah' } },
          { type: 'GET_TOPOLOGY_REQUEST', originType: 'GET_TOPOLOGY', apiCallType: ApiCallType.REQUEST, path: 'blah' },
          { type: 'GET_TOPOLOGY_ERROR', originType: 'GET_TOPOLOGY', apiCallType: ApiCallType.ERROR, error: 'request to http://artemisajs.org/blah failed, reason: Nock: No match for request GET http://artemisajs.org/blah ', path: 'blah' }
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
      .get('/topology')
      .reply(200, { topology: 'someResponse' })

      const theCall = get('topology')
      theCall.requiresAuthentication = true

      const store = mockStore({
        login: { token: 'abc' }
      });
      return store.dispatch({ type: 'GET_TOPOLOGY', dataApiCall: theCall })
          .then(() => {
            expect(store.getActions()).toEqual([
              { type: 'GET_TOPOLOGY', dataApiCall: { method: 'GET', path: 'topology', requiresAuthentication: true, token: 'abc' } },
              { type: 'GET_TOPOLOGY_REQUEST', originType: 'GET_TOPOLOGY', apiCallType: ApiCallType.REQUEST, path: 'topology' },
              { type: 'GET_TOPOLOGY_RECEIVE', originType: 'GET_TOPOLOGY', apiCallType: ApiCallType.RECEIVE, data: { topology: 'someResponse' }, path: 'topology' }
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

