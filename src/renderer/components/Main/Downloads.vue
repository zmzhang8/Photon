<template>
  <div id="downloads">
    <div class="toolbar">
      <div><i class="fas fa-plus"></i></div>
      <div><i class="fas fa-play"></i></div>
      <div><i class="fas fa-pause"></i></div>
      <div><i class="fas fa-times"></i></div>
    </div>
    <div class="content">
      <task v-for="task in downloads"
        :key="task.gid"
        :gid="task.gid"
        :status="task.status"
        :alias="task.name"
        :totalSize="task.totalSize"
        :completedPercentage="task.completedPercentage"
        :remainingTime="task.remainingTime"
        :uploadedSize="task.uploadedSize"
        :downloadSpeed="task.downloadSpeed"
        :uploadSpeed="task.uploadSpeed">
      </task>
    </div>
  </div>
</template>

<script>
  import Task from './Task/Task'

  export default {
    components: { Task },
    props: ['downloads']
  }
</script>

<style lang="css" scoped>
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";
  @import "~@/styles/toolbar.css";
</style>
