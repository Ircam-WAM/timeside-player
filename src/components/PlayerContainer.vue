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
        {{ error }}
      </div>
      <div v-else-if="!itemDetail">
        Item not found
      </div>
      <Player
        v-else
        :item="itemDetail"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  onUnmounted
} from '@vue/composition-api'

import { Item } from '@/utils/api'
import { useStore } from '@/store/index'

import { formatResponseError } from '@/utils/response-error'

import Login from '@/components/Login.vue'
import Player from '@/components/Player.vue'

export default defineComponent({
  name: 'PlayerContainer',
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  components: {
    Player,
    Login
  },
  setup ({ itemId }) {
    const store = useStore()
    if (!itemId) {
      throw new Error('item has no valid ID')
    }

    // We need to retrieve the item as Item do not provide enough data
    const retrieveItem = () => { store.dispatch.items.retrieveItem(itemId) }

    const error = computed<string | undefined>(() => {
      const err = store.getters.items.getErrorById(itemId)
      if (!err) {
        return undefined
      }
      return formatResponseError(err)
    })
    const isLoading = computed<boolean>(() => {
      return store.getters.items.isLoading(itemId)
    })
    const isUnauthorized = computed<boolean>(() => {
      return store.getters.items.isUnauthorized(itemId)
    })
    const itemDetail = computed<Item | undefined>(() => {
      return store.getters.items.getItemById(itemId)
    })

    onMounted(() => retrieveItem())

    const onLogin = () => { retrieveItem() }

    // Reset audio state for player re-use
    onUnmounted(() => store.commit.audio.resetState())

    return {
      error,
      isLoading,
      isUnauthorized,
      itemDetail,
      onLogin
    }
  }
})
</script>

<style lang="less" scoped>
</style>
