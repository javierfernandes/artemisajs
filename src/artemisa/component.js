import React from 'react'
import { connect } from 'react-redux'

import { State } from '../core/model'
import { isReceive } from '../core/actions'
import { hasValueInKey } from '../util/object'
import { shouldFetch } from '../core/reducer'
import { isFunction, trueFn, identity } from '../util/function'
export const ARTEMISA = 'ARTEMISA'

export const isArtemisaType = type => !!type.match('ARTEMISA')
export const isArtemisaReceive = action => isReceive(action) && isArtemisaType(action.originType)
export const isArtemisaAction = action => isArtemisaType(action.type)

export function storagePropertyNameForAction(action) {
  return action.originType.slice(ARTEMISA.length + 1)
}

/**
 * Base class of the higher order component.
 */
class AbstractWithFetches extends React.Component {

  componentDidMount() { this.tryToFetch() }
  componentDidUpdate() { this.tryToFetch() }

  tryToFetch() {
    const { state, dispatch } = this.props;
    this.getFetches().forEach(fetch => {
      this.dispatchFetch(fetch, state, dispatch)
    })
  }

  dispatchFetch({ storeFieldName, call, on }, state, dispatch) {
    if (!on(this.props, state)) {
      return;
    }
    const action = ({
      type: `${ARTEMISA}_${storeFieldName}`,
      dataApiCall: call(this.props, state)
    })
    const should = shouldFetch(state.artemisa[storeFieldName], action.dataApiCall.path, s => s.path)
    if (should) {
      dispatch(action)
    }
  }

  render() {
    const fetched = this.mapStateToProps()
    const Wrapped = this.getWrappedComponent()
    /* eslint no-unused-vars: 0 */
    const { state, ...props } = this.props
    return <Wrapped {...props} {...fetched} />
  }

  mapStateToProps() {
    const { state } = this.props
    return this.getFetches().reduce((props, fetch) => {
      if (fetch.on(props, state)) {
        props[fetch.propName] = this.mapFetchToProp(fetch, state)
      }
      return props
    }, {})
  }

  mapFetchToProp({ storeFieldName, transforming }, state) {
    const stateValue = state.artemisa[storeFieldName]
    return hasValueInKey(stateValue, 'state', State.FETCHED) ? { ...stateValue, value: transforming(stateValue.value) } : stateValue
  }

}

/**
 * A Fetch internal Descriptor has the following form
 * {
 *    propName (always present): property name to use to inject the slot,
 *    storeFieldName (always present): the property to store the cache in the store.
 *    call (always present): function(props, state) that returns the call object
 *    transforming: optional transformation
 * }
 */
const createFetchDescriptors = fetches => Object.keys(fetches).map(propName => {
  const value = fetches[propName]
  return {
    propName,
    storeFieldName: value.name || propName,     // defaults to propName
    call: isFunction(value) ? value : value.call,
    transforming: value.transforming ? value.transforming : identity,
    on: value.on ? value.on : trueFn
  }
})

export const fetchingData = fetches => WrappedComponent => {
  const fetchDescriptors = createFetchDescriptors(fetches)
  class WithFetches extends AbstractWithFetches {
    getFetches() { return fetchDescriptors }
    getWrappedComponent() { return WrappedComponent }
  }
  WithFetches.displayName = `WithFetches(${getDisplayName(WrappedComponent)})`;
  return connect(state => ({ state }), dispatch => ({ dispatch }))(WithFetches)
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
