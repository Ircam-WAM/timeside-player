<template>
  <div>
    <div
      v-if="isLoading"
      class="loading"
    >
      Loading...
    </div>
    <template v-else>
      <!-- <div v-if="isUnauthorized">
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
      </div> -->
      <div
        v-if="!isUnauthorized"
        class="items"
      >
        <select
          v-model="key"
          class="select-items"
          @change="updateUrl"
        >
          <option
            v-for="item of items"
            :key="item.uuid"
            :value="item.uuid"
          >
            <router-link
              :key="item.uuid"
              :to="{ name: 'item', params: { id: item.uuid } }"
            >
              {{ item.title }}
            </router-link>
          </option>
        </select>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue'

// import Login from '@/components/Login.vue'

import { useApi, ItemList } from '@/utils/api'
import { formatResponseError } from '@/utils/response-error'

import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'SelectItems',
  components: {
    // Login
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
        // console.log(items.value)
      } catch (e) {
        error.value = e
      } finally {
        isLoading.value = false
      }
    }

    const router = useRouter()

    function updateUrl (e: Event) {
      const itemUrl = e.currentTarget?.value

      window.location.href = '#/'

      setTimeout(() => { router.push({ name: 'item', params: { id: itemUrl } }) }, 1000)
    }

    onMounted(() => {
      getItems()
    })

    // const onLogin = () => { getItems() }

    return {
      isLoading,
      isUnauthorized,
      items,
      error,
      formatResponseError,
      // onLogin,
      updateUrl
    }
  },
  data () {
    return { key: '' }
  }
})
</script>

<style lang="less" scoped>
.select-items {
  margin-bottom: 20px;
}

.items {
  & > * {
    display: block;
    text-align: left;
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
