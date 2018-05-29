import Aria2RPC from './aria2rpc'
import Converter from './converter'

export default class Aria2Server {
  constructor (name = 'Default', rpc = this._defaultRPC(), options = this._defaultOptions()) {
    this.name = name
    this.rpc = JSON.parse(JSON.stringify(rpc))
    this.options = JSON.parse(JSON.stringify(options))
    this.handler = new Aria2RPC(rpc.address, rpc.port, rpc.token, rpc.httpsEnabled)
    this.connection = false
    this.tasks = {
      active: [],
      waiting: [],
      paused: [],
      stopped: []
    }
  }

  startTasks (gids = []) {
    this.handler.unpause(gids, result => {
      this.syncTasks()
    })
  }

  startTasksAll () {
    this.handler.unpauseAll(result => {
      this.syncTasks()
    })
  }

  pauseTasks (gids = []) {
    this.handler.pause(gids, result => {
      this.syncTasks()
    })
  }

  pauseTasksAll () {
    this.handler.pauseAll(result => {
      this.syncTasks()
    })
  }

  removeTasks (gids = []) {
    this.handler.remove(gids, result => {
      this.syncTasks()
    })
  }

  purgeTasks (gids = []) {
    this.handler.removeDownloadResult(gids, result => {
      this.syncTasks()
    })
  }

  purgeTasksAll () {
    this.handler.purgeDownloadResult(result => {
      this.syncTasks()
    })
  }

  syncTasks () {
    let handler = this.handler
    let tasks = this.tasks
    handler.tellActive(results => {
      tasks.active = results.map(result => this._formatTask(result))
    })
    handler.tellWaiting(results => {
      tasks.waiting = results.filter(result => result.status === 'waiting')
        .map(result => this._formatTask(result))
      tasks.paused = results.filter(result => result.status === 'paused')
        .map(result => this._formatTask(result))
    })
    handler.tellStopped(results => {
      tasks.stopped = results.map(result => this._formatTask(result))
    })
  }

  syncOptions () {
    let options = this.options
    this.handler.getGlobalOption(result => {
      options['dir'] = result['dir']
      options['max-concurrent-downloads'] = parseInt(result['max-concurrent-downloads'])
      options['max-overall-download-limit'] = parseInt(result['max-overall-download-limit'])
      options['max-overall-upload-limit'] = parseInt(result['max-overall-upload-limit'])
    })
  }

  checkConnection () {
    this.handler.getVersion(result => {
      this.connection = true
    }, e => {
      this.connection = false
    })
  }

  isActive () {
    return this.tasks.active.length !== 0
  }

  setServer (name = 'Default', rpc = this._defaultRPC(), options = this._defaultOptions(), ignoreDir = true) {
    this.name = name.slice()
    this.rpc = JSON.parse(JSON.stringify(rpc))
    let dir = this.options['dir']
    this.options = JSON.parse(JSON.stringify(options))
    if (ignoreDir) this.options['dir'] = dir
    this.handler.setRPC(rpc.address, rpc.port, rpc.token, rpc.httpsEnabled)
    this.handler.changeGlobalOption(options)
  }

  _formatTask (task) {
    let bytesToString = Converter.bytesToString
    let secondsToString = Converter.secondsToString
    return {
      gid: task['gid'],
      status: task['status'],
      name: task.hasOwnProperty('bittorrent') ? task['bittorrent']['info']['name'] : task['files'][0]['path'].replace(/^.*[\\/]/, ''),
      totalSize: bytesToString(task['totalLength'], 2),
      completedSize: bytesToString(task['completedLength'], 2),
      completedPercentage: Math.round(task['completedLength'] / task['totalLength'] * 100) || 0,
      remainingTime: secondsToString((task['totalLength'] - task['completedLength']) / task['downloadSpeed']),
      uploadedSize: bytesToString(task['uploadLength'], 2),
      downloadSpeed: bytesToString(task['downloadSpeed'], 1),
      uploadSpeed: bytesToString(task['uploadSpeed'], 1),
      connections: parseInt(task['connections']),
      dir: task['dir']
    }
  }

  _defaultRPC () {
    return {
      address: '127.0.0.1',
      port: '6800',
      token: '',
      httpsEnabled: false
    }
  }

  _defaultOptions () {
    return {
      'max-concurrent-downloads': 5,
      'max-overall-download-limit': 0,
      'max-overall-upload-limit': 262144
    }
  }
}
