import OS from 'os'
import FS from 'fs'
import Path from 'path'

export default class AppData {
  static appName () {
    return 'Photon'
  }

  static dir () {
    const join = Path.join
    const platform = OS.platform()
    const homedir = OS.homedir()
    const appName = AppData.appName()
    if (platform === 'darwin') return join(homedir, 'Library', 'Application Support', appName)
    else if (platform === 'win32') return join(homedir, 'AppData', 'Roaming', appName)
    else return join(homedir, '.config', appName)
  }

  static writeData (data) {
    let dir = AppData.dir()
    const conf = Path.join(dir, 'conf.json')
    AppData.makeDir(dir)
    try {
      FS.writeFileSync(conf, JSON.stringify(data), { 'mode': 0o644 })
    } catch (error) {
      console.error(error.message)
    }
  }

  static readData () {
    const conf = Path.join(AppData.dir(), 'conf.json')
    try {
      let data = FS.readFileSync(conf, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error(error.message)
      return ''
    }
  }

  static makeExecutable (path) {
    try {
      FS.chmodSync(path, 0o755)
      return true
    } catch (error) {
      console.error(error.message)
      return false
    }
  }

  static touchFile (path) {
    try {
      FS.statSync(path)
    } catch (e) {
      try {
        FS.writeFileSync(path, '', { 'mode': 0o644 })
      } catch (error) {
        console.error(error.message)
      }
    }
  }

  static makeDir (path) {
    try {
      FS.statSync(path)
    } catch (e) {
      try {
        FS.mkdirSync(path, 0o755)
      } catch (error) {
        console.error(error.message)
      }
    }
  }
}
