export default class JSONRPC {
  constructor (namespace) {
    this._version = '2.0'
    this._id = '0'

    this._namespace = namespace
    this._date = new Date()
  }

  request (url, method, params = [], id = this._id, successCallback, errorCallback) {
    let data = this._getRequestData(method, params, id)
    this._fetch(url, data, successCallback, errorCallback)
  }

  batchRequest (url, requests, successCallback, errorCallback) {
    if (requests.constructor !== Array) requests = [requests]
    let data = requests.map(request => {
      return this._getRequestData(request.method, request.params, request.id)
    })
    this._fetch(url, data, successCallback, errorCallback)
  }

  _getRequestData (method, params = [], id = this._id) {
    return {
      jsonrpc: this._version,
      id: id,
      method: this._namespace + '.' + method,
      params: params.constructor === Array ? params : [params]
    }
  }

  _fetch (url, data, successCallback, errorCallback) {
    fetch(url + (url.indexOf('?') === -1 ? '?tm=' : '&tm=') + this._date.getTime(), {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => {
      if (!response.ok) {
        throw Error(response.status + ' ' + response.statusText)
      }
      return response.json()
    }).then(result => {
      if (typeof (successCallback) === 'function') successCallback(result)
    }).catch(error => {
      this._errorHandler(error)
      if (typeof (errorCallback) === 'function') errorCallback(error)
    })
  }

  _errorHandler (error) {
    console.error('[fetch error]: ' + error.message)
  }
}
