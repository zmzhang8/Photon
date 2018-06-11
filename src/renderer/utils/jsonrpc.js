export class RPCHTTP {
  constructor (namespace) {
    this._namespace = namespace
  }

  request (address, method, params = [], id, successCallback, errorCallback) {
    let data = this._formatData(method, params, id)
    this._fetch(address, data, successCallback, errorCallback)
  }

  batchRequest (address, requests, successCallback, errorCallback) {
    if (requests.constructor !== Array) requests = [requests]
    let data = requests.map(request => this._formatData(request.method, request.params, request.id))
    this._fetch(address, data, successCallback, errorCallback)
  }

  _formatData (method, params = [], id = '0') {
    return {
      jsonrpc: '2.0',
      id: id,
      method: this._namespace + '.' + method,
      params: params.constructor === Array ? params : [params]
    }
  }

  _fetch (address, data, successCallback, errorCallback) {
    fetch(address, {
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
  constructor (namespace, address) {
    this._namespace = namespace
    this._listeners = {}
    this.setSocket(address)
  }

  setSocket (address) {
    this._socket = new WebSocket(address)
    let listeners = this._listeners
    this._socket.onmessage = message => {
      let data = JSON.parse(message.data)
      if (listeners.hasOwnProperty(data.method)) listeners[data.method](data)
      else if (listeners.default) listeners.default(data)
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
    let data = this._formatData(method, params, id)
    this._send(data)
  }

  batchRequest (requests) {
    if (requests.constructor !== Array) requests = [requests]
    let data = requests.map(request => this._formatData(request.method, request.params, request.id))
    this._send(data)
  }

  _formatData (method, params = [], id = '0') {
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
