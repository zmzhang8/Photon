import Vue from 'vue'

import Aria2Manager from '@/utils/aria2manager'

import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

let aria2manager = new Aria2Manager()
aria2manager.syncTasksAll()
aria2manager.setSyncInterval(2000)

new Vue({
  components: {
    App
  },
  router,
  template: '<App :manager="manager"></App>',
  data: {
    manager: aria2manager
  }
}).$mount('#app')

// Desktop App
const AppData = require('../main/appdata').default
const { app, powerSaveBlocker } = require('electron').remote
const webFrame = require('electron').webFrame

webFrame.setZoomLevelLimits(1, 1)

let blocker
setInterval(() => {
  if (aria2manager.servers[0].isActive()) {
    if (blocker === undefined || !powerSaveBlocker.isStarted(blocker)) blocker = powerSaveBlocker.start('prevent-app-suspension')
  } else {
    if (blocker && powerSaveBlocker.isStarted(blocker)) powerSaveBlocker.stop(blocker)
  }
}, 60000)

app.on('will-quit', () => {
  AppData.writeData(aria2manager.servers[0].options)
})
