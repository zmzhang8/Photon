export class RPCHTTP {
  constructor (namespace) {
    this._namespace = namespace
  }

  request (url, method, params = [], id, successCallback, errorCallback) {
    let data = this._getRequestData(method, params, id)
    this._fetch(url, data, successCallback, errorCallback)
  }

  batchRequest (url, requests, successCallback, errorCallback) {
    if (requests.constructor !== Array) requests = [requests]
    let data = requests.map(request => this._getRequestData(request.method, request.params, request.id))
    this._fetch(url, data, successCallback, errorCallback)
  }

  _getRequestData (method, params = [], id = '0') {
    return {
      jsonrpc: '2.0',
      id: id,
      method: this._namespace + '.' + method,
      params: params.constructor === Array ? params : [params]
    }
  }

  _fetch (url, data, successCallback, errorCallback) {
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => {
      if (!response.ok) throw Error(response.status + ' ' + response.statusText)
      return response.json()
    }).then(result => {
      if (typeof (successCallback) === 'function') successCallback(result)
    }).catch(error => {
      console.error('[fetch error]: ' + error.message)
      if (typeof (errorCallback) === 'function') errorCallback(error)
    })
  }
}

export class RPCWebSocket {
  constructor (namespace, url) {
    this._namespace = namespace
    this.setSocket(url)
    this._listeners = {}
  }

  setSocket (url) {
    this._socket = new WebSocket(url)
    let that = this
    this._socket.onmessage = message => {
      let data = JSON.parse(message.data)
      if (that._listeners.hasOwnProperty(data.method)) that._listeners[data.method](data)
      else if (that._listeners.default) that._listeners.default(data)
    }
    this._socket.onerror = error => console.error(error)
  }

  setListener (method, callback) {
    if (typeof callback === 'function') this._listeners[this._namespace + '.' + method] = callback
  }

  clearListener (method) {
    delete this._listeners[this._namespace + '.' + method]
  }

  request (method, params = [], id) {
    let data = this._getRequestData(method, params, id)
    this._send(data)
  }

  batchRequest (requests) {
    if (requests.constructor !== Array) requests = [requests]
    let data = requests.map(request => this._getRequestData(request.method, request.params, request.id))
    this._send(data)
  }

  _getRequestData (method, params = [], id = '0') {
    return {
      jsonrpc: '2.0',
      id: id,
      method: this._namespace + '.' + method,
      params: params.constructor === Array ? params : [params]
    }
  }

  _send (data) {
    if (this._socket.readyState === 1) this._socket.send(JSON.stringify(data))
  }
}
