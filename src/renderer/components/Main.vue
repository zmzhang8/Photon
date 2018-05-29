<template>
  <div class="wrapper">
    <div class="sidebar">
      <router-link to="/downloads"><i class="fas fa-arrow-down"></i></router-link>
      <router-link to="/completes"><i class="fas fa-check"></i></router-link>
      <router-link to="/settings" @click.native="syncOptions()"><i class="fas fa-cog"></i></router-link>
    </div>

    <div class="main">
      <router-view
        :downloads="downloads"
        :completes="completes"
        :settings="settings"
        :connection="server.connection"
        :alias="server.name"
        :rpc="server.rpc"
        :options="server.options"
        @addTask="addTask($event)"
        @startTasks="startTasks($event)"
        @pauseTasks="pauseTasks($event)"
        @removeTasks="removeTasks($event)"
        @purgeTasks="purgeTasks($event)"
        @updateSettings="updateSettings()">
      </router-view>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['server', 'serverNameList', 'isDefault'],
    computed: {
      downloads: function () {
        let tasks = this.server.tasks
        return tasks.active.concat(tasks.waiting).concat(tasks.paused)
      },
      completes: function () {
        return this.server.tasks.stopped
      },
      settings: function () {
        let server = this.server
        return {
          name: server.name,
          connection: server.connection,
          rpc: JSON.parse(JSON.stringify(server.rpc)),
          options: JSON.parse(JSON.stringify(server.options)),
          isDefault: this.isDefault
        }
      }
    },
    methods: {
      syncOptions: function () {
        this.server.syncOptions()
      },
      addTask: function (info) {
        let server = this.server
        if (info.file) {
          if (info.type === 'torrent') server.addTorrent(info.file, info.seeding)
          else if (info.type === 'metalink') server.addMetalink(info.file, info.seeding)
        } else server.addUrls(info.urls, info.seeding)
      },
      startTasks: function (gids) {
        if (gids.length === 0) this.server.startTasksAll()
        else this.server.startTasks(gids)
      },
      pauseTasks: function (gids) {
        if (gids.length === 0) this.server.pauseTasksAll()
        else this.server.pauseTasks(gids)
      },
      removeTasks: function (gids) {
        this.server.removeTasks(gids)
      },
      purgeTasks: function (gids) {
        if (gids.length === 0) this.server.purgeTasksAll()
        else this.server.purgeTasks(gids)
      },
      updateSettings: function () {
        let server = this.server
        let settings = this.settings
        server.setServer(settings.name, settings.rpc, settings.options, !this.isDefault)
        server.checkConnection()
        this.$emit('updateServer')
      }
    }
  }
</script>

<style lang="css">
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";

  .sidebar {
    min-width: 68px;
    max-width: 68px;
    min-height: 100%;
    max-height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    color: #dddddd;
    background-color: #444444;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .sidebar > a {
    height: 68px;
    line-height: 68px;
    font-size: 36px;
    text-align: center;
    color: inherit;
  }

  .main {
    margin-left: 68px;
    font-size: 20px;
  }
</style>
