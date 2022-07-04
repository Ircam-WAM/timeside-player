<template>
  <div>
    <div
      v-if="isLoading"
      class="loading"
    >
      Loading...
    </div>
    <template v-else>
      <div
        v-if="!isUnauthorized"
        class="items"
      >
        <select
          v-model="key"
          class="select-items"
          @change="updateUrl"
        >
          <option value="" disabled selected hidden>
            Choose an item
          </option>
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

import { useApi, ItemList } from '@/utils/api'
import { formatResponseError } from '@/utils/response-error'

import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'SelectItems',
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

    const router = useRouter()

    function updateUrl (e: Event) {
      const itemUrl = (<HTMLSelectElement>e.currentTarget).value

      window.location.href = '#/'

      setTimeout(() => {
        router.push({ name: 'item', params: { id: itemUrl } }).then(() => {
          window.location.reload()
        })
      }, 1000)
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
.items {
  width: 150px;

  .select-items {
    width: 150px;
  }
}
.select-items {
  width: 150px;
  max-width: 150px;
  margin-bottom: 20px;
  box-shadow: 1px 1px 1px rgba(0,0,0,0.2);

  option {
    width: 150px;
    max-width: 150px;
    overflow: hidden;

    a {
      width: 150px;
      max-width: 150px;
    }
  }
}

select {
  width: 10px;
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

.loading {
  margin-bottom: 10px;
}

.error {
  color: red;
}
</style>
