import React from 'react'
import configureMockStore from 'redux-mock-store'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { mount } from 'enzyme'
import { fetchingData } from 'artemisa/component'
import { isArtemisaReceive } from 'artemisa/dispatch'
import { artemisa } from 'artemisa/reducer'
import { State } from 'core/model'
import { dataService } from 'core/service'
import { get, auth } from 'core/call'

const middlewares = [thunk, dataService()]
const mockStore = configureMockStore(middlewares)

class MyComponent extends React.Component {
  render() {
    const { weather } = this.props
    if (!weather) {
      return <div>Initializing</div>
    }
    if (weather.state === State.FETCHING) {
      return <div>Fetching</div>
    }
    if (weather.state === State.FETCHED) {
      return <div>Temperature is {weather.value.temp}</div>
    }
    // TODO: error
    return <div>{JSON.stringify(weather)}</div>
  }
}

const MyComponentWithFetches = fetchingData({
  weather: {
    name: 'theWeather',
    call: () => auth(get('getWeather'))
  }
})(MyComponent)

// TEST

describe('Artemisa fetchingData() HOC', () => {

  describe('basic mount - action dispatching', () => {
    let store = undefined

    beforeEach(() => {
      store = mockStore({ artemisa: {} })
    })

    it('mounts correctly', () => {
      mount(
        <Provider store={store}>
          <MyComponentWithFetches />
        </Provider>
      ).unmount()
    })

    it('dispatches the initial action', () => {
      const c = mount(
        <Provider store={store}>
          <MyComponentWithFetches />
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
      c.unmount()
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
        dataService()
      )))
    })

    it('renders FETCHING using the real store (reducer)', () => {
      const wrapper = mount(
        <Provider store={store}>
          <MyComponentWithFetches />
        </Provider>
      )
      expect(wrapper.html()).toEqual('<div>Fetching</div>')
      wrapper.unmount()
    })

    it('renders FETCHED using the real store (reducer)', async () => {
      const wrapper = mount(
        <Provider store={store}>
          <MyComponentWithFetches />
        </Provider>
      )
      await store.dispatch({
        type: 'ARTEMISA_theWeather_RECEIVE',
        apiCallType: 'RECEIVE',
        originType: 'ARTEMISA_theWeather',
        path: 'getWeather',
        data: { temp: '23 degrees' }
      })
      expect(wrapper.text()).toEqual('Temperature is 23 degrees')
      wrapper.unmount()
    })

    describe('Optionals', () => {

      it('TRANSFORMING the value to inject the property', async () => {
        const MyComponentWithTransform = fetchingData({
          weather: {
            name: 'theWeather',
            call: () => auth(get('getWeather')),
            transforming: v => ({ temp: v.temp.toUpperCase() })
          }
        })(MyComponent)

        const wrapper = mount(
          <Provider store={store}>
            <MyComponentWithTransform />
          </Provider>
        )
        await store.dispatch({
          type: 'ARTEMISA_theWeather_RECEIVE',
          apiCallType: 'RECEIVE',
          originType: 'ARTEMISA_theWeather',
          path: 'getWeather',
          data: { temp: '23 degrees' }
        })
        expect(wrapper.text()).toEqual('Temperature is 23 DEGREES')
        wrapper.unmount()
      })

      describe('on', () => {

        it('Conditional on() only executes the call if the condition is met (based on STATE)', async () => {
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
          await store.dispatch({
            type: 'SET_CITY',
            city: 'Buenos Aires'
          })

          expect(wrapper.text()).toEqual('Fetching')
          wrapper.unmount()
        })

        it('Conditional on() only executes the call if the condition is met (based on PROPS)', () => {
          const MyComponentWithCondition = fetchingData({
            weather: {
              call: (props) => auth(get(`getWeather?city=${props.city}`)),
              on: (ownProps) => ownProps.city
            }
          })(MyComponent)

          const ComponentWithStore = (props) => {
            return (
              <Provider store={store}>
                <MyComponentWithCondition {...props} />
              </Provider>
            )
          }

          const wrapper = mount(
            <ComponentWithStore />
          )

          // NOT FETCH YET !
          expect(wrapper.text()).toEqual('Initializing')

          // this shit doesnt work !! :S
          // I'm not sure, but I suspect that it is enzyme
          // not propagating the rerendering/update to all the inner elements
          wrapper.setProps({ city: 'Buenos Aires' })
          expect(wrapper.text()).toEqual('Fetching')
          wrapper.unmount()
        })

      })


    })

    describe('shortcut API usages', () => {

      it('support shortcut fetch definition just with the call factory function, using the prop as storage field name', () => {
        const SimpleComponent = props => {
          return props.weather && props.weather.value ? (<div>Temperature is {props.weather.value.temp}</div>) : (<div>Nothing</div>)
        }
        const Component = fetchingData({
          weather: () => get('getWeather')
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
        wrapper.unmount()
      })

      it('support not including "name"', () => {
        const SimpleComponent = props => {
          return props.weather && props.weather.value ? (<div>Temperature is {props.weather.value.temp}</div>) : (<div>Nothing</div>)
        }
        const Component = fetchingData({
          weather: { call: () => auth(get('getWeather')) }
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
        wrapper.unmount()
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
