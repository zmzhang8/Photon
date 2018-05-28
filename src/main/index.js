'use strict'

import { app, BrowserWindow, dialog } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let aria2process
let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    width: 1200,
    height: 800,
    // width: 428,
    // height: 600,
    minWidth: 428,
    minHeight: 600
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  aria2process = startAria2()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('will-quit', () => {
  if (aria2process) aria2process.kill()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

// aria2
function startAria2 () {
  const AppData = require('../renderer/service/appdata').default
  const exec = require('child_process').exec
  const join = require('path').join
  const platform = require('os').platform()
  const homedir = require('os').homedir()
  const root = join(__static, 'aria2')
  const conf = join(root, 'aria2.conf')
  const aria2c = platform === 'linux' ? 'aria2c' : join(root, platform, 'aria2c')

  let options = AppData.readData() || {}
  if (!options.hasOwnProperty('dir')) options['dir'] = join(homedir, 'Downloads')
  let command = '"' + aria2c + '" --conf-path="' + conf + '"'
  Object.keys(options).forEach(key => {
    command += ' --' + key + '="' + options[key] + '"'
  })
  return exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(error.message)
      const message = 'conflicts with an existing aria2 instance. Please stop the instance and reopen the app.'
      dialog.showErrorBox('Conflicts', message)
    }
    if (stderr) console.warn(stderr)
    if (stdout) console.log(stdout)
  })
}
