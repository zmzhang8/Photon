<template>
<div class="wrapper">
  <div class="sidebar">
    <div id="sidebar-servers" v-for="(sv, index) in manager.servers"
      :key="index + sv.name">
      <div class="row"
        :class="{profile_active: manager.servers.length > 1 && index === manager.serverIndex}"
        @click="setServerIndex(index)">
        <div class="icon" style="padding: 0;">
          <img src="@/assets/logo.png" class="logo">
        </div>
        <div class="title" style="font-size: 20px; font-weight: bold; cursor: default;">{{ (isDesktop && index === 0) ? "Photon" : sv.name }}</div>
      </div>
    </div>
    <div class="seperator-v"></div>
    <router-link to="/downloading" id="sidebar-downloading" class="row">
      <div class="icon">
        <i class="fas fa-arrow-down"></i>
      </div>
      <div class="title">{{ $t("message.main.downloading") }}</div>
      <div class="status" v-if="downloadingNumber">
        <span class="bubble">{{ downloadingNumber }}</span>
      </div>
    </router-link>
    <router-link to="/finished" id="sidebar-finished" class="row">
      <div class="icon">
        <i class="fas fa-check"></i>
      </div>
      <div class="title">{{ $t("message.main.finished") }}</div>
    </router-link>
    <router-link to="/settings" id="sidebar-settings" class="row" @click.native="syncOptions()">
      <div class="icon">
        <i class="fas fa-cog"></i>
      </div>
      <div class="title">{{ $t("message.main.settings") }}</div>
    </router-link>
  </div>

  <div class="main">
    <router-view
      :downloading="downloading"
      :finished="finished"
      :settings="settings"
      :connection="server.connection"
      :alias="server.name"
      :rpc="server.rpc"
      :options="server.options"
      @addTask="addTask($event)"
      @changeTaskStatus="changeTaskStatus($event)"
      @purgeTasks="purgeTasks($event)"
      @addServer="addServer()"
      @removeServer="removeServer()"
      @updateSettings="updateSettings()">
    </router-view>
  </div>
</div>
</template>

<script>
export default {
  props: ['manager', 'isDesktop'],
  computed: {
    server: function () {
      return this.manager.servers[this.manager.serverIndex]
    },
    isDefault: function () {
      return this.manager.serverIndex === 0
    },
    downloadingNumber: function () {
      let tasks = this.server.tasks
      return tasks.active.length + tasks.waiting.length
    },
    downloading: function () {
      let tasks = this.server.tasks
      return tasks.active.concat(tasks.waiting).concat(tasks.paused)
    },
    finished: function () {
      return this.server.tasks.stopped
    },
    settings: function () {
      let server = this.server
      return {
        name: server.name,
        connection: server.connection,
        rpc: JSON.parse(JSON.stringify(server.rpc)),
        options: JSON.parse(JSON.stringify(server.options)),
        isDefault: this.isDefault,
        isDesktop: this.isDesktop
      }
    }
  },
  methods: {
    syncOptions: function () {
      this.server.checkConnection()
      this.server.syncOptions()
    },
    addTask: function (task) {
      this.server.addTask(task)
    },
    changeTaskStatus: function (event) {
      this.server.changeTaskStatus(event.method, event.gids)
    },
    purgeTasks: function (gids) {
      this.server.purgeTasks(gids)
    },
    addServer: function () {
      this.manager.addServer()
      this.manager.serverIndex = this.manager.servers.length - 1
      this.updateSettings()
    },
    removeServer: function () {
      this.manager.removeServer()
      this.updateSettings()
    },
    setServerIndex: function (index) {
      this.manager.setServerIndex(index)
    },
    updateSettings: function () {
      let server = this.server
      let settings = this.settings
      server.setServer(settings.name, settings.rpc, settings.options, !this.isDefault)
      this.manager.writeStorage()
    }
  }
}
</script>

<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fa-solid.css" scoped></style>
<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fontawesome.css" scoped></style>
<style lang="css" scoped>
.sidebar {
  min-width: 200px;
  max-width: 200px;
  min-height: 100%;
  max-height: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  background-color: #444;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.profile_active {
  background-color: #666;
}

.router-link-active {
  background-color: #00A0F1;
}

.sidebar .row {
  padding: 12px 12px;
  color: #ddd;
  text-decoration: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  user-select: none;
}

.row > .icon {
  padding: 0 8px;
  flex: 0 0 20px;
  font-size: 20px;
}

.row > .title {
  padding: 0 4px;
  flex: 1 1 auto;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.row > .status {
  padding-right: 4px;
  font-size: 12px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: right;
}

.bubble {
  min-width: 16px;
  padding: 4px;
  background-color: #ddd;
  color: #444;
  border-radius: 16px;
  text-align: center;
  font-weight: 600;
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
