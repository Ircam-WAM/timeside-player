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
        <Login class="login" @success="onLogin" />
      </div>
      <div
        v-else-if="error"
        class="error"
      >
        {{ error }}
      </div>
      <div v-else-if="!itemList">
        This should not happen: no error, no loading but itemList is undefined
      </div>
      <div
        v-else
        class="items"
      >
        <router-link
          v-for="item of itemList"
          :key="item.uuid"
          :to="{ name: 'item', params: { id: item.uuid } }"
        >
          {{ item.title }} <span class="description">{{ item.description }}</span>
        </router-link>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { loginUrl } from '@/utils/api'
import { defineComponent, computed, onMounted } from '@vue/composition-api'
import { useStore } from '@/store/index'

import Player from '@/components/Player.vue'
import Login from '@/components/Login.vue'

import { formatResponseError } from '@/utils/response-error'

export default defineComponent({
  name: 'List',
  props: {
  },
  components: {
    Player,
    Login
  },
  setup () {
    const store = useStore()
    const itemList = computed(() => store.state.itemList.itemList)
    const isLoading = computed(() => store.getters.itemList.isLoading)
    const isUnauthorized = computed(() => store.getters.itemList.isUnauthorized)
    const error = computed(() => {
      const err = store.state.itemList.error
      if (!err) {
        return undefined
      }
      return formatResponseError(err)
    })

    const getItems = async () => { await store.dispatch.itemList.getItems() }

    onMounted(() => { getItems() })
    const onLogin = () => { getItems() }

    return {
      isLoading,
      isUnauthorized,
      itemList,
      error,
      loginUrl,
      onLogin
    }
  }
})
</script>

<style lang="less">
.items {
  & > * {
    display: block;
  }
}

.description {
  font-size: 12px;
  color: grey;
}

.error {
  color: red;
}
</style>
