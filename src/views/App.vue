<template>
  <div class="app-view">
    <div
      v-if="isLoading"
      class="loading"
    >
      Loading...
    </div>
    <template v-else>
      <div v-if="isUnauthorized">
        <Login class="login" @success="onLogin" />
      </div>
      <div
        v-else-if="error"
        class="error"
      >
        {{ formatResponseError(error) }}
      </div>
      <div v-else-if="!items">
        This should not happen: no error, no loading but items is undefined
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue'

import Login from '@/components/Login.vue'

import { useApi, ItemList } from '@/utils/api'
import { formatResponseError } from '@/utils/response-error'

export default defineComponent({
  name: 'App',
  components: {
    Login
  },
  setup () {
    const { api } = useApi()
    const isLoading = ref(false)
    const error = ref<Response>()
    const items = ref<ItemList[]>()

    const isUnauthorized = computed(() => error.value?.status === 401 || false)

    const getItems = async () => {
      isLoading.value = true
      error.value = undefined
      try {
        items.value = await api.listItems({})
      } catch (e) {
        error.value = e
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => { getItems() })
    const onLogin = () => { getItems() }

    return {
      isLoading,
      isUnauthorized,
      items,
      error,
      formatResponseError,
      onLogin
    }
  }
})
</script>

<style lang="less" scoped>
.error {
  color: red;
}
</style>
