import React from 'react'

import { State, isInStateSlot } from './api-reducer'
import { FormattedMessage } from 'react-intl'

export default class DataFetchingComponent extends React.Component {

  propName() {
    throw new Error('Subclass responsibility')
  }

  getStyles() {
    return {
      error: 'DataFetchingComponent_error',
      noData: 'DataFetchingComponent_noData',
      loading: 'DataFetchingComponent_loading'
    }
  }

  render() {
    const data = this.props[this.propName()]

    if (!data) {
      return this.renderOnNoData()
    }
    if (this.isFetched()) {
      return this.renderOnValuePresent(data.value)
    }
    if (this.isFetching()) {
      return this.renderOnLoading()
    }
    if (this.isError()) {
      return this.renderOnError(data.error)
    }

    return <div></div>
  }

  isFetching() { return this.isState(State.FETCHING) }
  isFetched() { return this.isState(State.FETCHED) }
  isError() { return this.isState(State.ERROR) }
  isState(state) {
    return isInStateSlot(this.props[this.propName()], state)
  }

  renderOnNoData() {
    return (
      <div className={this.getStyles().noData}>{this.labelOnNoData()}</div>
    )
  }

  labelOnNoData() {
    return this.props.labelNoData || (
      <FormattedMessage
        id="DataFetchingComponent.noData"
        defaultMessage={'No data'}
      />
    )
  }

  renderOnValuePresent(value) {
    return <div>{value}</div>
  }

  renderOnError(error) {
    return (
      <div className={this.getStyles().error}>
        <h3>
          <FormattedMessage
            id="DataFetchingComponent.errorLoading"
            defaultMessage={'Error loading data'}
          />
        </h3>
        <div>{error}</div>
      </div>
    )
  }

  renderOnLoading() {
    return this.props.loadingComponent || this.renderOnLoadingDefault()
  }

  renderOnLoadingDefault() {
    return (
      <div className={this.getStyles().loading}>
        <FormattedMessage
          id="DataFetchingComponent.loading"
          defaultMessage={'Loading'}
        />
      </div>
    )
  }

}
