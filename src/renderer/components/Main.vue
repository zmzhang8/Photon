<template>
  <div class="wrapper">
    <div class="sidebar">
      <router-link to="/downloads"><i class="fas fa-arrow-down"></i></router-link>
      <router-link to="/completes"><i class="fas fa-check"></i></router-link>
      <router-link to="/settings"><i class="fas fa-cog"></i></router-link>
    </div>

    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
</script>

<style lang="css">
@import "~@fortawesome/fontawesome-free-webfonts/css/fa-solid.css";
@import "~@fortawesome/fontawesome-free-webfonts/css/fontawesome.css";

.sidebar {
  min-width: 68px;
  max-width: 68px;
  min-height: 100%;
  max-height: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  color: #dddddd;
  background-color: #444444;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.sidebar > a {
  height: 68px;
  line-height: 68px;
  font-size: 36px;
  text-align: center;
  color: inherit;
}

.main {
  margin-left: 68px;
  font-size: 20px;
}
</style>
