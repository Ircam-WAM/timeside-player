<template>
  <div id="app">
    <div class="header">
      <h1>Welcome to timeside-player</h1>
      <router-link
        :to="{ name: 'list' }"
      >
        Home
      </router-link>
      <SelectAPI />
      <button class="logout" @click="logout">
        Logout
      </button>
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
      window.location.reload(false)
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
  margin-top: 50px;
  margin-left: 50px;
}

#app ::v-deep(*, *::before, *::after) {
  box-sizing: border-box;
}
</style>
