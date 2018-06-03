import Vue from 'vue'
import VueI18n from 'vue-i18n'

import Aria2Manager from '@/utils/aria2manager'

import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(VueI18n)
const messages = {
  'en-US': { message: require('@/lang/en-US.json') },
  'zh-CN': { message: require('@/lang/zh-CN.json') }
}
const i18n = new VueI18n({
  locale: navigator.language,
  fallbackLocale: 'en-US',
  messages
})

let aria2manager = new Aria2Manager()
aria2manager.syncTasksAll()
aria2manager.setSyncInterval(1000)

new Vue({
  components: {
    App
  },
  router,
  i18n,
  template: '<App :manager="manager"></App>',
  data: {
    manager: aria2manager
  }
}).$mount('#app')

// Electron
const os = require('os')
const AppData = require('../main/appdata').default
const { app, powerSaveBlocker } = require('electron').remote
const window = require('electron').remote.getCurrentWindow()
const webFrame = require('electron').webFrame
let aria2server = aria2manager.servers[0]

// disable zooming
webFrame.setZoomLevelLimits(1, 1)

// set app badge (works for macOS and Unity)
if (os.platform() === 'win32') {
  setInterval(() => {
    let number = aria2server.activeNumber()
    if (number !== 0) window.setOverlayIcon('@/assets/badge.png', number)
    else window.setOverlayIcon(null)
  }, 1000)
} else {
  setInterval(() => {
    app.setBadgeCount(aria2server.activeNumber())
  }, 1000)
}

// prevent suspension when downloading
let blocker
setInterval(() => {
  if (aria2server.isDownloading()) {
    if (blocker === undefined || !powerSaveBlocker.isStarted(blocker)) blocker = powerSaveBlocker.start('prevent-app-suspension')
  } else {
    if (blocker && powerSaveBlocker.isStarted(blocker)) powerSaveBlocker.stop(blocker)
  }
}, 30000)

app.on('will-quit', () => {
  AppData.writeData(aria2server.options)
})
