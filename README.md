[![wercker status](https://app.wercker.com/status/058913f49bf3eff11fd7af9a5737dfbc/s/master "wercker status")](https://app.wercker.com/project/byKey/058913f49bf3eff11fd7af9a5737dfbc)
[![codecov](https://codecov.io/gh/javierfernandes/artemisajs/branch/master/graph/badge.svg)](https://codecov.io/gh/javierfernandes/artemisajs)

[![wercker status](https://david-dm.org/javierfernandes/artemisajs.svg)](https://david-dm.org/javierfernandes/)

# ArtemisaJS 

React/Redux data fetching library

# Description

Artemisa extends React+Redux with the ability to model interaction with the backend (aka fetches) in a declarative way, reducing boilerplate code and providing a framework with (potential) functionality on the local storage and sync of the data with the back (cache).

It is highliy influenced by [Apollo](http://dev.apollodata.com/react/), the graphql client (for react specifically). 

In the future it can have LRU cache, and also expiration handling, etc

# Usage 

```bash
yarn add artemisa
```
Or

```bash
npm install -S artemisa
```

Then you must include Artemisa **middleware** and **reducer** into Redux store

```javascript
import { service, reducer as artemisa } from 'artemisa'

const reducers = combineReducers([artemisa, ...yourReducers])
const store = createStore(
  reducers,
  applyMiddleware(service)
)
```

Then just use it (see next)

# How it works

React components declare data fetching needs by using Artemisa "decorator" function.

```javascript
import { fetchingData, isFetching, isError, isFetched } from 'artemisa'

@fetchingData({
   weather: (props) => get(`/api/weather/${props.city.code}`)
})
class WeatherChannel extends React.Component {

  render() {
    const { weather, city } = this.props             // HERE WE USE A PROP 
    if (isFetching(weather))
        return <div>Loading...</div>

    if (isError(weather))
        return <div><h1>Error while loading data</h1><p>{weather.error}</p></div>

    if (isFetched(weather))
        return (<div>The current temperature at ${city.name} is ${weather.value.temperature}</div>)

     return <div></div>
  }
}

```

That's it ! No actions needed, no reducer needed, no async code for http requests. That is all handled by Artemisa.

## Code Explanined

The `@fetchingData()` decorates your component with a higher-order component, in the same way as Redux's `connect` function.
The `weather` key in the options passed to `fetchingData` specifies the name of the property Artemisa will **inject** into your component. This must be in sync with your component's code/properties.

The `arrow function` associated to the key receives the components props (plus optionally the state) and returns an specification of an http call to be performed.

The component then receives a **slot** or **placeholder** with the specified property name (here `weather`).
Artemisa provides functions to check the state of the fetch: `isFetching`, `isError`, `isFetched`.

# Fetch execution and Cache 

Artemisa willl update your component when one of the properties you used for the call is updated. For example the `city` in the examples.

But a property change not always triggers a new fetch, and that's where Artemisa cache fits in.
Artemisa caches the data based on the URLs.

This means that **two fetches with the same URL will trigger just one actual server call**.
This is useful to optimize server calls when:

* two different components need the same data from the backend
* the user navigates to another component and then back, having the same "state", then it won't fetch the same data again, and it will have 0 loading time.

Artemisa implements the cache by using Redux store. So you can inspect the cache, by inspecting the state of the store, and redux actions.

# Options

Here is a more complete example of the options for `fetchingData`

```javascript
export default fetchingData({
  currentWeather: {
    name: 'weatherAtCity', 
    call: ({ cityName }, { cities.codes }) => get(`/api/weather/${cities[cityName].code}`),
  }
})(MyComponent)
```

The `options` provided to fetchingData has the following form

```json
{
    "propName1" : "< FetchDescriptor >",
    "propName2": "< FetchDescriptor >"
}
```

The keys are basically the **names of the props** you want Artemisa to inject the objects into your component. So later your component expects to receive `this.props.propName1` and  `this.props.propName2`

The FetchDescriptor type has the following form

```js
<FetchingDescriptor> :{
    "name": < String >,
    "call": < (ownProps, state) => Call >
}
```
Where:

- **name** (required): is an id that represents the fetch you are doing. Artemisa uses this to uniquely identify this kind of request. It is like "the key" to store the data in the cache. So later if you use the same key in another component they will **share the state** and the cache.
- **call** (required): a function for creating a Call action object.
- (optionally other properties to be explained later on this doc)

The call function is the most important and it is where you create the call to the backend. 
As the call could depend on other properties you receive the props and as you could also want something from the state, you also get the state as a second parameter

# Optional fetch properties

There are some extra props that you can specify for different scenarios

## Transforming

- **transforming**: an optional function to transform the data when it arrives, and before injecting it into the component. For example to transform some dates from string to objects, etc.


```javascript
const MyComponentWithFetches = fetchingData({
  weather: {
    name: 'weather',      // key to use on store for cache, now optional
    call: (props, state) => auth(get(`getWeather?city=${state.city}`)),
    transforming: (value) => toFahrenheit(value)
  }
})(MyComponent)
```

## on() (Conditional fetch)

A fetch might depend on certain condition, meaning that Artemisa shouldn't try to fetch everytime, but just if a condition is met.
This can be expressed with the "on" property function

```javascript
const MyComponentWithFetches = fetchingData({
  weather: {
    name: 'weather',      // key to use on store for cache, now optional
    on: (props, state) => state.city !== undefined,
    call: (props, state) => auth(get(`getWeather?city=${state.city}`))
  }
})(MyComponent)
```
So it will only call the fetch if there is a city in the state.

# Slot

The slot has the following properties

- **state** : `FETCHING`, `FETCHED`, `ERROR`
- **value**: if `FETCHED` the value from the server
- **error**: in case it is `ERROR`

# Further work

In the future the reducer could store more than one result, in kind of a LRU cache, to avoid refetching.
It could also store timestamps to consider an expiration date on the cache, to refetch.
