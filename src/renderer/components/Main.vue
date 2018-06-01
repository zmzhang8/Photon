<template>
  <div class="wrapper">
    <div class="sidebar">
      <div id="sidebar-servers" class="row" style="padding-bottom: 0;">
        <div class="icon" @click="getEasterEgg">
          <img src="@/assets/logo.png" class="logo">
        </div>
        <div class="title" style="font-size: 20px; font-weight: bold; cursor: default;">{{easterEgg || serverName}}</div>
      </div>
      <div class="seperator-v"></div>
      <router-link to="/downloading" id="sidebar-downloading" class="row">
        <div class="icon">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="title">Downloading</div>
        <div class="status" v-if="activeNumber">
          <span class="bubble">{{activeNumber}}</span>
        </div>
      </router-link>
      <router-link to="/finished" id="sidebar-finished" class="row">
        <div class="icon">
          <i class="fas fa-check"></i>
        </div>
        <div class="title">Finished</div>
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
        :downloading="downloading"
        :finished="finished"
        :settings="settings"
        :connection="server.connection"
        :alias="server.name"
        :rpc="server.rpc"
        :options="server.options"
        @addTask="addTask($event)"
        @startOrPauseTask="startOrPauseTask($event)"
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
  const oConfusable = ['ం', 'ಂ', 'ം', 'ං', '०', '੦', '૦', '௦', '౦', '೦', '൦', '๐', '໐', '၀', '٥', '۵', 'ｏ', 'ℴ', '𝐨', '𝑜', '𝒐', '𝓸', '𝔬', '𝕠', '𝖔', '𝗈', '𝗼', '𝘰', '𝙤', '𝚘', 'ᴏ', 'ᴑ', 'ꬽ', 'ο', '𝛐', '𝜊', '𝝄', '𝝾', '𝞸', 'σ', '𝛔', '𝜎', '𝝈', '𝞂', '𝞼', 'ⲟ', 'о', 'ჿ', 'օ', 'ס', 'ه', '𞸤', '𞹤', '𞺄', 'ﻫ', 'ﻬ', 'ﻪ', 'ﻩ', 'ھ', 'ﮬ', 'ﮭ', 'ﮫ', 'ﮪ', 'ہ', 'ﮨ', 'ﮩ', 'ﮧ', 'ﮦ', 'ە', 'ഠ', 'ဝ', '𐓪', '𑣈', '𑣗', '𐐬']

  export default {
    data: function () {
      return {
        easterEgg: ''
      }
    },
    props: ['server', 'serverNameList', 'isDefault'],
    computed: {
      serverName: function () {
        return this.isDefault ? 'Photon' : this.server.name
      },
      activeNumber: function () {
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
          isDefault: this.isDefault
        }
      }
    },
    methods: {
      getEasterEgg: function () {
        if (this.isDefault) this.easterEgg = this.serverName.replace(/o/g, oConfusable[Math.floor(Math.random() * oConfusable.length)])
      },
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
        if (gids.length === this.downloading.length) this.server.startTasksAll()
        else if (gids.length !== 0) this.server.startTasks(gids)
      },
      pauseTasks: function (gids) {
        if (gids.length === this.downloading.length) this.server.pauseTasksAll()
        else if (gids.length !== 0) this.server.pauseTasks(gids)
      },
      removeTasks: function (gids) {
        if (gids.length !== 0) this.server.removeTasks(gids)
      },
      purgeTasks: function (gids) {
        if (gids.length === this.finished.length) this.server.purgeTasksAll()
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
    min-width: 208px;
    max-width: 208px;
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

  .router-link-active {
    background-color: #00A0F1;
  }

  .sidebar > .row {
    padding: 12px 12px;
    color: #ddd;
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
    padding: 0 4px;
    font-size: 12px;
    flex: 0 0 32px;
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
    margin-left: 208px;
    font-size: 20px;
  }
</style>
