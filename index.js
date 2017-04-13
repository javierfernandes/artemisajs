
export { fetchingData } from './src/artemisa/component'
import { artemisa } from './src/artemisa/reducer'
import { dataService } from './src/core/service'

export const reducer = artemisa
export const service = dataService

export { isFetching, isFetched } from './src/core/reducer'
export { State, isErrorSlot, isFetchedSlot, isFetchingSlot } from './src/core/model'