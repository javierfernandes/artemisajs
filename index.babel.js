
export { fetchingData } from './lib/artemisa/component'
export { artemisa as reducer, isFetching, isFetched, processApiAction } from './lib/artemisa/reducer'
export { dataService as service } from './lib/core/service'
export { State, isErrorSlot, isFetchedSlot, isFetchingSlot } from './lib/core/model'

// internals that needs to be removed
export { shouldFetch, actionName } from './lib/artemisa/dispatch'
export { simulateDataReceive, isDerivedActionFor, receiveTypeFor } from './lib/core/actions'