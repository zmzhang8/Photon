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
              <input id="settings-config-name" type="text" required></input>
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
              <input id="settings-rpc-address" type="text" pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}$" required></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-port">Port</label>
            </div>
            <div class="right">
              <input id="settings-rpc-port" type="number" min="0" max="65535" step="1" required></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-token">Token</label>
            </div>
            <div class="right">
              <input id="settings-rpc-token" type="password"></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-protocol">Protocol</label>
            </div>
            <div class="right">
              <select id="settings-rpc-protocol">
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-rpc-status">Status</label>
            </div>
            <div class="right">
              <span class="badge badge-success">Connected</span>
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
              <input id="settings-download-path-choose" class="hidden" type="file" webkitdirectory mozdirectory msdirectory odirectory directory multiple>
              <input type="text" disabled class="expanded ml"></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-download-max-active">Max Active</label>
            </div>
            <div class="right">
              <input id="settings-download-max-active" type="number" min="1" max="100" step="1" required></input>
            </div>
          </div>
          <div class="row">
            <div class="left">
              <label for="settings-download-download-limit">Download Limit</label>
            </div>
            <div class="right pair">
              <input id="settings-download-download-limit-number" class="fixed" type="number" min="0" max="1000" step="1" required>
              <select id="settings-download-download-limit-unit" class="fixed ml">
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
              <input id="settings-download-upload-limit-number" class="fixed" type="number" min="0" max="1000" step="1" required>
              <select id="settings-download-upload-limit-unit" class="fixed ml">
                  <option value="G">GB/s</option>
                  <option value="M">MB/s</option>
                  <option value="K">KB/s</option>
                  <option value="">B/s</option>
              </select>
            </div>
          </div>
        </div>
        <div id="settings-save" class="row justify-content-center">
          <span class="button button-large ">Save</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'settings'
  }
</script>

<style lang="css" scoped>
@import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
@import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";
@import "~@/css/option.css";

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
