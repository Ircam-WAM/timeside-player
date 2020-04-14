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
        You do not seems to be logged in. You can log in on
        <a
          :href="loginUrl"
          target="_blank"
          rel="noopener"
        >Wasabi</a>
        and reload this page
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
      <div v-else>
        <div class="item-metadata">
          <div class="title">
            <b>title</b>: {{ itemDetail.title }}
          </div>
          <div class="description">
            <b>description</b>: {{ itemDetail.description }}
          </div>
          <div class="uuid">
            <b>uuid</b>: {{ itemDetail.uuid }}
          </div>
        </div>
        <Player :item="itemDetail" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, computed, onUnmounted } from '@vue/composition-api'
import { Item, loginUrl } from '@/utils/api'
import { useStore } from '@/store/index'

import { formatResponseError } from '@/utils/response-error'

import Player from '@/components/Player.vue'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  name: 'PlayerContainer',
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  components: {
    Player
  },
  setup ({ itemId }) {
    const store = useStore()
    if (!itemId) {
      throw new Error('item has no valid ID')
    }

    // We need to retrieve the item as Item do not provide enough data
    store.dispatch.items.retrieveItem(itemId)
    const error: ComputedRef<string | undefined> = computed(() => {
      const err = store.getters.items.getErrorById(itemId)
      if (!err) {
        return undefined
      }
      return formatResponseError(err)
    })
    const isLoading: ComputedRef<boolean> = computed(() => {
      return store.getters.items.isLoading(itemId)
    })
    const isUnauthorized: ComputedRef<boolean> = computed(() => {
      return store.getters.items.isUnauthorized(itemId)
    })
    const itemDetail: ComputedRef<Item | undefined> = computed(() => {
      return store.getters.items.getItemById(itemId)
    })

    // Reset audio state for player re-use
    onUnmounted(() => store.commit.audio.resetState())

    return {
      error,
      loginUrl,
      isLoading,
      isUnauthorized,
      itemDetail
    }
  }
})
</script>

<style lang="less" scoped>
</style>
