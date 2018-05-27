import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'main',
    component: require('@/components/Main').default,
    children: [{
      path: 'downloads',
      name: 'downloads',
      component: require('@/components/Main/Downloads').default
    },
    {
      path: 'completes',
      name: 'completes',
      component: require('@/components/Main/Completes').default
    },
    {
      path: 'settings',
      name: 'settings',
      component: require('@/components/Main/Settings').default
    },
    {
      path: '*',
      redirect: 'downloads'
    }
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
  ]
})
