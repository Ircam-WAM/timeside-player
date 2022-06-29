<template>
  <div class="app">
    <div id="header">
      <div id="header-left">
        <Icon id="header-icon" icon="fad:h-expand" :class="{ 'show': !isMenuOpen }" @click="isMenuOpen = !isMenuOpen" />
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
}

</style>
