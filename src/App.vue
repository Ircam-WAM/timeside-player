<template>
  <div class="app">
    <div id="header">
      <div id="header-left">
        <Icon id="header-icon" icon="fad:h-expand" :class="{ 'show': !isMenuOpen }" @click="isMenuOpen = !isMenuOpen" />
        <svg id="menu-close-icon" :class="{ 'show': isMenuOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" @click="isMenuOpen = !isMenuOpen"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z" /></svg>
      </div>
      <div id="header-center">
        <h2>TimeSide Player</h2>
      </div>
      <div id="header-right">
        <SelectAPI />
        <button class="logout" @click="logout">
          Logout
        </button>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useApi } from '@/utils/api'
import SelectAPI from '@/components/SelectAPI.vue'

export default defineComponent({
  name: 'App',
  components: {
    SelectAPI
  },
  setup () {
    const { persistentToken } = useApi()

    function logout () {
      persistentToken.removeToken()
      window.location.reload()
    }

    return {
      logout
    }
  }
})
</script>

<style lang="less" scoped>
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0rem;
  margin-left: 3rem;
  margin-right: 1rem;
}

.app ::v-deep(*, *::before, *::after) {
  box-sizing: border-box;
}

#header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 5px;
  grid-auto-rows: minmax(50px, auto);
  vertical-align: middle;
  margin: auto;
}

#header-left {
  display: flex;
  align-items: center;
}

#header-center {
  align-items: center;
}

#header-right {
  text-align: right;
  align-items: center;
}

.header-icon {
  width: 25px;
#menu-close-icon {
  width: 30px;
  height: 30px;
  fill: #2c3e50;
  display: none;

  &:hover {
    cursor: pointer;
  }
}

</style>
