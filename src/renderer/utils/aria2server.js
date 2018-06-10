import Aria2RPC from './aria2rpc'

const defaultRPC = {
  address: '127.0.0.1',
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

export default class Aria2Server {
  constructor (name = 'Default', rpc = defaultRPC, options = defaultOptions) {
    this.name = name
    this.rpc = Object.assign({}, rpc)
    this.options = Object.assign({}, options)
    this.handle = new Aria2RPC(rpc.address, rpc.port, rpc.token, rpc.encryption)
    this.connection = false
    this.tasks = {
      active: [],
      waiting: [],
      paused: [],
      stopped: []
    }
  }

  addUri (uris = [], seeding = false) {
    let options = seeding ? defaultSeedingOptions : {}
    this.handle.addUri(uris, options, result => this.syncTasks())
  }

  addTorrent (torrent, seeding = false) {
    let options = seeding ? defaultSeedingOptions : {}
    this.handle.addTorrent(torrent, options, result => this.syncTasks())
  }

  addMetalink (metalink, seeding = false) {
    let options = seeding ? defaultSeedingOptions : {}
    this.handle.addTorrent(metalink, options, result => this.syncTasks())
  }

  changeTaskStatus (method, gids = []) {
    if (method === 'unpause') this.handle.unpause(gids, result => this.syncTasks())
    else if (method === 'pause') this.handle.pause(gids, result => this.syncTasks())
    else if (method === 'remove') this.handle.remove(gids, result => this.syncTasks())
  }

  purgeTasks (gids = []) {
    this.handle.removeDownloadResult(gids, result => this.syncTasks())
  }

  syncTasks () {
    let handle = this.handle
    let tasks = this.tasks
    handle.tellActive(results => {
      tasks.active = results.map(result => this._formatTask(result))
    })
    handle.tellWaiting(results => {
      tasks.waiting = results.filter(result => result.status === 'waiting')
        .map(result => this._formatTask(result))
      tasks.paused = results.filter(result => result.status === 'paused')
        .map(result => this._formatTask(result))
    })
    handle.tellStopped(results => {
      tasks.stopped = results.map(result => this._formatTask(result))
    })
  }

  syncOptions () {
    let options = this.options
    this.handle.getGlobalOption(result => {
      options['dir'] = result['dir']
      options['max-concurrent-downloads'] = parseInt(result['max-concurrent-downloads'])
      options['max-overall-download-limit'] = parseInt(result['max-overall-download-limit'])
      options['max-overall-upload-limit'] = parseInt(result['max-overall-upload-limit'])
    })
  }

  checkConnection () {
    this.handle.getVersion(result => {
      this.connection = true
    }, e => {
      this.connection = false
    })
  }

  isDownloading () {
    return this.tasks.active.some(task => task.completedLength !== task.totalLength)
  }

  activeNumber () {
    return this.tasks.active.length + this.tasks.waiting.length
  }

  setServer (name = 'Default', rpc = defaultRPC, options = defaultOptions, ignoreDir = true) {
    this.name = name.slice()
    this.rpc = Object.assign({}, rpc)
    let dir = this.options['dir']
    this.options = Object.assign({}, options)
    if (ignoreDir) this.options['dir'] = dir
    this.handle.setRPC(rpc.address, rpc.port, rpc.token, rpc.encryption)
    this.handle.changeGlobalOption(options)
  }

  _formatTask (task) {
    let pathDir = (path) => path.substr(0, path.lastIndexOf('/'))
    return {
      gid: task.gid,
      status: task.status,
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
