<template>
<div id="app">
  <router-view
    :manager="manager"
    :isDesktop="true">
  </router-view>
</div>
</template>

<script>
export default {
  name: 'photon',
  props: ['manager']
}
</script>

<style lang="css">
body {
  margin: 0px;
  background-color: #fff;
  font-family: "Helvetica Neue", Helvetica, Arial, "Dejavu Sans", "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", "Noto Sans", sans-serif;
}

input, output, textarea, select, button {
  font-family: "Helvetica Neue", Helvetica, Arial, "Dejavu Sans", "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", "Noto Sans", sans-serif;
}
</style>
