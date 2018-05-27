<template>
  <div id="settings">
    <div class="content">
      <form>
        <div id="settings-config" class="group">
        <div class="header">Config</div>
          <div class="row">
            <div class="left">
              <label for="settings-config-name">Name</label>
            </div>
            <div class="right">
              <input id="settings-config-name" type="text" required v-model="alias"></input>
            </div>
          </div>
        </div>
        <div id="settings-rpc" class="group">
          <div class="header">RPC</div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-address">Address</label>
            </div>
            <div class="right">
              <input id="settings-rpc-address" type="text" pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}$" required v-model="rpc.address"></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-port">Port</label>
            </div>
            <div class="right">
              <input id="settings-rpc-port" type="number" min="0" max="65535" step="1" required v-model.number="rpc.port"></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-token">Token</label>
            </div>
            <div class="right">
              <input id="settings-rpc-token" type="password" v-model="rpc.token"></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-protocol">Protocol</label>
            </div>
            <div class="right">
              <select id="settings-rpc-protocol" v-model="rpc.httpsEnabled">
                <option value="false">HTTP</option>
                <option value="true">HTTPS</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-status">Status</label>
            </div>
            <div class="right">
              <span class="badge badge-success" v-if="connection">Connected</span>
              <span class="badge badge-danger" v-if="!connection">Not Connected</span>
            </div>
          </div>
        </div>
        <div id="settings-download" class="group">
          <div class="header">Download</div>
          <div class="row">
            <div class="left">
              <label for="settings-download-path">Path</label>
            </div>
            <div class="right pair">
              <label for="settings-download-path-choose" class="button fixed">Choose</label>
              <input id="settings-download-path-choose" class="hidden" type="file" webkitdirectory mozdirectory msdirectory odirectory directory multiple @change="setDir($event)">
              <input class="expanded" type="text" disabled v-model="options['dir']"></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-download-max-active">Max Active</label>
            </div>
            <div class="right">
              <input id="settings-download-max-active" type="number" min="1" max="100" step="1" required v-model.number="options['max-concurrent-downloads']"></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-download-download-limit">Download Limit</label>
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
              <label for="settings-download-upload-limit">Upload Limit</label>
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
        <div id="settings-save" class="row vspace">
          <span class="button button-large" @click="$emit('changeSettings')">Save</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import Converter from '@/service/converter'

  export default {
    props: ['connection', 'alias', 'rpc', 'options'],
    data: function () {
      return {
        changed: true
      }
    },
    computed: {
      limits: function () {
        const types = ['download', 'upload']
        let limits = {}
        types.forEach(type => {
          let limit = this.options['max-overall-' + type + '-limit']
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
        if (files.length !== 0) {
          this.options['dir'] = files[0].path
        }
      },
      setLimitNumber: function (event, type) {
        let number = parseInt(event.target.value) || 0
        let bytes = Converter.stringToBytes(number + this.limits[type].unit)
        this.options['max-overall-' + type + '-limit'] = bytes
      },
      setLimitUnit: function (event, type) {
        let unit = event.target.value
        let bytes = Converter.stringToBytes(this.limits[type].number + unit)
        this.options['max-overall-' + type + '-limit'] = bytes
      }
    }
  }
</script>

<style lang="css" scoped>
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";
  @import "~@/styles/option.css";

  .badge {
    padding: 4px;
    border-radius: 4px;
    font-size: 16px;
    font-family: Arial, Helvetica, sans-serif;
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
