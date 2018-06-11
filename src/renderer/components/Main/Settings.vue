<template>
<div id="settings">
  <div class="content">
    <form @change="$emit('updateSettings')">
      <div id="settings-general" class="group" v-if="!settings.isDefault">
        <div class="header">{{ $t("message.settings.general") }}</div>
        <div class="row">
          <div class="left">
            <label for="settings-general-config">{{ $t("message.settings.config") }}</label>
          </div>
          <div class="right">
            <input id="settings-general-config" type="text" required v-model="settings.name">
          </div>
        </div>
      </div>
      <div id="settings-rpc" class="group" v-if="!settings.isDefault">
        <div class="header">{{ $t("message.settings.rpc") }}</div>
        <div class="row">
          <div class="left">
            <label for="settings-rpc-address">{{ $t("message.settings.host") }}</label>
          </div>
          <div class="right">
            <input id="settings-rpc-address" type="text" required v-model="settings.rpc.host">
          </div>
        </div>
        <div class="row">
          <div class="left">
            <label for="settings-rpc-port">{{ $t("message.settings.port") }}</label>
          </div>
          <div class="right">
            <input id="settings-rpc-port" type="number" min="0" max="65535" step="1" required v-model.number="settings.rpc.port">
          </div>
        </div>
        <div class="row">
          <div class="left">
            <label for="settings-rpc-token">{{ $t("message.settings.token") }}</label>
          </div>
          <div class="right">
            <input id="settings-rpc-token" type="password" v-model="settings.rpc.token">
          </div>
        </div>
        <div class="row">
          <div class="left">
            <label for="settings-rpc-protocol">{{ $t("message.settings.encryption") }}</label>
          </div>
          <div class="right">
            <input type="checkbox" v-model="settings.rpc.encryption">
          </div>
        </div>
        <div class="row">
          <div class="left">
            <label for="settings-rpc-status">{{ $t("message.settings.status") }}</label>
          </div>
          <div class="right">
            <span class="badge badge-success" v-if="settings.connection">{{ $t("message.settings.connected") }}</span>
            <span class="badge badge-danger" v-if="!settings.connection">{{ $t("message.settings.disconnected") }}</span>
          </div>
        </div>
      </div>
      <div id="settings-download" class="group">
        <div class="header">{{ $t("message.settings.download") }}</div>
        <div class="row">
          <div class="left">
            <label for="settings-download-path">{{ $t("message.settings.directory") }}</label>
          </div>
          <div class="right pair">
            <label for="settings-download-path-choose" class="button fixed" :class="{'disabled': !settings.isDefault}">{{ $t("message.settings.choose") }}</label>
            <input id="settings-download-path-choose" class="hidden" type="file" webkitdirectory mozdirectory msdirectory odirectory directory multiple @change="setDir($event)">
            <input class="expanded" type="text" disabled v-model="settings.options['dir']">
          </div>
        </div>
        <div class="row">
          <div class="left">
            <label for="settings-download-max-downloading">{{ $t("message.settings.maxDownloading") }}</label>
          </div>
          <div class="right">
            <input id="settings-download-max-downloading" type="number" min="1" max="100" step="1" required v-model.number="settings.options['max-concurrent-downloads']">
          </div>
        </div>
        <div class="row">
          <div class="left">
            <label for="settings-download-download-limit">{{ $t("message.settings.downloadLimit") }}</label>
          </div>
          <div class="right pair">
            <input id="settings-download-download-limit-number" class="fixed" type="number" min="0" max="1000" step="1" required v-model="limits.download.number" @change="setLimitNumber($event, 'download')">
            <select id="settings-download-download-limit-unit" class="fixed" v-model="limits.download.unit" @change="setLimitUnit($event, 'download')">
                <option value="G">GB/s</option>
                <option value="M">MB/s</option>
                <option value="K">KB/s</option>
                <option value="">B/s</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="left">
            <label for="settings-download-upload-limit">{{ $t("message.settings.uploadLimit") }}</label>
          </div>
          <div class="right pair">
            <input id="settings-download-upload-limit-number" class="fixed" type="number" min="0" max="1000" step="1" required v-model="limits.upload.number" @change="setLimitNumber($event, 'upload')">
            <select id="settings-download-upload-limit-unit" class="fixed" v-model="limits.upload.unit" @change="setLimitUnit($event, 'upload')">
                <option value="G">GB/s</option>
                <option value="M">MB/s</option>
                <option value="K">KB/s</option>
                <option value="">B/s</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
</template>

<script>
import Converter from '@/utils/converter'

export default {
  props: ['settings'],
  computed: {
    limits: function () {
      const types = ['download', 'upload']
      let limits = {}
      types.forEach(type => {
        let limit = this.settings.options['max-overall-' + type + '-limit']
        limits[type] = {
          number: parseInt(Converter.bytesToString(limit)),
          unit: Converter.bytesToUnit(limit)
        }
      })
      return limits
    }
  },
  methods: {
    setDir: function (event) {
      let files = event.target.files
      if (files.length) this.settings.options['dir'] = files[0].path
    },
    setLimitNumber: function (event, type) {
      let number = parseInt(event.target.value) || 0
      let bytes = Converter.stringToBytes(number + this.limits[type].unit)
      this.settings.options['max-overall-' + type + '-limit'] = bytes
    },
    setLimitUnit: function (event, type) {
      let unit = event.target.value
      let bytes = Converter.stringToBytes(this.limits[type].number + unit)
      this.settings.options['max-overall-' + type + '-limit'] = bytes
    }
  }
}
</script>

<style lang="css" src="@/styles/option.css" scoped></style>
<style lang="css" scoped>
.badge {
  padding: 4px;
  border-radius: 4px;
  font-size: 16px;
}

.badge-success {
  background-color: #00B246;
  color: white;
}

.badge-danger {
  background-color: #E30034;
  color: white;
}
</style>
