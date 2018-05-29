import Vue from 'vue'

import Aria2Manager from '@/service/aria2manager'

import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

let aria2manager = new Aria2Manager()
aria2manager.syncTasksAll()
aria2manager.setSyncInterval(1000)

new Vue({
  components: {
    App
  },
  router,
  template: '<App :manager="manager" :serverId="serverId"></App>',
  data: {
    manager: aria2manager,
    serverId: 0
  }
}).$mount('#app')

// Desktop App
const AppData = require('@/service/appdata').default
const { app, powerSaveBlocker } = require('electron').remote

let server = aria2manager.servers[0]
let blocker

setInterval(() => {
  if (server.isActive()) {
    if (blocker === undefined || !powerSaveBlocker.isStarted(blocker)) blocker = powerSaveBlocker.start('prevent-app-suspension')
  } else {
    if (blocker && powerSaveBlocker.isStarted(blocker)) powerSaveBlocker.stop(blocker)
  }
}, 60000)

app.on('will-quit', () => {
  AppData.writeData(server.options)
})
