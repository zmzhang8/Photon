<template>
  <div class="row">
    <div class="col-status">
      <i :class="icon[status]"></i>
    </div>
    <div class="col-info">
      <div class="title" :title="alias">{{alias}}</div>
      <div class="small" v-if="totalSize !== '0'">{{totalSize}}</div>
    </div>
    <div class="col-progress">
      <div class="progress-bar">
        <div class="progress" :style="{width: completedPercentage + '%'}"></div>
      </div>
      <div class="small">
        <div>{{remainingTime}}</div>
        <div>{{completedPercentage + '%'}}</div>
      </div>
    </div>
    <div class="col-speed"  v-if="!completed">
      <div v-if="downloadSpeed !== '0'">{{downloadSpeed + 'B/s'}}</div>
      <div v-if="completedPercentage === 100 && uploadSpeed !== '0'">
        <div><i class="far fa-arrow-alt-circle-up"></i> {{uploadSpeed + 'B/s'}}</div>
        <div class="small" v-if="uploadedSize !== '0'">{{uploadedSize}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: [
      'gid',
      'status',
      'alias',
      'totalSize',
      'completedPercentage',
      'remainingTime',
      'uploadedSize',
      'downloadSpeed',
      'uploadSpeed'
    ],
    data: function () {
      return {
        icon: {
          active: ['fas', 'fa-arrow-down'],
          waiting: ['fas', 'fa-clock'],
          paused: ['fas', 'fa-pause'],
          complete: ['fas', 'fa-check'],
          removed: ['fas', 'fa-times'],
          error: ['fas', 'fa-exclamation-circle']
        }
      }
    },
    computed: {
      completed: function () {
        return this.status === 'complete' || this.status === 'removed' || this.status === 'error'
      }
    }
  }
</script>

<style lang="css" scoped>
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-regular.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";

  .row {
    height: 60px;
    padding: 0 8px;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    font-size: 16px;
    font-family: Arial, Helvetica, sans-serif;
  }

  .row > .col-status {
    flex: 0 0 32px;
    font-size: 20px;
    text-align: center;
    color: #555;
  }

  .row > .col-info {
    flex: 1 1 auto;
    padding: 0 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .row > .col-progress {
    flex: 0 0 140px;
    padding: 0 8px;
    display: flex;
    flex-direction: column;
  }

  .row > .col-speed {
    flex: 0 0 108px;
    padding: 0 8px;
    text-align: right;
  }

  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .small {
    margin-top: 4px;
    color: #666;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
  }

  .progress-bar {
    height: 8px;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin: 4px 0;
  }

  .progress-bar .progress {
    background-color: #0098FF;
    height: 100%;
    width: 0%;
    border-radius: 8px;
    transition: width 0.6s ease;
  }

</style>
