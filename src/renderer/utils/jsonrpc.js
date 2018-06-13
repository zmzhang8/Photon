export class RPCHTTP {
  constructor (address, encryption = false, namespace) {
    this.namespace = namespace
    this.setAddress(address, encryption)
  }

  setAddress (address, encryption = false) {
    this._url = (encryption ? 'https://' : 'http://') + address
  }

  request (method, params = [], id, successCallback, errorCallback) {
    let data = this._formatData(method, params, id)
    this._fetch(this._url, data, successCallback, errorCallback)
  }

  batchRequest (requests, successCallback, errorCallback) {
    if (requests.constructor !== Array) requests = [requests]
    let data = requests.map(request => this._formatData(request.method, request.params, request.id))
    this._fetch(this._url, data, successCallback, errorCallback)
  }

  _formatData (method, params = [], id = '') {
    return {
      jsonrpc: '2.0',
      id: id,
      method: this.namespace + '.' + method,
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
  constructor (address, encryption = false, namespace) {
    this.namespace = namespace
    this._listeners = {}
    this.setAddress(address, encryption)
  }

  setAddress (address, encryption) {
    this._handles = {}
    if (typeof WebSocket !== 'function') throw Error('This client does not support WebSocket.')
    else {
      let url = (encryption ? 'wss://' : 'ws://') + address
      try {
        this._socket = new WebSocket(url)
        let that = this
        this._socket.onclose = event => {
          setTimeout(() => {
            if (that._socket.readyState > 1) that.setAddress(address, encryption)
          }, 10000)
        }
        this._socket.onerror = error => that._onerror(error, that._handles)
        this._socket.onmessage = message => that._onmessage(message, that._handles, that._listeners)
      } catch (error) {
        console.error(error.message)
      }
    }
  }

  addListener (method, callback) {
    if (typeof callback === 'function') this._listeners[this.namespace + '.' + method] = callback
  }

  removeListener (method) {
    delete this._listeners[this.namespace + '.' + method]
  }

  request (method, params = [], id, successCallback, errorCallback) {
    this._handles[id] = {
      success: successCallback,
      error: errorCallback
    }
    let data = this._formatData(method, params, id)
    this._send(data)
  }

  batchRequest (requests, successCallback, errorCallback) {
    if (requests.constructor !== Array) requests = [requests]
    requests.forEach(request => {
      this._handles[request.id] = {
        success: successCallback,
        error: errorCallback
      }
    })
    let data = requests.map(request => this._formatData(request.method, request.params, request.id))
    this._send(data)
  }

  _formatData (method, params = [], id = '') {
    return {
      jsonrpc: '2.0',
      id: id,
      method: this.namespace + '.' + method,
      params: params.constructor === Array ? params : [params]
    }
  }

  _send (data) {
    let that = this
    let socket = this._socket
    if (socket.readyState > 1) socket.onerror(Error('WebSocket is in state ' + socket.readyState + '.'))
    else if (socket.readyState === 0) setTimeout(() => that._send(data), 1000)
    else socket.send(JSON.stringify(data))
  }

  _onerror (error, handles) {
    if (error.hasOwnProperty('message')) console.error(error.message)
    Object.keys(handles).forEach(id => {
      if (typeof handles[id].error === 'function') handles[id].error(error)
      delete handles[id]
    })
  }

  _onmessage (message, handles, listeners) {
    let data = JSON.parse(message.data)
    if (data.constructor === Array) {
      data = data.reduce((last, cur) => {
        if (last.hasOwnProperty(cur.id)) last[cur.id].push(cur)
        else last[cur.id] = [cur]
        return last
      }, {})
      for (let id in data) {
        if (handles.hasOwnProperty(id)) {
          if (typeof handles[id].success === 'function') handles[id].success(data[id])
          delete handles[id]
        }
      }
    } else if (data.hasOwnProperty('id')) {
      if (handles.hasOwnProperty(data.id)) {
        if (typeof handles[data.id].success === 'function') handles[data.id].success(data)
        delete handles[data.id]
      }
    } else if (data.hasOwnProperty('method')) {
      if (listeners.hasOwnProperty(data.method)) {
        if (typeof listeners[data.method] === 'function') listeners[data.method](data)
      }
    }
  }
}
