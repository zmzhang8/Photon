<template>
  <div id="downloads">
    <div class="toolbar">
      <a><i class="fas fa-plus"></i></a>
      <a><i class="fas fa-play"></i></a>
      <a><i class="fas fa-pause"></i></a>
      <a><i class="fas fa-times"></i></a>
    </div>
    <div class="content">
      <task v-for="task in downloads"
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
        @selectTask="selectTask($event)">
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
        selects: {}
      }
    },
    methods: {
      selectTask: function (gid) {
        let selects = this.selects
        if (selects.hasOwnProperty(gid)) {
          this.$set(selects, gid, false)
          delete selects[gid]
        } else this.$set(selects, gid, true)
      }
    }
  }
</script>

<style lang="css" scoped>
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";
  @import "~@/styles/toolbar.css";
</style>
