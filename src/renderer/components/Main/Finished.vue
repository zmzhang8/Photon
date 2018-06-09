<template>
<div id="finished">
  <div class="toolbar">
    <a href="#" :class="{disabled: selectedList.length === 0}" @click="purgeTasks()">
      <i class="fas fa-trash"></i>
    </a>
    <a href="#" @click="selectAll()">
      <i class="fas fa-list"></i>
    </a>
  </div>

  <div class="content">
    <task v-for="task in finished"
      :key="task.gid"
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
      @multiSelectTask="multiSelectTask($event)">
    </task>
  </div>
</div>
</template>

<script>
import Task from './Task/Task'

export default {
  components: { Task },
  props: ['finished'],
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
      if (this.selectedList.length === this.finished.length) {
        this.selected = {}
      } else {
        this.finished.forEach(task => {
          this.$set(this.selected, task.gid, true)
        })
      }
    },
    purgeTasks: function () {
      this.$emit('purgeTasks', this.selectedList)
      this.selected = {}
    }
  }
}
</script>

<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fa-solid.css" scoped></style>
<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fontawesome.css" scoped></style>
<style lang="css" src="@/styles/toolbar.css" scoped></style>
