import Aria2RPC from './aria2rpc'

const defaultRPC = {
  host: '127.0.0.1',
  port: '6800',
  token: '',
  encryption: false
}

const defaultOptions = {
  'max-concurrent-downloads': 5,
  'max-overall-download-limit': 0,
  'max-overall-upload-limit': 262144
}

const defaultSeedingOptions = {
  'seed-time': '43200',
  'seed-ratio': '10'
}

const defaultNoSeedingOptions = {
  'seed-time': '0',
  'seed-ratio': '0.1'
}

export default class Aria2Server {
  constructor (name = 'Default', rpc = defaultRPC, options = defaultOptions) {
    this._handle = new Aria2RPC(rpc.host, rpc.port, rpc.token, rpc.encryption)

    this.name = name
    this.rpc = Object.assign({}, rpc)
    this.options = Object.assign({}, options)
    this.connection = false
    this.tasks = {
      active: [],
      waiting: [],
      paused: [],
      stopped: []
    }
  }

  get isDownloading () {
    return this.tasks.active.some(task => task.completedLength !== task.totalLength)
  }

  setServer (name = 'Default', rpc = defaultRPC, options = defaultOptions, ignoreDir = true) {
    this.name = name.slice()
    this.rpc = Object.assign({}, rpc)
    let dir = this.options['dir']
    this.options = Object.assign({}, options)
    if (ignoreDir) this.options['dir'] = dir
    this._handle.setRPC(rpc.host, rpc.port, rpc.token, rpc.encryption)
    let strOptions = {}
    for (let key in options) strOptions[key] = options[key].toString()
    this._handle.changeGlobalOption(strOptions)
  }

  checkConnection (successCallback, errorCallback) {
    let that = this
    this._handle.getVersion(result => {
      that.connection = true
      if (typeof successCallback === 'function') successCallback(result)
    }, error => {
      that.connection = false
      if (typeof errorCallback === 'function') errorCallback(error)
    })
  }

  addTask (task, successCallback, errorCallback) {
    let handle = this._handle
    let options = task.seeding ? defaultSeedingOptions : defaultNoSeedingOptions
    switch (task.type) {
      case 'torrent':
        if (task.selectfile) {
          options['select-file'] = task.selectfile
        }
        handle.addTorrent(task.file, options, successCallback, errorCallback)
        break
      case 'metalink':
        handle.addMetalink(task.file, options, successCallback, errorCallback)
        break
      case 'http':
        handle.addUri(task.uris, options, successCallback, errorCallback)
        break
      default:
    }
  }

  changeTaskStatus (method, gids = [], successCallback, errorCallback) {
    if (method === 'unpause') this._handle.unpause(gids, successCallback, errorCallback)
    else if (method === 'pause') this._handle.pause(gids, successCallback, errorCallback)
    else if (method === 'remove') this._handle.remove(gids, successCallback, errorCallback)
  }

  purgeTasks (gids = [], successCallback, errorCallback) {
    this._handle.removeDownloadResult(gids, successCallback, errorCallback)
  }

  syncDownloading () {
    let tasks = this.tasks
    this._handle.tellActive(results => {
      tasks.active = results.map(result => this._formatTask(result))
    }, e => {
      tasks.active = []
    })
    this._handle.tellWaiting(results => {
      tasks.waiting = results.filter(result => result.status === 'waiting')
        .map(result => this._formatTask(result))
      tasks.paused = results.filter(result => result.status === 'paused')
        .map(result => this._formatTask(result))
    }, e => {
      tasks.waiting = []
      tasks.paused = []
    })
  }

  syncFinished () {
    let tasks = this.tasks
    this._handle.tellStopped(results => {
      tasks.stopped = results.map(result => this._formatTask(result))
    }, e => {
      tasks.stopped = []
    })
  }

  syncOptions () {
    let options = this.options
    this._handle.getGlobalOption(result => {
      options['dir'] = result['dir']
      options['max-concurrent-downloads'] = parseInt(result['max-concurrent-downloads'])
      options['max-overall-download-limit'] = parseInt(result['max-overall-download-limit'])
      options['max-overall-upload-limit'] = parseInt(result['max-overall-upload-limit'])
    })
  }

  _formatTask (task) {
    let pathDir = (path) => path.substr(0, path.lastIndexOf('/'))
    return {
      gid: task.gid,
      status: task.status,
      isBT: task.hasOwnProperty('bittorrent') && task['bittorrent'].hasOwnProperty('info'),
      name: task.hasOwnProperty('bittorrent') && task['bittorrent'].hasOwnProperty('info') ? task['bittorrent']['info']['name'] : task['files'][0]['path'].replace(/^.*[\\/]/, ''),
      totalLength: parseInt(task.totalLength),
      completedLength: parseInt(task.completedLength),
      uploadLength: parseInt(task.uploadLength),
      downloadSpeed: parseInt(task.downloadSpeed),
      uploadSpeed: parseInt(task.uploadSpeed),
      connections: parseInt(task.connections),
      dir: task.dir,
      path: pathDir(task.files[0].path) === task.dir ? task.files[0].path
        : task.files.map(task => pathDir(task.path))
          .reduce((last, cur) => last.length <= cur.length ? last : cur)
    }
  }
}

['onDownloadStart', 'onDownloadPause', 'onDownloadStop', 'onDownloadComplete', 'onDownloadError', 'onBtDownloadComplete'].forEach(method => {
  Object.defineProperty(Aria2Server.prototype, method, {
    get: function () {
      return undefined
    },
    set: function (callback) {
      let handle = this._handle
      let formatTask = this._formatTask
      handle[method] = results => {
        let gids = results.map(result => result.gid)
        handle.tellStatus(gids, tasks => {
          if (typeof callback === 'function') callback(tasks.map(task => formatTask(task)))
        })
      }
    }
  })
})
