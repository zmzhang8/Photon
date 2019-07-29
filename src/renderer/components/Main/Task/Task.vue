<template>
<div class="row" :class="{selected: selected}" @click.left.stop="onClick()" @click.right.stop="$emit('multiSelectTask', gid)">
  <div class="col-status">
    <i :class="icon[status]"></i>
  </div>
  <div class="col-info">
    <div class="title" :title="alias">{{ alias }}</div>
    <div class="detail detail-left">
      <div v-if="totalLength !== 0">{{ bytesToString(totalLength, 2) }}</div>
      <div style="margin-left: 16px;" v-if="uploadLength !== 0">
        <i class="far fa-arrow-alt-circle-up"></i> {{ bytesToString(uploadLength, 2) }}
        <span v-if="uploadSpeed !== 0">, {{ bytesToString(uploadSpeed, 1) + 'B/s' }}</span>
        </div>
    </div>
  </div>
  <div class="col-progress">
    <div class="progress-bar">
      <div class="progress" :class="{'progress-success': completedLength === totalLength}" :style="{width: completedPercentage}"></div>
    </div>
    <div class="detail">
      <div v-if="status === 'active'">{{ secondsToString(remainingTime) }}</div>
      <div v-if="status === 'active'">{{ completedPercentage }}</div>
    </div>
  </div>
  <div class="col-speed"  v-if="!finished">
    <div v-if="status ==='active' && completedLength !== totalLength && downloadSpeed !== 0">{{ bytesToString(downloadSpeed, 1) + 'B/s' }}</div>
  </div>
</div>
</template>

<script>
import Converter from '@/utils/converter.js'

export default {
  props: [
    'selected',
    'gid',
    'status',
    'alias',
    'totalLength',
    'completedLength',
    'uploadLength',
    'downloadSpeed',
    'uploadSpeed',
    'connections'
  ],
  data: function () {
    return {
      icon: {
        active: ['fas', 'fa-arrow-down'],
        waiting: ['fas', 'fa-clock'],
        paused: ['fas', 'fa-pause'],
        complete: ['fas', 'fa-check'],
        removed: ['fas', 'fa-times'],
        error: ['fas', 'fa-exclamation']
      },
      clicks: 0,
      timer: undefined
    }
  },
  computed: {
    finished: function () {
      return this.status === 'complete' || this.status === 'removed' || this.status === 'error'
    },
    completedPercentage: function () {
      return (this.totalLength ? Math.round(this.completedLength / this.totalLength * 100) : 0) + '%'
    },
    remainingTime: function () {
      return (this.totalLength - this.completedLength) / this.downloadSpeed
    }
  },
  methods: {
    secondsToString: Converter.secondsToString,
    bytesToString: Converter.bytesToString,
    onClick: function () {
      if (++this.clicks === 1) {
        this.timer = setTimeout(() => {
          this.clicks = 0
          this.$emit('selectTask', this.gid)
        }, 250)
      } else {
        clearTimeout(this.timer)
        this.clicks = 0
        if (!this.finished) {
          if (this.status === 'paused') this.$emit('changeTaskStatus', {method: 'unpause', gids: this.gid})
          else this.$emit('changeTaskStatus', {method: 'pause', gids: this.gid})
        }
      }
    }
  }
}
</script>

<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fa-regular.css" scoped></style>
<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fa-solid.css" scoped></style>
<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fontawesome.css" scoped></style>
<style lang="css" scoped>
.row {
  height: 60px;
  padding: 0 8px;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  font-size: 16px;
  user-select: none;
}

.row:hover {
  text-decoration: none;
  cursor: default;
}

.row > .col-status {
  flex: 0 0 32px;
  font-size: 20px;
  text-align: center;
  color: #666;
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
  flex: 0 0 100px;
  padding: 0 8px;
  text-align: right;
}

.title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.detail {
  margin-top: 4px;
  color: #666;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
}

.detail-left {
  justify-content: flex-start;
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

.progress-bar .progress-success {
  background-color: #00DD00;
}

.selected {
  background-color: #D6ECFF;
}
</style>
