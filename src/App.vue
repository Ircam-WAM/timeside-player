<template>
  <div id="app">
    <div id="header">
      <div id="header-left">
        <router-link
          :to="{ name: 'list' }"
        >
          <svg version="1.1" class="header-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 95.95" style="enable-background:new 0 0 122.88 95.95" xml:space="preserve"><g><path class="st0" d="M8.94,0h105c4.92,0,8.94,4.02,8.94,8.94l0,0c0,4.92-4.02,8.94-8.94,8.94h-105C4.02,17.88,0,13.86,0,8.94l0,0 C0,4.02,4.02,0,8.94,0L8.94,0z M8.94,78.07h105c4.92,0,8.94,4.02,8.94,8.94l0,0c0,4.92-4.02,8.94-8.94,8.94h-105 C4.02,95.95,0,91.93,0,87.01l0,0C0,82.09,4.02,78.07,8.94,78.07L8.94,78.07z M8.94,39.03h105c4.92,0,8.94,4.02,8.94,8.94l0,0 c0,4.92-4.02,8.94-8.94,8.94h-105C4.02,56.91,0,52.89,0,47.97l0,0C0,43.06,4.02,39.03,8.94,39.03L8.94,39.03z" /></g></svg>
        </router-link>
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
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0rem;
  margin-left: 3rem;
  margin-right: 1rem;
}

#app ::v-deep(*, *::before, *::after) {
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
}

</style>
