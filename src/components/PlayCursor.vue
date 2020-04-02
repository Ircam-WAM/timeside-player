<template>
  <rect
    ref="cursor"
    class="cursor"
    x="0"
    y="0"
    width="2"
    height="100%"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref, watch, watchEffect, computed } from '@vue/composition-api'
import { assertIsDefined } from '@/utils/type-assert'

import { useStore } from '@/store/index'
import { PlayState, Source } from '@/store/audio'

const hasWebAnimationAPI = () => {
  // Note: Some browsers may not support
  //       all the feature of the Web Animation API
  //       while validating this test
  const { animate } = window.document.body
  return !!animate
}

export default defineComponent({
  name: 'PlayCursor',
  setup () {
    const store = useStore()
    const cursor: Ref<Element | undefined> = ref()

    const keyFrames = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(100%)' }
    ]
    const timing = {
      duration: store.state.audio.duration,
      iterations: 1
    }

    onMounted(() => {
      assertIsDefined(cursor.value)

      if (!hasWebAnimationAPI) {
        console.error('Your browser do not support the Web Animation API')
        return
      }

      // Define animation and pause it
      const animation = cursor.value.animate(keyFrames, timing)
      animation.pause()

      watchEffect(() => {
        const currentTime = store.state.audio.currentTime
        // Disable this to limit cursor update
        // It improves animation performance and avoids flickering
        if (currentTime.source === Source.Output) {
          return
        }
        animation.currentTime = currentTime.value
      })

      const playState = computed(() => store.state.audio.playState)
      // Update cursor's animation when audio's play state is updated
      // Specifying playState as a first param avoids
      // running watch when store's currentTime is updated
      watch([ playState ], () => {
        animation.currentTime = store.state.audio.currentTime.value

        switch (playState.value) {
          case PlayState.Play:
            animation.play()
            break
          case PlayState.Pause:
            animation.pause()
            break
          case PlayState.Stop:
            animation.cancel()
            break
          default:
            console.error('Unknown PlayState', playState.value)
        }
      }, {
        flush: 'sync'
      })
    })

    return {
      cursor,
      duration: store.state.audio.duration
    }
  }
})
</script>

<style lang="less" scoped>
.cursor {
  fill: red;
}
</style>
