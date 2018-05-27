import Aria2Server from './aria2server'

export default class Aria2Manager {
  constructor () {
    this.servers = this._initServers()
    this.syncTasksAll()
  }

  addServer () {
    this.servers.push(new Aria2Server())
  }

  removeServer (serverId) {
    if (serverId >= 1 && serverId < this.servers.length) {
      this.servers.splice(serverId, 1)
    }
  }

  syncTasksAll () {
    this.servers.forEach(server => {
      server.checkConnection()
      server.syncTasks()
    })
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

  _initServers () {
    let servers = this._readStorage().servers || [{}]
    return servers.map(server => new Aria2Server(server.name, server.rpc, server.options))
  }

  _readStorage () {
    return JSON.parse(window.localStorage.getItem(this.constructor.name)) || {}
  }
}
