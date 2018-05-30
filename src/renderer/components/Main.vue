<template>
  <div class="wrapper">
    <div class="sidebar">
      <div id="sidebar-servers" class="row" style="padding-bottom: 0;">
        <div class="icon">
          <img src="@/assets/logo.png" class="logo">
        </div>
        <div class="title" style="font-size: 20px; font-weight: bold; cursor: default;">{{serverName}}</div>
      </div>
      <div class="seperator-v"></div>
      <router-link to="/downloads" id="sidebar-downloads" class="row">
        <div class="icon">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="title">Downloads</div>
        <div class="status" v-if="activeNumber">
          <span class="bubble">{{activeNumber}}</span>
        </div>
      </router-link>
      <router-link to="/completes" id="sidebar-completes" class="row">
        <div class="icon">
          <i class="fas fa-check"></i>
        </div>
        <div class="title">Completed</div>
      </router-link>
      <router-link to="/settings" id="sidebar-settings" class="row" @click.native="syncOptions()">
        <div class="icon">
          <i class="fas fa-cog"></i>
        </div>
        <div class="title">Settings</div>
      </router-link>
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
      serverName: function () {
        return this.isDefault ? 'Photon' : this.server.name
      },
      activeNumber: function () {
        let tasks = this.server.tasks
        return tasks.active.length + tasks.waiting.length
      },
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
        if (gids.length === this.downloads.length) this.server.startTasksAll()
        else if (gids.length !== 0) this.server.startTasks(gids)
      },
      pauseTasks: function (gids) {
        if (gids.length === this.downloads.length) this.server.pauseTasksAll()
        else if (gids.length !== 0) this.server.pauseTasks(gids)
      },
      removeTasks: function (gids) {
        if (gids.length !== 0) this.server.removeTasks(gids)
      },
      purgeTasks: function (gids) {
        if (gids.length === this.completes.length) this.server.purgeTasksAll()
        else if (gids.length !== 0) this.server.purgeTasks(gids)
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
    min-width: 200px;
    max-width: 200px;
    min-height: 100%;
    max-height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    background-color: #444444;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .router-link-active {
    background-color: #00A0F1;
  }

  .sidebar > .row {
    padding: 12px 12px;
    color: #dddddd;
    text-decoration: none;
    font-size: 16px;
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    align-items: center;
    user-select: none;
  }

  .row > .icon {
    padding: 0 4px;
    flex: 0 0 20px;
    font-size: 20px;
  }

  .row > .title {
    padding: 0 8px;
    flex: 1 1 auto;
  }

  .row > .status {
    padding: 0 8px;
    font-size: 12px;
    flex: 0 0 32px;
    display: flex;
    align-items: center;
    justify-content: right;
  }

  .bubble {
    min-width: 16px;
    padding: 4px;
    background-color: #0064C7;
    border-radius: 16px;
    text-align: center;
  }

  .logo {
    height: 40px;
    padding: 0 8px;
  }

  .seperator-v {
    margin: 16px 16px;
    border: 1px solid #666;
  }

  .main {
    margin-left: 200px;
    font-size: 20px;
  }
</style>
