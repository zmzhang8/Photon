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
    <div class="row" v-if="filesInTorrent.length">
      <div class="left"></div>
      <div class="right">
        <div class="scroll-div">
          <table>
            <thead>
              <th style="width: 20px">
                <input id="file-selection-all" type="checkbox" v-model="selectAll">
              </th>
              <th>{{ $t("message.newTask.filename") }}</th>
              <th style="width: 60px">{{ $t("message.newTask.filetype") }}</th>
              <th style="width: 60px">{{ $t("message.newTask.size") }}</th>
            </thead>
            <tbody v-for="file in filesInTorrent" :key="file.index">
              <td style="width: 20px">
                <input type="checkbox" v-model="file.selected">
              </td>
              <td>{{file.name}}</td>
              <td style="width: 60px">{{ file.extension }}</td>
              <td style="width: 60px">{{ bytesToString(file.size, 1) }}</td>
            </tbody>
          </table>
        </div>
        <div class="footnote">
          <div class="left">
            <a href="#" @click="selectVideos()">
              <i class="fas fa-file-video"></i>
            </a>
            <a href="#" @click="selectAudios()">
              <i class="fas fa-file-audio"></i>
            </a>
            <a href="#" @click="selectImages()">
              <i class="fas fa-file-image"></i>
            </a>
          </div>
          <div class="right">{{ selectedFilesCount }}/{{ allFilesCount }}, {{ bytesToString(selectedFilesSize, 1) }}/{{ bytesToString(allFilesSize, 1) }}</div>
        </div>
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
import parseTorrent from 'parse-torrent'
import Converter from '@/utils/converter.js'
import {imageExtensions, audioExtensions, videoExtensions} from '@/utils/filetypes.js'

export default {
  data: function () {
    return {
      type: 'http',
      uris: '',
      file: undefined,
      filename: '',
      seeding: true,
      filesInTorrent: []
    }
  },
  computed: {
    urlList: function () {
      return this.uris ? this.uris.split(/\n+/) : []
    },
    selectAll: {
      get: function () {
        return this.filesInTorrent && this.filesInTorrent.length > 0 && this.filesInTorrent.reduce((prev, cur) => {
          return prev && cur.selected
        }, true)
      },
      set: function () {
        let selection = !this.selectAll
        this.filesInTorrent.forEach(file => {
          file.selected = selection
        })
      }
    },
    selectedFiles: function () {
      return this.filesInTorrent.filter(file => {
        return file.selected
      })
    },
    selectedFilesCount: function () {
      return this.selectedFiles.length
    },
    selectedFilesSize: function () {
      return this.selectedFiles.reduce((prev, cur) => {
        return prev + cur.size
      }, 0)
    },
    allFilesCount: function () {
      return this.filesInTorrent.length
    },
    allFilesSize: function () {
      return this.filesInTorrent.reduce((prev, cur) => {
        return prev + cur.size
      }, 0)
    }
  },
  methods: {
    bytesToString: Converter.bytesToString,
    selectImages: function () {
      this.filesInTorrent.forEach(file => {
        file.selected = imageExtensions.includes('.' + file.extension)
      })
    },
    selectAudios: function () {
      this.filesInTorrent.forEach(file => {
        file.selected = audioExtensions.includes('.' + file.extension)
      })
    },
    selectVideos: function () {
      this.filesInTorrent.forEach(file => {
        file.selected = videoExtensions.includes('.' + file.extension)
      })
    },
    readFile: function (event) {
      let that = this
      let files = event.target.files
      if (files.length) {
        let file = files[0]
        that.filename = file
        if (file.name.endsWith('.torrent')) {
          that.type = 'torrent'
        } else if (file.name.endsWith('.metalink') || file.name.endsWith('.meta4')) {
          that.type = 'metalink'
        }
        if (that.type === 'torrent' || that.type === 'metalink') {
          let reader = new FileReader()
          reader.onload = (e) => {
            that.file = e.target.result.replace(/^.*base64,/, '')
            that.filename = file.name
          }
          reader.onerror = (error) => {
            console.error(error.message)
            that.file = undefined
            that.filename = ''
            that.type = 'http'
          }
          reader.readAsDataURL(file)

          if (that.type === 'torrent') {
            parseTorrent.remote(file, (err, parsedTorrent) => {
              if (err) {
                that.filesInTorrent = []
                console.error(err)
              } else {
                that.filesInTorrent = parsedTorrent.files.map((file, index) => {
                  return {
                    // aria2's select-file uses starting index 1
                    index: index + 1,
                    name: file.name,
                    extension: file.name.includes('.') ? file.name.split('.').pop() : '',
                    size: file.length,
                    selected: true
                  }
                })
              }
            })
          }
        }
      }
    },
    start: function () {
      if (this.type === 'torrent' && this.selectedFiles.length === 0) {
        return
      }
      let message = {
        type: this.type,
        uris: this.urlList,
        file: this.file,
        seeding: this.seeding
      }
      if (this.selectedFiles.length !== this.filesInTorrent.length) {
        message['selectfile'] = this.selectedFiles.map(file => {
          return file.index
        }).join(',')
      }
      this.$emit('addTask', message)
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
<style lang="css" scoped>
table {
  table-layout: fixed;
  width: 100%;
  text-align: left;
  margin: auto;
  font-size: 14px;
  color: #444;
}

th, td {
  padding: 4px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

th {
  position: sticky;
  top: 0;
  border-top: 1 solid #ddd;
  border-bottom: 1 solid #ddd;
  box-shadow: 0 1px #ddd;
  background:white;
}

.scroll-div {
  max-height: 55vh;
  overflow-y: auto;
  border: 1px solid #ddd;
}

.footnote {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 16px;
}

.footnote > .left {
  flex: 0 0 140px;
}

.footnote > .right {
  flex: 1 1 auto;
  text-align: right;
}

.footnote i {
  padding: 0 4px;
  color: #888;
  font-size: 20px;
}
</style>
