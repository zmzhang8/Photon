import Aria2Server from './aria2server'

export default class Aria2Manager {
  constructor () {
    this.servers = this._initServers()
    this.serverIndex = 0
    this.sync = undefined
  }

  addServer () {
    this.servers.push(new Aria2Server())
  }

  removeServer () {
    if (this.servers.length !== 0) this.servers.splice(this.serverIndex, 1)
    if (this.serverIndex >= this.servers.length) this.serverIndex = this.servers.length - 1
  }

  setSyncInterval (interval = 3000) {
    this.sync = setInterval(() => this.syncTasks(), interval)
  }

  clearSyncInterval () {
    clearInterval(this.sync)
  }

  syncTasks () {
    let server = this.servers[this.serverIndex]
    server.checkConnection()
    server.syncDownloading()
    server.syncFinished()
  }

  writeStorage () {
    let data = {
      servers: this.servers.map(server => {
        return {
          name: server.name,
          rpc: server.rpc,
          options: server.options
        }
      })
    }
    window.localStorage.setItem(this.constructor.name, JSON.stringify(data))
  }

  _readStorage () {
    return JSON.parse(window.localStorage.getItem(this.constructor.name)) || {}
  }

  _initServers () {
    let servers = this._readStorage().servers || [{}]
    return servers.map(server => new Aria2Server(server.name, server.rpc, server.options))
  }
}

['onDownloadStart', 'onDownloadPause', 'onDownloadStop', 'onDownloadComplete', 'onDownloadError', 'onBtDownloadComplete'].forEach(method => {
  Object.defineProperty(Aria2Manager.prototype, method, {
    get: function () {},
    set: function (callback) {
      this.servers.forEach((server, serverIndex) => {
        server[method] = tasks => {
          if (typeof callback === 'function') callback(tasks, server.name, serverIndex)
        }
      })
    }
  })
})
