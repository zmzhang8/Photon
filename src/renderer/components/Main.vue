<template>
  <div class="wrapper">
    <div class="sidebar">
      <router-link to="/downloads"><i class="fas fa-arrow-down"></i></router-link>
      <router-link to="/completes"><i class="fas fa-check"></i></router-link>
      <router-link to="/settings"><i class="fas fa-cog"></i></router-link>
    </div>

    <div class="main">
      <router-view
        :downloads="downloads"
        :completes="completes"
        :connection="server.connection"
        :alias="server.name"
        :rpc="server.rpc"
        :options="server.options">
      </router-view>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['server', 'serverNameList'],
    computed: {
      downloads: function () {
        let tasks = this.server.tasks
        return {
          active: tasks.active,
          waiting: tasks.waiting,
          paused: tasks.paused
        }
      },
      completes: function () {
        return this.server.tasks.stopped
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
