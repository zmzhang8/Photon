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
const AppData = require('../main/appdata').default
const { app, powerSaveBlocker } = require('electron').remote
const webFrame = require('electron').webFrame

webFrame.setZoomLevelLimits(1, 1)

let blocker
setInterval(() => {
  if (aria2manager.servers[0].isDownloading()) {
    if (blocker === undefined || !powerSaveBlocker.isStarted(blocker)) blocker = powerSaveBlocker.start('prevent-app-suspension')
  } else {
    if (blocker && powerSaveBlocker.isStarted(blocker)) powerSaveBlocker.stop(blocker)
  }
}, 60000)

app.on('will-quit', () => {
  AppData.writeData(aria2manager.servers[0].options)
})
