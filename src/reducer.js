import { storagePropertyNameForAction, isArtemisaAction } from 'util/api/artemisa-hoc'
import { processApiAction } from 'util/api/api-reducer'

//
// TODO: 
//  - implement a cache timeout (store fetched date, and refetch after some time)
//  - implement an LRU to cache not only the last value but a couple of them for each URL

export function artemisa(state = {}, action) {
  if (action.originType && isArtemisaAction(action)) {
    return processApiAction(storagePropertyNameForAction(action), state, action)
  }
  return state
}