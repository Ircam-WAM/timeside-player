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
    </div>

    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useToasted } from '@/utils/vue-toasted'
import SelectAPI from '@/components/SelectAPI.vue'
import List from '@/components/List.vue'

export default defineComponent({
  name: 'App',
  components: {
    List,
    SelectAPI
  },
  setup () {
    const toasted = useToasted()
    toasted.success('🎉 Welcome to timeside-player !')
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
