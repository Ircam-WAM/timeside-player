<template>
  <div>
    <div
      v-if="isLoading"
      class="loading"
    >
      Loading...
    </div>
    <template v-else>
      <div v-if="isUnauthorized">
        <Login @success="onLogin" />
      </div>
      <div
        v-else-if="error"
        class="error"
      >
        {{ formatResponseError(error) }}
      </div>
      <div v-else-if="!item">
        Item not found
      </div>
      <Player
        v-else
        :item="item"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  ref
} from 'vue'

import { useApi, Item } from '@/utils/api'
import { formatResponseError } from '@/utils/response-error'

import Login from '@/components/Login.vue'
import Player from '@/components/Player.vue'

export default defineComponent({
  name: 'PlayerContainer',
  components: {
    Player,
    Login
  },
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  setup (props) {
    if (!props.itemId) {
      throw new Error('item has no valid ID')
    }
    const { api } = useApi()

    const item = ref<Item>()
    const isLoading = ref(false)
    const error = ref<Response>()
    const isUnauthorized = computed(() => error.value?.status === 401 || false)

    // We need to retrieve the item as Item do not provide enough data
    const retrieveItem = async () => {
      isLoading.value = true
      error.value = undefined
      try {
        item.value = await api.retrieveItem({ uuid: props.itemId }) as Item
      } catch (err) {
        error.value = err
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => retrieveItem())
    const onLogin = () => { retrieveItem() }

    return {
      error,
      formatResponseError,
      isLoading,
      isUnauthorized,
      item,
      onLogin
    }
  }
})
</script>

<style lang="less" scoped>
</style>
