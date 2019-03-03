import Vue from 'vue'
import VueI18n from 'vue-i18n'

import Aria2Manager from '@/utils/aria2manager'

import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

/*
  aria2
*/
let aria2manager = new Aria2Manager()
aria2manager.setSyncInterval(1000)

/*
  Vue
*/
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

new Vue({
  components: { App },
  router,
  i18n,
  template: '<App :manager="manager"></App>',
  data: {
    manager: aria2manager
  }
}).$mount('#app')

/*
  WebUI
*/
let completeSound = new Audio(require('@/assets/complete.mp3'))
let errorSound = new Audio(require('@/assets/error.mp3'))
aria2manager.onBtDownloadComplete = (tasks, serverName, serverIndex) => completeSound.play()
aria2manager.onDownloadComplete = (tasks, serverName, serverIndex) => {
  if (tasks.some(task => !task.isBT)) completeSound.play()
}
aria2manager.onDownloadError = (tasks, serverName, serverIndex) => errorSound.play()

/*
  Electron
*/
const AppData = require('../main/appdata').default
const { app, powerSaveBlocker } = require('electron').remote
const webFrame = require('electron').webFrame
let aria2server = aria2manager.servers[0]

// disable zooming
webFrame.setZoomLevelLimits(1, 1)

// set app badge (works for macOS and Unity)
setInterval(() => {
  let number = aria2server.tasks.active.length + aria2server.tasks.waiting.length
  app.setBadgeCount(number)
}, 1000)

// prevent suspension when downloading
let blocker
setInterval(() => {
  if (aria2server.isDownloading) {
    if (blocker === undefined || !powerSaveBlocker.isStarted(blocker)) blocker = powerSaveBlocker.start('prevent-app-suspension')
  } else {
    if (blocker && powerSaveBlocker.isStarted(blocker)) powerSaveBlocker.stop(blocker)
  }
}, 30000)

app.on('will-quit', () => {
  AppData.writeData(aria2server.options)
})
