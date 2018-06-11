import { RPCHTTP, RPCWebSocket } from './jsonrpc'

const id = 'qwer'
const maxTaskNumber = 1000
const taskStatusKeys = ['gid', 'status', 'totalLength', 'completedLength', 'uploadLength', 'downloadSpeed', 'uploadSpeed', 'connections', 'dir', 'files', 'bittorrent', 'errorCallbackCode', 'errorCallbackMessage']

export default class Aria2RPC {
  constructor (host = '127.0.0.1', port = 6800, token = '', encryption = false) {
    this.setRPC(host, port, token, encryption)
  }

  setRPC (host = '127.0.0.1', port = 6800, token = '', encryption = false) {
    let suffix = host + ':' + port + '/jsonrpc'
    this._token = 'token:' + token
    this._address = (encryption ? 'https' : 'http') + '://' + suffix
    if (!this._rpcHTTP) this._rpcHTTP = new RPCHTTP('aria2')
    if (!this._rpcSocket) this._rpcSocket = new RPCWebSocket('aria2', (encryption ? 'wss' : 'ws') + '://' + suffix)
    else this._rpcSocket.setSocket((encryption ? 'wss' : 'ws') + '://' + suffix)
  }

  addUri (uris, options = {}, successCallback, errorCallback) {
    const method = 'addUri'
    if (uris.constructor !== Array) uris = [uris]
    let paramsPool = uris.map(uriGroup => [uriGroup.constructor === Array ? uriGroup : [uriGroup], options])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  addTorrent (torrent, options = {}, successCallback, errorCallback) {
    const method = 'addTorrent'
    let params = [torrent, [], options]
    this._request(method, params, successCallback, errorCallback)
  }

  addMetalink (metalink, options = {}, successCallback, errorCallback) {
    const method = 'addMetalink'
    let params = [metalink, [], options]
    this._request(method, params, successCallback, errorCallback)
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
    let param = {}
    for (let key in options) {
      param[key] = typeof options[key] === 'string' ? options[key] : options[key].toString()
    }
    this._request(method, [param], successCallback, errorCallback)
  }
  _setListener (method, callback) {
    this._rpcSocket.setListener(method, result => {
      this._resultHandler(method, result, callback)
    })
  }

  _request (method, params, successCallback, errorCallback) {
    this._rpcHTTP.request(this._address, method, [this._token].concat(params), id, result => {
      this._resultHandler(method, result, successCallback, errorCallback)
    }, error => {
      if (typeof errorCallback === 'function') errorCallback(error)
    })
  }

  _batchRequest (method, paramsPool, successCallback, errorCallback) {
    let requests = paramsPool.map(params => {
      return {
        method: method,
        params: [this._token].concat(params),
        id: id
      }
    })
    this._rpcHTTP.batchRequest(this._address, requests, results => {
      results.forEach(result => this._resultHandler(method, result, successCallback, errorCallback))
    }, error => {
      if (typeof errorCallback === 'function') errorCallback(error)
    })
  }

  _resultHandler (method, result, successCallback, errorCallback) {
    if (result.hasOwnProperty('error')) {
      let error = result.error
      console.warn('[aria2.' + method + ' error]: ' + error.code + ' ' + error.message)
      if (typeof errorCallback === 'function') errorCallback(Error(error.code + ' ' + error.message))
    } else {
      console.log('[aria2.' + method + ' success]' + (typeof result.result === 'string' ? ': ' + result.result : ''))
      if (typeof successCallback === 'function') successCallback(result.result || result.params)
    }
  }
}

['onDownloadStart', 'onDownloadPause', 'onDownloadStop', 'onDownloadComplete', 'onDownloadError', 'onBtDownloadComplete'].forEach(method => {
  Object.defineProperty(Aria2RPC.prototype, method, {
    get: function () { },
    set: function (callback) {
      this._setListener(method, callback)
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
