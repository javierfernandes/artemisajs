import isoFetch from 'isomorphic-fetch';
import merge from 'deepmerge';

// HARDCODED: this should be configurable !
export const LOGOUT = 'LOGOUT';

function isBrowser() {
  return typeof __IS_BROWSER__ !== typeof undefined;
}

function getBrowserUrl(url) {
  return `${location.protocol}//${location.host}/${url}`;
}

export function apiFetch(url, options) {
  const finalUrl = isBrowser() ? getBrowserUrl(url) : `http://artemisajs.org/${url}`;
  return isoFetch(finalUrl, options);
}

export function compileUrl(path, params = {}) {
  return (typeof(path) === 'string') ? path : path(params);
}

export function fetchOptions(method = 'GET', params = {}, authToken) {
  let headers = {};
  let body = undefined;
  if (authToken) {
    headers = {
      ...headers,
      Authorization: `Bearer ${authToken}`
    };
  }
  if (method === 'POST' || method === 'PUT') {
    if (params.file) {
      body = new FormData();
      Object.keys(params).forEach((key) => {
        if (key !== 'file') {
          body.append(key, params[key]);
        } else {
          body.append(params[key].name, params[key].file);
        }
      });
    } else {
      headers = {
        ...headers,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
      body = JSON.stringify(params);
    }
  }
  return { method, headers, body };
}

function attachPayload(action, payloads) {
  if (payloads && payloads[action.type]) {
    action.payload = payloads[action.type]
  }
  return action
}

function doFetch(method, path, urlParams, body, token, actions, callbacks, actionPayloads) {
  return dispatch => {
    const request = () => {
      const requestAction = attachPayload({ type: actions.request }, actionPayloads)
      if (urlParams) {
        requestAction.urlParams = urlParams;
      }
      return requestAction;
    };

    const receive = (data) => attachPayload({ type: actions.receive, data }, actionPayloads);
    const unauthorized = () => attachPayload({ type: actions.unauthorized }, actionPayloads);
    const onerror = (error) => attachPayload({ type: actions.error, error }, actionPayloads);

    dispatch(request());
    return apiFetch(compileUrl(path, urlParams), fetchOptions(method, body, token))
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            dispatch(unauthorized());
          }
          return response.json().then(json => {
            throw new Error(json.error || json.message);
          });
        }
        const json = response.json()
        return json;
      })
      .then(json => {
        dispatch(receive(callbacks.decorateResponse(json, urlParams)))
        return json
      })
      .catch(error => dispatch(onerror(error.message)))
  };
}

export const FETCH_REQUEST = 'FETCH_REQUEST';
export const FETCH_RECEIVE = 'FETCH_RECEIVE';
export const FETCH_ERROR = 'FETCH_ERROR';

const defaultConfig = {
  actions: {
    request: FETCH_REQUEST,
    receive: FETCH_RECEIVE,
    error: FETCH_ERROR,
    unauthorized: LOGOUT
  },
  callbacks: {
    shouldFetch: () => true,
    decorateResponse: (response) => response
  },
  requireAuthentication: true
};

const getAuthToken = (state, config) => (
  config.requireAuthentication && state.login ? state.login.token : undefined
);

export function asyncMethod(method, config) {
  return (args = {}) => (dispatch, getState) => {
    const finalConfig = merge(defaultConfig, config);
    return dispatch(
      doFetch(
        method,
        finalConfig.path,
        args.urlParams,
        args.body,
        getAuthToken(getState(), finalConfig),
        finalConfig.actions,
        finalConfig.callbacks,
        args.actionPayload
      )
    );
  };
}

export function asyncFetch(config) {
  const self = {
    fetch: (args = {}, force = false) => (dispatch, getState) => {
      const finalConfig = merge(defaultConfig, config);
      if (force || finalConfig.callbacks.shouldFetch(getState(), args.urlParams)) {
        return dispatch(
          doFetch(
            'GET',
            finalConfig.path,
            args.urlParams,
            undefined,
            getAuthToken(getState(), finalConfig),
            finalConfig.actions,
            finalConfig.callbacks,
            args.actionPayload
          )
        )
      }
      return Promise.resolve();
    },
    withCreate: (createConfig) => {
      self.create = asyncMethod('POST', merge(config, createConfig));
      return self;
    },
    withUpdate: (updateConfig) => {
      self.update = asyncMethod('PUT', merge(config, updateConfig));
      return self;
    },
    withDelete: (deleteConfig) => {
      self.delete = asyncMethod('DELETE', merge(config, deleteConfig));
      return self;
    }
  };

  return self;
}
