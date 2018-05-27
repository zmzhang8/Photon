import Vue from 'vue'

import Aria2Manager from '@/service/aria2manager'
import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App :manager="manager" :serverId="serverId"></App>',
  data: {
    manager: new Aria2Manager(),
    serverId: 0
  }
}).$mount('#app')
