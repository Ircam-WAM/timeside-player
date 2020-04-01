<template>
  <select
    v-model="apiUrl"
    class="select-api"
  >
    <option
      v-for="o of urls"
      :key="o"
      :value="o"
    >
      {{ prettyPrint(o) }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from '@vue/composition-api'
import { baseUrls } from '@/utils/api'

export default defineComponent({
  name: 'SelectAPI',
  setup () {
    const apiUrl = ref(localStorage.getItem('api-url') || baseUrls[0])

    watchEffect(() => {
      if (localStorage.getItem('api-url') === apiUrl.value) {
        return
      }

      localStorage.setItem('api-url', apiUrl.value)
      document.location.reload(false)
    })

    const prettyPrint = (str: string) => {
      try {
        const url = new URL(str)
        return url.hostname
      } catch (e) {
        return str
      }
    }

    return {
      apiUrl,
      urls: baseUrls,
      prettyPrint
    }
  }
})
</script>

<style lang="less" scoped>
.select-api {
  margin: 20px;
}
</style>
