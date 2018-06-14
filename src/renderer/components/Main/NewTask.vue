<template>
<div id="new-task">
  <div class="group">
    <div class="header">{{ $t("message.newTask.task") }}</div>
    <div class="row" v-if="!file">
      <div class="left">
        <label for="new-task-urls">{{ $t("message.newTask.urls") }}</label>
      </div>
      <div class="right">
        <textarea id="new-task-urls" v-model="uris"></textarea>
      </div>
    </div>
    <div class="row">
      <div class="left">
        <label for="new-task-bt">{{ $t("message.newTask.btMetalink") }}</label>
      </div>
      <div class="right pair">
        <label for="new-task-bt-choose" class="button fixed">{{ $t("message.newTask.choose") }}</label>
        <input id="new-task-bt-choose" class="hidden" type="file" accept=".torrent, .metalink, .meta4" @change="readFile($event)">
        <input class="expanded" type="text" disabled v-model="filename">
      </div>
    </div>
    <div class="row">
      <div class="left">
        <label for="new-task-seeding">{{ $t("message.newTask.seeding") }}</label>
      </div>
      <div class="right">
        <input id="new-task-seeding" type="checkbox" v-model="seeding">
      </div>
    </div>
  </div>
  <div class="row vspace">
    <div class="button button-large" :class="{'disabled': !uris && !file}" @click="start()">{{ $t("message.newTask.start") }}</div>
    <div class="button button-large hspace" @click="cancel()">{{ $t("message.newTask.cancel") }}</div>
  </div>
</div>
</template>

<script>
export default {
  data: function () {
    return {
      type: 'http',
      uris: '',
      file: undefined,
      filename: '',
      seeding: true
    }
  },
  computed: {
    urlList: function () {
      return this.uris ? this.uris.split(/\n+/) : []
    }
  },
  methods: {
    readFile: function (event) {
      let files = event.target.files
      if (files.length) {
        let reader = new FileReader()
        let that = this
        reader.onload = (e) => {
          if (files[0].name.endsWith('.torrent') || files[0].name.endsWith('.metalink') || files[0].name.endsWith('.meta4')) {
            that.file = e.target.result.replace(/^.*base64,/, '')
            that.filename = files[0].name
            that.type = files[0].name.endsWith('.torrent') ? 'torrent' : 'metalink'
          }
        }
        reader.onerror = (error) => {
          console.error(error.message)
          that.file = undefined
          that.filename = ''
        }
        reader.readAsDataURL(files[0])
      }
    },
    start: function () {
      this.$emit('addTask', {
        type: this.type,
        uris: this.urlList,
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

<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fa-solid.css" scoped></style>
<style lang="css" src="@fortawesome/fontawesome-free-webfonts/css/fontawesome.css" scoped></style>
<style lang="css" src="@/styles/option.css" scoped></style>
