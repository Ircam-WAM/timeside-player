<template>
  <div class="timer">
    <span class="current" title="current time">{{ current }}</span>
    /
    <span class="total" title="total time">{{ total }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  watch,
  watchEffect
} from '@vue/composition-api'

import { PlayState, CurrentTimeSource } from '@/store/audio'
import { useStore } from '@/store/index'
import { formatSeconds } from '@/utils/format-seconds'

export default defineComponent({
  name: 'Timer',
  setup () {
    const store = useStore()
    const innerCount = ref(0)

    let intervalId: (number | undefined)
    const timeoutStep = 10

    const onInterval = () => {
      innerCount.value += timeoutStep
    }

    const startInterval = () => {
      intervalId = window.setInterval(onInterval, timeoutStep)
    }
    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      intervalId = undefined
    }

    // Update on playState
    const playState = computed(() => store.state.audio.playState)
    watch([ playState ], () => {
      innerCount.value = store.state.audio.currentTime.value

      switch (playState.value) {
        case PlayState.Play:
          startInterval()
          break
        case PlayState.Pause:
          stopInterval()
          break
        case PlayState.Stop:
          stopInterval()
          break
        default:
          console.error('Unknown PlayState', playState.value)
      }
    }, {
      flush: 'pre'
    })

    // Update on seek
    watchEffect(() => {
      const { value, source } = store.state.audio.currentTime

      // Improves animation performance and avoids flickering
      if (source !== CurrentTimeSource.Seek) {
        return
      }

      innerCount.value = value
    })

    const current = computed<string>(() => {
      return formatSeconds(innerCount.value / 1000)
    })

    const total = computed<string>(() => {
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
