<template>
<div id="downloading">
  <div class="toolbar">
    <router-link to="/newTask">
      <i class="fas fa-plus"></i>
    </router-link>
    <div class="seperator-h"></div>
    <a href="#" :class="{disabled: selectedList.length === 0}" @click="changeTaskStatus({method: 'unpause'})">
      <i class="fas fa-play"></i>
    </a>
    <a href="#" :class="{disabled: selectedList.length === 0}" @click="changeTaskStatus({method: 'pause'})">
      <i class="fas fa-pause"></i>
      </a>
    <a href="#" :class="{disabled: selectedList.length === 0}" @click="changeTaskStatus({method: 'remove'})">
      <i class="fas fa-times"></i>
    </a>
    <a href="#" @click="selectAll()">
      <i class="fas fa-list"></i>
    </a>
  </div>

  <div class="content">
    <task v-for="task in downloading"
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
      @changeTaskStatus="changeTaskStatus($event)">
    </task>
  </div>
</div>
</template>

<script>
import Task from './Task/Task'

export default {
  components: { Task },
  props: ['downloading'],
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
      if (this.selectedList.length === this.downloading.length) {
        this.selected = {}
      } else {
        this.downloading.forEach(task => {
          this.$set(this.selected, task.gid, true)
        })
      }
    },
    changeTaskStatus: function (event) {
      this.$emit('changeTaskStatus', {
        method: event.method,
        gids: event.gids || this.selectedList
      })
      this.selected = {}
    }
  }
}
</script>

<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fa-solid.css" scoped></style>
<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fontawesome.css" scoped></style>
<style lang="css" src="@/styles/toolbar.css" scoped></style>
