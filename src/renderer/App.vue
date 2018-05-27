<template>
  <div id="app">
    <router-view
      :server="manager.servers[serverId]"
      :serverNameList="serverNameList">
    </router-view>
  </div>
</template>

<script>
  export default {
    name: 'photon',
    props: ['manager', 'serverId'],
    computed: {
      serverNameList: function () {
        return this.manager.servers.map(server => {
          return server.name
        })
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
