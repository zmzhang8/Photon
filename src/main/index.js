'use strict'

import {
  app,
  BrowserWindow,
  Menu,
  dialog
} from 'electron'

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
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const menuTemplate = [{
  label: 'Application',
  submenu: [{
    label: 'About Application',
    selector: 'orderFrontStandardAboutPanel:'
  },
  {
    type: 'separator'
  },
  {
    label: 'Quit',
    accelerator: 'Command+Q',
    click: function () {
      app.quit()
    }
  }
  ]
},
{
  label: 'Edit',
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    selector: 'undo:'
  },
  {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    selector: 'redo:'
  },
  {
    type: 'separator'
  },
  {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    selector: 'cut:'
  },
  {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    selector: 'copy:'
  },
  {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    selector: 'paste:'
  },
  {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    selector: 'selectAll:'
  }
  ]
}
]

app.on('ready', () => {
  createWindow()
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
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
  const datadir = AppData.dir()
  const root = join(__static, 'aria2').replace('app.asar', 'app.asar.unpacked')
  const aria2c = platform === 'linux' ? 'aria2c' : join(root, platform, 'aria2c')
  const conf = join(root, 'aria2.conf')
  const session = join(datadir, 'aria2.session')

  AppData.makeExecutable(aria2c)
  AppData.makeDir(datadir)
  AppData.touchFile(session)

  let options = Object.assign({
    'input-file': session,
    'save-session': session,
    'dht-file-path': join(datadir, 'dht.dat'),
    'dht-file-path6': join(datadir, 'dht6.dat')
  }, AppData.readData() || {})
  if (!options.hasOwnProperty('dir')) options['dir'] = join(homedir, 'Downloads')

  let command = '"' + aria2c + '" --conf-path="' + conf + '"'
  Object.keys(options).forEach(key => {
    command += ' --' + key + '="' + options[key] + '"'
  })
  return exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(error.message)
      // const message = 'conflicts with an existing aria2 instance. Please stop the instance and reopen the app.'
      dialog.showErrorBox('Conflicts', error.message)
    }
    if (stderr) console.warn(stderr)
    if (stdout) console.log(stdout)
  })
}
