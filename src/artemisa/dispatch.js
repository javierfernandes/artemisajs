import { isReceive } from '../core/actions'
import { shouldFetch } from '../core/reducer'

export const ARTEMISA = 'ARTEMISA'
export const isArtemisaType = type => type.indexOf(ARTEMISA) === 0
export const isArtemisaReceive = action => isReceive(action) && isArtemisaType(action.originType)
export const isArtemisaAction = action => isArtemisaType(action.type)

export function storagePropertyNameForAction(action) {
  return action.originType.slice(ARTEMISA.length + 1)
} 

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