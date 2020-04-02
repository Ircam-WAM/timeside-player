<template>
  <div class="timer">
    current: {{ current }}
    total: {{ total }}
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref } from '@vue/composition-api'
import { useStore } from '@/store/index'

import { formatSeconds } from '@/utils/format-seconds'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  name: 'Timer',
  setup () {
    const store = useStore()

    const current: ComputedRef<string> = computed(() => {
      return formatSeconds(store.state.audio.currentTime.value / 1000)
    })

    const total: ComputedRef<string> = computed(() => {
      return formatSeconds(store.state.audio.duration / 1000)
    })

    return {
      current,
      total
    }
  }
})
</script>

<style lang="less" scoped>
</style>
