import React from 'react'
import { connect } from 'react-redux'
import { State, isInStateSlot } from '../core/model'
import { isFunction, trueFn, identity, properties } from '../util/object'
import { dispatchFetches } from './dispatch'

/**
 * Base class of the higher order component.
 */
class AbstractWithFetches extends React.Component {

  componentDidMount() { this.tryToFetch() }
  componentDidUpdate() { this.tryToFetch() }

  tryToFetch() {
    const { state, dispatch } = this.props;
    dispatchFetches(this.props, state, dispatch, this.getFetches())
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
    return isInStateSlot(stateValue, State.FETCHED) ? { ...stateValue, value: transforming(stateValue.value) } : stateValue
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
const createFetchDescriptors = fetches => properties(fetches).map(({ name, value }) => (
  {
    propName: name,
    storeFieldName: value.name || name,     // defaults to propName
    call: isFunction(value) ? value : value.call,
    transforming: value.transforming || identity,
    on: value.on || trueFn
  }
))

/**
 * Decorator function to create a React Higher-order Component wrapping
 * your component so that Artemisa can take care of server fetches.
 * 
 * @param {*} fetches an object that describes one or many "fetches" as properties.
 */
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