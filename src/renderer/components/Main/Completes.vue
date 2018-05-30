<template>
  <div id="completes">
    <div class="toolbar">
      <a @click="purgeTasks()"><i class="fas fa-trash"></i></a>
      <a @click="selectAll()"><i class="fas fa-list"></i></a>
    </div>
    <div class="content">
      <task v-for="task in completes"
        :key="task.gid"
        :selected="selects[task.gid]"
        :gid="task.gid"
        :status="task.status"
        :alias="task.name"
        :totalSize="task.totalSize"
        :completedPercentage="task.completedPercentage"
        :remainingTime="task.remainingTime"
        :uploadedSize="task.uploadedSize"
        :downloadSpeed="task.downloadSpeed"
        :uploadSpeed="task.uploadSpeed"
        :dir="task.dir"
        :path="task.path"
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
    props: ['completes'],
    data: function () {
      return {
        selects: {}
      }
    },
    computed: {
      checkedList: function () {
        return Object.keys(this.selects).filter(key => this.selects[key])
      }
    },
    methods: {
      selectTask: function (gid) {
        this.selects = {}
        this.$set(this.selects, gid, true)
      },
      multiSelectTask: function (gid) {
        let selects = this.selects
        if (selects[gid]) {
          this.$set(selects, gid, false)
        } else this.$set(selects, gid, true)
      },
      selectAll: function () {
        if (this.checkedList.length === this.completes.length) {
          this.selects = {}
        } else {
          this.completes.forEach(task => {
            this.$set(this.selects, task.gid, true)
          })
        }
      },
      purgeTasks: function () {
        this.$emit('purgeTasks', this.checkedList)
        this.selects = {}
      }
    }
  }
</script>

<style lang="css" scoped>
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";
  @import "~@/styles/toolbar.css";
</style>
