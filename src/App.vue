<template>
  <div class="app">
    <div id="header">
      <div id="header-left">
        <Icon id="header-icon" icon="fad:h-expand" :class="{ 'show': !isMenuOpen }" @click="isMenuOpen = !isMenuOpen" />
        <svg id="menu-close-icon" :class="{ 'show': isMenuOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" @click="isMenuOpen = !isMenuOpen"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z" /></svg>
        <div v-if="isMenuOpen" id="menu-container">
          <SelectItems />
          <SelectAPI />
          <button v-if="!isUnauthorized" class="logout" @click="logout">
            Logout
          </button>
        </div>
      </div>
      <div id="header-center">
        <h2 id="header-title">
          <a href="/#" />
        </h2>
      </div>
      <div v-if="!isUnauthorized" id="header-right">
        <PlayerControls />
      </div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, provide } from 'vue'
import { useApi, ItemList } from '@/utils/api'
import SelectAPI from '@/components/SelectAPI.vue'
import SelectItems from '@/components/SelectItems.vue'
import PlayerControls from '@/components/PlayerControls.vue'
import { createAudioStore, audioStoreKey } from '@/store/audio'

import { Icon } from '@iconify/vue'

export default defineComponent({
  name: 'App',
  components: {
    SelectAPI,
    SelectItems,
    Icon,
    PlayerControls
  },
  setup () {
    provide(audioStoreKey, createAudioStore())

    const { api } = useApi()
    const { persistentToken } = useApi()
    const error = ref<Response>()
    const items = ref<ItemList[]>()

    const isUnauthorized = computed(() => error.value?.status === 401 || false)

    const getItems = async () => {
      error.value = undefined
      try {
        items.value = await api.listItems({})
      } catch (e) {
        error.value = e
      }
    }

    onMounted(() => {
      getItems()
    })

    const isMenuOpen = ref(false)

    function logout () {
      persistentToken.removeToken()
      window.location.reload()
    }

    return {
      isUnauthorized,
      isMenuOpen,
      items,
      error,
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
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

#header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 1rem;
}

#header-center {
  align-items: center;
}

#header-right {
  text-align: right;
  align-items: center;
}

#header-title a {
  color: #2c3e50;
  text-decoration: none;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
}

#header-icon {
  width: 30px;
  height: 30px;
  display: none;
  background-color: #dcdcdc;
  box-shadow: 2px 2px 1px rgba(0,0,0,0.2);

  &:hover {
    cursor: pointer;
  }
}

#menu-close-icon {
  width: 25px;
  height: 25px;
  fill: #2c3e50;
  background-color: #dcdcdc;
  box-shadow: 2px 2px 1px rgba(0,0,0,0.2);
  display: none;

  &:hover {
    cursor: pointer;
  }
}

#menu-container {
  display: flex;
  flex-direction: column;
  justify-items: flex-start;
  align-items: flex-start;
  background-color: #dcdcdc;
  box-shadow: 2px 2px 1px rgba(0,0,0,0.2);
  width: 200px;
  max-width: 100%;
  margin-top: 10px;
  padding: 10px;
}

.logout {
  box-shadow: 1px 1px 1px rgba(0,0,0,0.2);
}

.logout:hover {
  cursor: pointer;
}
</style>
