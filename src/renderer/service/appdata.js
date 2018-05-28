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
    const dir = AppData.dir()
    const conf = Path.join(dir, 'conf.json')
    try {
      let stat = FS.statSync(dir)
      if (stat.isFile()) {
        FS.unlink(dir)
        FS.mkdirSync(dir, 0o755)
      }
    } catch (error) {
      FS.mkdirSync(dir, 0o755)
    }
    FS.writeFileSync(conf, JSON.stringify(data))
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
}
