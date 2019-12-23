<template>
  <div id="app">
    <h1>Welcome to timeside-player</h1>
    <Player />
  </div>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'
import Player from '@/components/Player.vue'

export default createComponent({
  name: 'App',
  components: {
    Player
  }
})
</script>

<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
