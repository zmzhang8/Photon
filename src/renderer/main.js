import Vue from 'vue'

import Aria2Manager from '@/service/aria2manager'
import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

let aria2manager = new Aria2Manager()
// aria2manager.setSyncInterval(3000)

new Vue({
  components: { App },
  router,
  template: '<App :manager="manager" :serverId="serverId"></App>',
  data: {
    manager: aria2manager,
    serverId: 0
  }
}).$mount('#app')

// Electron
function startAria2 (options) {
  const exec = require('child_process').exec
  const join = require('path').join
  const platform = require('os').platform()
  const homedir = require('os').homedir()
  let root = join(__static, 'aria2')
  let conf = join(root, 'aria2.conf')
  let aria2c = platform === 'linux' ? 'aria2c' : join(root, platform, 'aria2c')
  let command = '"' + aria2c + '" --conf-path="' + conf + '"'
  if (!options.hasOwnProperty('dir')) options['dir'] = homedir
  Object.keys(options).forEach(key => {
    command += ' --' + key + '="' + options[key] + '"'
  })
  return exec(command, (error, stdout, stderr) => {
    if (error) console.error(error.message)
    if (stderr) console.warn(stderr)
    if (stdout) console.log(stdout)
  })
}

let aria2process = startAria2(aria2manager.servers[0].options)
require('electron').remote.app.on('window-all-closed', () => {
  aria2process.kill()
})
