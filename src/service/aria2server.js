import OS from 'os'
import Aria2RPC from './aria2rpc'

export default class Aria2Server {
  constructor (name = 'Default', rpc = this._defaultRPC(), options = this._defaultOptions()) {
    this.name = name.slice()
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
      options['max-concurrent-downloads'] = result['max-concurrent-downloads']
      options['max-overall-download-limit'] = result['max-overall-download-limit']
      options['max-overall-upload-limit'] = result['max-overall-upload-limit']
    })
  }

  checkConnection () {
    this.handler.getVersion(result => {
      this.connection = true
    }, e => {
      this.connection = false
    })
  }

  setServer (name = 'Default', rpc = this._defaultRPC(), options = this._defaultOptions()) {
    this.name = name.slice()
    this.rpc = JSON.parse(JSON.stringify(rpc))
    this.options = JSON.parse(JSON.stringify(options))
    this.handler.setRPC(rpc.address, rpc.port, rpc.token, rpc.httpsEnabled)
    this.handler.changeGlobalOption(options)
  }

  _formatTask (task) {
    let stringifySizeInBytes = this._stringifySizeInBytes
    let stringfyTimeIntervalInSeconds = this._stringfyTimeIntervalInSeconds
    return {
      gid: task['gid'],
      status: task['status'],
      name: task.hasOwnProperty('bittorrent') ? task['bittorrent']['info']['name'] : task['files'][0]['path'].replace(/^.*[\\/]/, ''),
      totalSize: stringifySizeInBytes(task['totalLength']),
      completedSize: stringifySizeInBytes(task['completedLength']),
      completedPercentage: Math.round(task['completedLength'] / task['totalLength'] * 10000) / 100,
      remainingTime: stringfyTimeIntervalInSeconds((task['totalLength'] - task['completedLength']) / task['downloadSpeed']),
      uploadLength: stringifySizeInBytes(task['uploadLength']),
      downloadSpeed: stringifySizeInBytes(task['downloadSpeed']),
      uploadSpeed: stringifySizeInBytes(task['uploadSpeed']),
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
      'dir': OS.homedir() + '/Downloads',
      'max-concurrent-downloads': 5,
      'max-overall-download-limit': 0,
      'max-overall-upload-limit': 262144
    }
  }

  _stringfyTimeIntervalInSeconds (interval) {
    if (!interval) interval = 0
    if (typeof (interval) === 'string') interval = parseInt(interval)
    if (interval === Infinity) {
      return ''
    } else if (interval >= 86400) {
      return 'More than one day'
    } else {
      var str = ''
      str += Math.floor(interval / 3600)
      interval %= 3600
      str += ':' + Math.floor(interval / 60)
      interval %= 60
      str += ':' + Math.floor(interval)
      return str
    }
  }

  _stringifySizeInBytes (size) {
    if (!size) size = 0
    if (typeof (size) === 'string') size = parseInt(size)
    size = Math.round(size)
    if (size >= 1073741824) {
      return Math.round((size / 1073741824) * 100) / 100 + 'G'
    } else if (size >= 1048576) {
      return Math.round((size / 1048576) * 100) / 100 + 'M'
    } else if (size >= 1024) {
      return Math.round((size / 1024) * 100) / 100 + 'K'
    } else {
      return Math.round(size) + ''
    }
  }

  _bestUnitForSizeInBytes (size) {
    if (!size) size = 0
    if (typeof (size) === 'string') size = parseInt(size)
    size = Math.round(size)
    if (size >= 1073741824) {
      return 'G'
    } else if (size >= 1048576) {
      return 'M'
    } else if (size >= 1024) {
      return 'K'
    } else {
      return ''
    }
  }

  _parseSizeToBytes (str) {
    if (!str) str = '0'
    let size = parseFloat(str)
    if (str.endsWith('G')) {
      return Math.round(size * 1073741824)
    } else if (str.endsWith('M')) {
      return Math.round(size * 1048576)
    } else if (str.endsWith('K')) {
      return Math.round(size * 1024)
    } else {
      return Math.round(size)
    }
  }
}
