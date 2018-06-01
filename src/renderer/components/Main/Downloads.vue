<template>
  <div id="downloads">
    <div class="toolbar">
      <router-link to="/newTask">
        <i class="fas fa-plus"></i>
      </router-link>
      <div class="seperator-h"></div>
      <a href="#" :class="{disabled: selectedList.length === 0}" @click="startTasks()">
        <i class="fas fa-play"></i>
      </a>
      <a href="#" :class="{disabled: selectedList.length === 0}" @click="pauseTasks()">
        <i class="fas fa-pause"></i>
        </a>
      <a href="#" :class="{disabled: selectedList.length === 0}" @click="removeTasks()">
        <i class="fas fa-times"></i>
      </a>
      <a href="#" @click="selectAll()">
        <i class="fas fa-list"></i>
      </a>
    </div>

    <div class="content">
      <task v-for="task in downloads"
        :key="task.gid + task.status"
        :selected="selected[task.gid]"
        :gid="task.gid"
        :status="task.status"
        :alias="task.name"
        :totalLength="task.totalLength"
        :completedLength="task.completedLength"
        :uploadLength="task.uploadLength"
        :downloadSpeed="task.downloadSpeed"
        :uploadSpeed="task.uploadSpeed"
        :connections="task.connections"
        @selectTask="selectTask($event)"
        @multiSelectTask="multiSelectTask($event)"
        @startTask="startTask($event)"
        @pauseTask="pauseTask($event)">
      </task>
    </div>
  </div>
</template>

<script>
  import Task from './Task/Task'

  export default {
    components: { Task },
    props: ['downloads'],
    data: function () {
      return {
        selected: {}
      }
    },
    computed: {
      selectedList: function () {
        return Object.keys(this.selected).filter(key => this.selected[key])
      }
    },
    methods: {
      selectTask: function (gid) {
        this.selected = {}
        this.$set(this.selected, gid, true)
      },
      multiSelectTask: function (gid) {
        let selected = this.selected
        if (selected[gid]) {
          this.$set(selected, gid, false)
        } else this.$set(selected, gid, true)
      },
      selectAll: function () {
        if (this.selectedList.length === this.downloads.length) {
          this.selected = {}
        } else {
          this.downloads.forEach(task => {
            this.$set(this.selected, task.gid, true)
          })
        }
      },
      startTasks: function () {
        this.$emit('startTasks', this.selectedList)
        this.selected = {}
      },
      pauseTasks: function () {
        this.$emit('pauseTasks', this.selectedList)
        this.selected = {}
      },
      removeTasks: function () {
        this.$emit('removeTasks', this.selectedList)
        this.selected = {}
      },
      startTask: function (gid) {
        this.$emit('startTasks', [gid])
        this.selected = {}
      },
      pauseTask: function (gid) {
        this.$emit('pauseTasks', [gid])
        this.selected = {}
      }
    }
  }
</script>

<style lang="css" scoped>
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";
  @import "~@/styles/toolbar.css";
</style>
