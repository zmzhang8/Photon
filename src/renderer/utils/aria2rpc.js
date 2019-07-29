import { RPCHTTP, RPCWebSocket } from './jsonrpc'

const maxTaskNumber = 1000
const taskStatusKeys = ['gid', 'status', 'totalLength', 'completedLength', 'uploadLength', 'downloadSpeed', 'uploadSpeed', 'connections', 'dir', 'files', 'bittorrent', 'errorCallbackCode', 'errorCallbackMessage']

export default class Aria2RPC {
  constructor (host = '127.0.0.1', port = 6800, token = '', encryption = false) {
    this._date = new Date()
    this.setRPC(host, port, token, encryption)
  }

  setRPC (host = '127.0.0.1', port = 6800, token = '', encryption = false) {
    this._token = 'token:' + token
    this._address = host + ':' + port + '/jsonrpc'
    if (this._rpc) this._rpc.setAddress(this._address, encryption)
    else {
      try {
        this._rpc = new RPCWebSocket(this._address, encryption, 'aria2')
      } catch (error) {
        console.error(error.message)
        console.warn('Fall back to HTTP request.')
        this._rpc = new RPCHTTP(this._address, encryption, 'aria2')
      }
    }
  }

  addUri (uris, options = {}, successCallback, errorCallback) {
    const method = 'addUri'
    if (uris.constructor !== Array) uris = [uris]
    let paramsPool = uris.map(uriGroup => [uriGroup.constructor === Array ? uriGroup : [uriGroup], options])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  addTorrent (torrent, options = {}, successCallback, errorCallback) {
    const method = 'addTorrent'
    this._request(method, [torrent, [], options], successCallback, errorCallback)
  }

  addMetalink (metalink, options = {}, successCallback, errorCallback) {
    const method = 'addMetalink'
    this._request(method, [metalink, options], successCallback, errorCallback)
  }

  tellStatus (gids, successCallback, errorCallback) {
    const method = 'tellStatus'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid, taskStatusKeys])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  tellActive (successCallback, errorCallback) {
    const method = 'tellActive'
    this._request(method, [taskStatusKeys], successCallback, errorCallback)
  }

  tellWaiting (successCallback, errorCallback) {
    const method = 'tellWaiting'
    this._request(method, [0, maxTaskNumber, taskStatusKeys], successCallback, errorCallback)
  }

  tellStopped (successCallback, errorCallback) {
    const method = 'tellStopped'
    this._request(method, [0, maxTaskNumber, taskStatusKeys], successCallback, errorCallback)
  }

  changeGlobalOption (options = {}, successCallback, errorCallback) {
    const method = 'changeGlobalOption'
    this._request(method, [options], successCallback, errorCallback)
  }

  _addListener (method, callback) {
    let responseHandler = this._responseHandler
    if (this._rpc.constructor === RPCWebSocket) {
      this._rpc.addListener(method, response => {
        responseHandler(method, response, callback)
      })
    }
  }

  _request (method, params, successCallback, errorCallback) {
    let responseHandler = this._responseHandler
    let id = method + '.' + this._date.getTime()
    this._rpc.request(method, [this._token].concat(params), id, response => {
      responseHandler(method, response, successCallback, errorCallback)
    }, errorCallback)
  }

  _batchRequest (method, paramsPool, successCallback, errorCallback) {
    let id = method + '.' + this._date.getTime()
    let requests = paramsPool.map(params => {
      return {
        method: method,
        params: [this._token].concat(params),
        id: id
      }
    })
    let responseHandler = this._responseHandler
    this._rpc.batchRequest(requests, response => {
      responseHandler(method, response, successCallback, errorCallback)
    }, errorCallback)
  }

  _responseHandler (method, response, successCallback, errorCallback) {
    if (response.constructor === Array) {
      let errorResults = response.filter(result => result.hasOwnProperty('error'))
      errorResults.forEach(result => {
        console.warn('[aria2.' + method + ' error]: ' + response.error.code + ' ' + response.error.message)
      })
      if (errorResults.length !== 0 && typeof errorCallback === 'function') errorCallback(errorResults)
      let successResults = response.filter(result => !result.hasOwnProperty('error'))
        .map(result => result.result || result.params)
      if (successResults.length !== 0 && typeof successCallback === 'function') successCallback(successResults)
    } else {
      if (response.hasOwnProperty('error')) {
        console.warn('[aria2.' + method + ' error]: ' + response.error.code + ' ' + response.error.message)
        if (typeof errorCallback === 'function') errorCallback(response)
      } else {
        if (typeof successCallback === 'function') successCallback(response.result || response.params)
      }
    }
  }
}

['onDownloadStart', 'onDownloadPause', 'onDownloadStop', 'onDownloadComplete', 'onDownloadError', 'onBtDownloadComplete'].forEach(method => {
  Object.defineProperty(Aria2RPC.prototype, method, {
    get: function () {
      return undefined
    },
    set: function (callback) {
      this._addListener(method, callback)
    }
  })
});

['remove', 'pause', 'unpause', 'getUris', 'removeDownloadResult'].forEach(method => {
  Object.defineProperty(Aria2RPC.prototype, method, {
    value: function (gids, successCallback, errorCallback) {
      if (gids.constructor !== Array) gids = [gids]
      let paramsPool = gids.map(gid => [gid])
      this._batchRequest(method, paramsPool, successCallback, errorCallback)
    }
  })
});

['pauseAll', 'unpauseAll', 'getGlobalOption', 'getGlobalStat', 'purgeDownloadResult', 'getVersion', 'shutdown', 'saveSession'].forEach(method => {
  Object.defineProperty(Aria2RPC.prototype, method, {
    value: function (successCallback, errorCallback) {
      this._request(method, [], successCallback, errorCallback)
    }
  })
})
