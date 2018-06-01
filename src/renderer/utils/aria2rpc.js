import JSONRPC from './jsonrpc'

const id = 'qwer'
const maxTaskNumber = 1000
const taskStatusKeys = ['gid', 'status', 'totalLength', 'completedLength', 'uploadLength', 'downloadSpeed', 'uploadSpeed', 'connections', 'dir', 'files', 'bittorrent', 'errorCallbackCode', 'errorCallbackMessage']

export default class Aria2RPC {
  constructor (address = '127.0.0.1', port = 6800, token = '', httpsEnabled = false) {
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

  remove (gids, successCallback, errorCallback) {
    const method = 'remove'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  pause (gids, successCallback, errorCallback) {
    const method = 'pause'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  pauseAll (successCallback, errorCallback) {
    const method = 'pauseAll'
    this._request(method, [], successCallback, errorCallback)
  }

  unpause (gids, successCallback, errorCallback) {
    const method = 'unpause'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  unpauseAll (successCallback, errorCallback) {
    const method = 'unpauseAll'
    this._request(method, [], successCallback, errorCallback)
  }

  tellStatus (gids, successCallback, errorCallback) {
    const method = 'tellStatus'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid, taskStatusKeys])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  getUris (gids, successCallback, errorCallback) {
    const method = 'getUris'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid])
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

  getGlobalOption (successCallback, errorCallback) {
    const method = 'getGlobalOption'
    this._request(method, [], successCallback, errorCallback)
  }

  changeGlobalOption (options = {}, successCallback, errorCallback) {
    const method = 'changeGlobalOption'
    let param = {}
    for (let key in options) {
      param[key] = typeof options[key] === 'string' ? options[key] : options[key].toString()
    }
    this._request(method, [param], successCallback, errorCallback)
  }

  getGlobalStat (successCallback, errorCallback) {
    const method = 'getGlobalStat'
    this._request(method, [], successCallback, errorCallback)
  }

  purgeDownloadResult (successCallback, errorCallback) {
    const method = 'purgeDownloadResult'
    this._request(method, [], successCallback, errorCallback)
  }

  removeDownloadResult (gids, successCallback, errorCallback) {
    const method = 'removeDownloadResult'
    if (gids.constructor !== Array) gids = [gids]
    let paramsPool = gids.map(gid => [gid])
    this._batchRequest(method, paramsPool, successCallback, errorCallback)
  }

  getVersion (successCallback, errorCallback) {
    const method = 'getVersion'
    this._request(method, [], successCallback, errorCallback)
  }

  shutdown (successCallback, errorCallback) {
    const method = 'shutdown'
    this._request(method, [], successCallback, errorCallback)
  }

  saveSession (successCallback, errorCallback) {
    const method = 'saveSession'
    this._request(method, [], successCallback, errorCallback)
  }

  _request (method, params, successCallback, errorCallback) {
    this._jsonrpc.request(this._url, method, [this._token].concat(params), id, result => {
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
        id: id
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
