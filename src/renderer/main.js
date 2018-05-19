import Vue from 'vue'

// import Aria2RPC from '../service/aria2rpc'
import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

let serverId = 0

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>',
  data: {
    serverId: serverId
  }
}).$mount('#app')
