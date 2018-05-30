import JSONRPC from './jsonrpc'

export default class Aria2RPC {
  constructor (address = '127.0.0.1', port = 6800, token = '', httpsEnabled = false) {
    this._id = 'qwer'
    this._maxTaskNumber = 1000
    this._taskStatusKeys = ['gid', 'status', 'totalLength', 'completedLength', 'uploadLength', 'downloadSpeed', 'uploadSpeed', 'connections', 'dir', 'files', 'bittorrent', 'errorCallbackCode', 'errorCallbackMessage']

    this._url = (httpsEnabled ? 'https' : 'http') + '://' + address + ':' + port + '/jsonrpc'
    this._token = 'token:' + token
    this._jsonrpc = new JSONRPC('aria2')
  }

  setRPC (address = '127.0.0.1', port = 6800, token = '', httpsEnabled = false) {
    this._url = (httpsEnabled ? 'https' : 'http') + '://' + address + ':' + port + '/jsonrpc'
    this._token = 'token:' + token
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
    let paramsPool = gids.map(gid => [gid, this._taskStatusKeys])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  tellActive (successCallback, errorCallback) {
    const method = 'tellActive'
    this._request(method, [this._taskStatusKeys], successCallback, errorCallback)
  }

  tellWaiting (successCallback, errorCallback) {
    const method = 'tellWaiting'
    this._request(method, [0, this._maxTaskNumber, this._taskStatusKeys], successCallback, errorCallback)
  }

  tellStopped (successCallback, errorCallback) {
    const method = 'tellStopped'
    this._request(method, [0, this._maxTaskNumber, this._taskStatusKeys], successCallback, errorCallback)
  }

  changeGlobalOption (options = {}, successCallback, errorCallback) {
    const method = 'changeGlobalOption'
    let param = {}
    for (let key in options) {
      param[key] = typeof options[key] === 'string' ? options[key] : options[key].toString()
    }
    this._request(method, [param], successCallback, errorCallback)
  }

  removeDownloadResult (gids, successCallback, errorCallback) {
    const method = 'removeDownloadResult'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  _request (method, params, successCallback, errorCallback) {
    this._jsonrpc.request(this._url, method, [this._token].concat(params), this._id, result => {
      this._resultHandler(method, result)
      if (typeof (successCallback) === 'function') successCallback(result.result)
    }, error => {
      if (typeof (errorCallback) === 'function') errorCallback(error)
    })
  }

  _batchRequest (method, paramsPool, successCallback, errorCallback) {
    let requests = paramsPool.map(params => {
      return {
        method: method,
        params: [this._token].concat(params),
        id: this._id
      }
    })
    this._jsonrpc.batchRequest(this._url, requests, results => {
      results.forEach(result => {
        this._resultHandler(method, result)
      })
      if (typeof (successCallback) === 'function') successCallback(results)
    }, error => {
      if (typeof (errorCallback) === 'function') errorCallback(error)
    })
  }

  _resultHandler (method, result) {
    if (result.hasOwnProperty('error')) {
      console.warn('[aria2.' + method + ' error]: ' + result.error.code + ' ' + result.error.message)
    } else {
      let message = '[aria2.' + method + ' success]' + (typeof result.result === 'string' ? ': ' + result.result : '')
      console.log(message)
    }
  }
}

// 生成方法
[
  'saveSession',
  'shutdown',
  'getVersion',
  'purgeDownloadResult',
  'getGlobalStat',
  'getGlobalOption',
  'unpauseAll',
  'pauseAll'
].forEach(method => {
  Reflect.defineProperty(Aria2RPC.prototype, method, {
    value: function (successCallback, errorCallback) {
      this._request(method, [], successCallback, errorCallback)
    }
  })
});

// 生成方法
[
  'remove',
  'pause',
  'unpause',
  'getUris'
].forEach(method => {
  Reflect.defineProperty(Aria2RPC.prototype, method, {
    value: function (gids, successCallback, errorCallback) {
      if (gids.constructor !== Array) gids = [gids]
      let paramsPool = gids.map(gid => [gid])
      this._batchRequest(method, paramsPool, successCallback, errorCallback)
    }
  })
})
