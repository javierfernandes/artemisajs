import { isReceive } from '../core/actions'
import { isFetchingSlot, isErrorSlot } from '../core/model'

export const ARTEMISA = 'ARTEMISA'
export const isArtemisaType = type => type && !!type.match(/^ARTEMISA/)
export const isArtemisaReceive = action => isReceive(action) && isArtemisaType(action.originType)
export const isArtemisaAction = action => isArtemisaType(action.type)

export const storagePropertyNameForAction = action => action.originType.slice(ARTEMISA.length + 1)

export function dispatchFetches(props, state, dispatch, fetches) {
  fetches.forEach(fetch => {
    dispatchFetch(props, state, dispatch, fetch)
  })
}

function dispatchFetch(props, state, dispatch, { storeFieldName, call, on }) {
  if (!on(props, state)) {
    return;
  }
  const action = ({
    type: `${ARTEMISA}_${storeFieldName}`,
    dataApiCall: call(props, state)
  })
  const should = shouldFetch(state.artemisa[storeFieldName], action.dataApiCall.path, s => s.path)
  if (should) {
    dispatch(action)
  }
}

/**
 * If we have a piece state managed by this framework, and the value has a transformerId,
 * this function tells if it is necessary to do a new fetch.
 */
function shouldFetch(fetchState, key, keyProvider) {

  // No key => no fetch
  if (!key) return false

  // fecthState is not even initialized, do a first fetch
  if (!fetchState) return true

  // We are already fetching
  if (isFetchingSlot(fetchState) && (!keyProvider || keyProvider(fetchState) === key)) return false

  // Handle errors
  if (isErrorSlot(fetchState)) {
    /* eslint-disable no-console */
    console.log(`Ignoring request to fetch '${key}' because of previous error: '${fetchState.error}'`)
    return false
  }

  return (keyProvider || (s => s.value.transformerId))(fetchState) !== key
}