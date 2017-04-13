import React from 'react'
import configureMockStore from 'redux-mock-store';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect'
import { mount, shallow } from 'enzyme'

import { fetchingData, isArtemisaReceive } from 'util/api/artemisa-hoc'
import { artemisa } from 'reducer'
import { dataService } from 'util/api/api-service'
import { get, auth } from 'util/api/api-call'

const middlewares = [thunk, dataService];
const mockStore = configureMockStore(middlewares);

class MyComponent extends React.Component {
  render() {
    if (!this.props.weather) {
      return <div>Initializing</div>
    }
    if (this.props.weather.state === 'fetching') {
      return <div>Fetching</div>
    }
    if (this.props.weather.state === 'fetched') {
      return <div>Temperature is {this.props.weather.value.temp}</div>
    }
    // TODO: error
    return <div>{this.props.weather}</div>
  }
}

const MyComponentWithFetches = fetchingData({
  weather: {
    name: 'theWeather', 
    call: (props, state) => auth(get('getWeather'))
  }
})(MyComponent)

// TEST

describe('Artemisa fetchingData() HOC', () => {

  afterEach(() => {
    nock.cleanAll();
  })

  describe('basic mount - action dispatching', () => {
    let store = undefined

    beforeEach(() => {
      store = mockStore({
        artemisa: {}
      })
    })

    it('mounts correctly', () => {
      mount(
        <Provider store={store}>
          <MyComponentWithFetches />
        </Provider>
      )
    })

    it('dispatches the initial action', () => {
      mount(
        <Provider store={store}>
          <MyComponentWithFetches
          />
        </Provider>
      )
      expect(store.getActions()).toEqual([
        {
          type: 'ARTEMISA_theWeather',
          dataApiCall: {
            method: 'GET',
            path: 'getWeather',
            requiresAuthentication: true,
            token: undefined
          }
        },
        {
          type: 'ARTEMISA_theWeather_REQUEST',
          apiCallType: 'REQUEST',
          originType: 'ARTEMISA_theWeather',
          path: 'getWeather'
        }
      ])
    })

  })

  describe('rendering with real store (and reducer)', () => {
    let store = undefined

    beforeEach(() => {
      const blah = (state = {}, action) => {
        if (action.type === 'SET_CITY') {
          return {
            ...state,
            city: action.city
          }
        }
        return state
      }
      const reducer = combineReducers({ artemisa, blah })
      store = createStore(reducer, compose(applyMiddleware(
        thunk,
        dataService
      )))
    })

    it('renders FETCHING using the real store (reducer)', () => {
      const wrapper = mount(
        <Provider store={store}>
          <MyComponentWithFetches />
        </Provider>
      )
      expect(wrapper.html()).toEqual('<div>Fetching</div>')
    })

    it('renders FETCHED using the real store (reducer)', () => {
      const wrapper = mount(
        <Provider store={store}>
          <MyComponentWithFetches />
        </Provider>
      )
      store.dispatch({
        type: 'ARTEMISA_theWeather_RECEIVE',
        apiCallType: 'RECEIVE',
        originType: 'ARTEMISA_theWeather',
        path: 'getWeather',
        data: { temp: '23 degrees' }
      })
      expect(wrapper.text()).toEqual('Temperature is 23 degrees')
    })

    describe('Optionals', () => {

      it('TRANSFORMING the value to inject the property', () => {
        const MyComponentWithTransform = fetchingData({
          weather: {
            name: 'theWeather', 
            call: (props, state) => auth(get('getWeather')),
            transforming: v => ({ temp: v.temp.toUpperCase() })
          }
        })(MyComponent)

        const wrapper = mount(
          <Provider store={store}>
            <MyComponentWithTransform />
          </Provider>
        )
        store.dispatch({
          type: 'ARTEMISA_theWeather_RECEIVE',
          apiCallType: 'RECEIVE',
          originType: 'ARTEMISA_theWeather',
          path: 'getWeather',
          data: { temp: '23 degrees' }
        })
        expect(wrapper.text()).toEqual('Temperature is 23 DEGREES')
      })

      describe('on', () => {

        it('Conditional on() only executes the call if the condition is met (based on STATE)', () => {
          const MyComponentWithCondition = fetchingData({
            weather: {
              call: (props, state) => auth(get(`getWeather?city=${state.blah.city}`)),
              on: (props, state) => state.blah.city
            }
          })(MyComponent)

          const wrapper = mount(
            <Provider store={store}>
              <MyComponentWithCondition />
            </Provider>
          )

          // NOT FETCH YET !
          expect(wrapper.text()).toEqual('Initializing')

          // change data of condition
          store.dispatch({
            type: 'SET_CITY',
            city: 'Buenos Aires'
          })

          expect(wrapper.text()).toEqual('Fetching')
        })

        it.skip('Conditional on() only executes the call if the condition is met (based on PROPS)', () => {
          const MyComponentWithCondition = fetchingData({
            weather: {
              call: (props) => auth(get(`getWeather?city=${props.city}`)),
              on: (props) => props.city
            }
          })(MyComponent)

          const wrapper = mount(
            <Provider store={store}>
              <MyComponentWithCondition />
            </Provider>
          )

          // NOT FETCH YET !
          expect(wrapper.text()).toEqual('Initializing')

          // this shit doesnt work !! :S
          // I'm not sure, but I suspect that it is enzyme
          // not propagating the rerendering/update to all the inner elements
          wrapper.setProps({ city: 'Buenos Aires' })
          expect(wrapper.text()).toEqual('Fetching')
        })

      })


    })

    describe('shortcut API usages', () => {

      it('support shortcut fetch definition just with the call factory function, using the prop as storage field name', () => {
        const SimpleComponent = props => {
          return props.weather && props.weather.value ? (<div>Temperature is {props.weather.value.temp}</div>) : (<div>Nothing</div>)
        }
        const Component = fetchingData({
          weather: () => auth(get('getWeather'))
        })(SimpleComponent)

        const wrapper = mount(
          <Provider store={store}>
            <Component />
          </Provider>
        )
        store.dispatch({
          type: 'ARTEMISA_weather_RECEIVE',
          apiCallType: 'RECEIVE',
          originType: 'ARTEMISA_weather',
          path: 'getWeather',
          data: { temp: '25 degrees' }
        })
        expect(wrapper.text()).toEqual('Temperature is 25 degrees')
      })

      it('support not including "name"', () => {
        const SimpleComponent = props => {
          return props.weather && props.weather.value ? (<div>Temperature is {props.weather.value.temp}</div>) : (<div>Nothing</div>)
        }
        const Component = fetchingData({
          weather: {
            call: () => auth(get('getWeather'))
          }
        })(SimpleComponent)

        const wrapper = mount(
          <Provider store={store}>
            <Component />
          </Provider>
        )
        store.dispatch({
          type: 'ARTEMISA_weather_RECEIVE',
          apiCallType: 'RECEIVE',
          originType: 'ARTEMISA_weather',
          path: 'getWeather',
          data: { temp: '25 degrees' }
        })
        expect(wrapper.text()).toEqual('Temperature is 25 degrees')
      })


    })


  })

})

// internal functions testing

describe('Implementation utilites', () => {
  it('isArtemisaReceive()', () => {
    const action = { 
      type: 'ARTEMISA_theWeather_RECEIVE',
      originType: 'ARTEMISA_theWeather',
      apiCallType: 'RECEIVE',
      path: 'getWeather' 
    }
    expect(isArtemisaReceive(action)).toEqual(true)
  })

})