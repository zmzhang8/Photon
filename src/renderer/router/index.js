import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'main',
    component: require('@/components/Main').default,
    children: [
      {
        path: 'downloading',
        name: 'downloading',
        component: require('@/components/Main/Downloading').default
      },
      {
        path: 'finished',
        name: 'finished',
        component: require('@/components/Main/Finished').default
      },
      {
        path: 'settings',
        name: 'settings',
        component: require('@/components/Main/Settings').default
      },
      {
        path: 'newTask',
        name: 'newTask',
        component: require('@/components/Main/NewTask').default
      },
      {
        path: '*',
        redirect: 'downloading'
      }
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
  ]
})
