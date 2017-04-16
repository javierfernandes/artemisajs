
export { fetchingData } from './src/artemisa/component'
export { artemisa as reducer, isFetching, isFetched, processApiAction } from './src/artemisa/reducer'
export { dataService as service } from './src/core/service'
export { State, isErrorSlot, isFetchedSlot, isFetchingSlot } from './src/core/model'

// internals that needs to be removed
export { shouldFetch } from './src/artemisa/dispatch'
export { simulateDataReceive, isDerivedActionFor, receiveTypeFor } from './src/core/actions'