<template>
  <div id="new-task">
    <div class="group">
      <div class="header">Task</div>
      <div class="row" v-if="!file">
        <div class="left">
          <label for="new-task-urls">URLs</label>
        </div>
        <div class="right">
          <textarea id="new-task-urls" v-model="urls"></textarea>
        </div>
      </div>
      <div class="row">
        <div class="left">
          <label for="new-task-bt">BT / Metalink</label>
        </div>
        <div class="right pair">
          <label for="new-task-bt-choose" class="button fixed">Choose</label>
          <input id="new-task-bt-choose" class="hidden" type="file" accept=".torrent, .metalink" @change="readFile($event)">
          <input class="expanded" type="text" disabled v-model="filePath"></input>
        </div>
      </div>
      <div class="row">
        <div class="left">
          <label for="new-task-seeding">Seeding</label>
        </div>
        <div class="right">
          <input id="new-task-seeding" type="checkbox" v-model="seeding">
        </div>
      </div>
    </div>
    <div class="row vspace">
      <div class="button button-large" :class="{'disabled': !urls && !file}" @click="start()">Start</div>
      <div class="button button-large hspace" @click="cancel()">Cancel</div>
    </div>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        type: 'http',
        urls: '',
        file: undefined,
        filePath: '',
        seeding: true
      }
    },
    computed: {
      urlList: function () {
        return this.urls ? this.urls.split(/\n+/) : []
      }
    },
    methods: {
      readFile: function (event) {
        let files = event.target.files
        if (files.length) {
          let reader = new FileReader()
          reader.onload = (e) => {
            if (files[0].name.endsWith('.torrent') || files[0].name.endsWith('.metalink')) {
              this.file = e.target.result.replace(/^.*base64,/, '')
              this.filePath = files[0].path
              this.type = files[0].name.endsWith('.torrent') ? 'torrent' : 'metalink'
            }
          }
          reader.onerror = (error) => {
            console.error(error.message)
            this.file = undefined
            this.filePath = ''
          }
          reader.readAsDataURL(files[0])
        }
      },
      start: function () {
        this.$emit('addTask', {
          type: this.type,
          urls: this.urlList,
          file: this.file,
          seeding: this.seeding
        })
        this.$router.push('/downloads')
      },
      cancel: function () {
        this.$router.push('/downloads')
      }
    }
  }
</script>

<style lang="css" scoped>
  @import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
  @import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";
  @import "~@/styles/option.css";
</style>
