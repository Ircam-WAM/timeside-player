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
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  Ref,
  watch,
  watchEffect,
  computed,
  inject
} from '@vue/composition-api'

import { assertIsDefined } from '@/utils/type-assert'
import { usePlayerRect } from '@/utils/use-player-rect'
import useTrackHelpers from '@/utils/use-track-helpers'

import { useStore } from '@/store/index'
import { PlayState, CurrentTimeSource } from '@/store/audio'

import { slotContainerKey } from '@/components/Waveform.vue'

// Polyfill Web Animation API
// import 'web-animations-js'

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
    const playerSize = usePlayerRect()
    const { positionToTime } = useTrackHelpers()

    const parentContainer = inject(slotContainerKey)
    if (!parentContainer) {
      throw new Error('Region.vue expects to be a child of Waveform.vue')
    }

    const onClick = (e: MouseEvent) => {
      const { clientX, target } = e
      if (!target) {
        throw new Error(`target not found: ${target}`)
      }
      const currentTime = positionToTime(clientX - playerSize.value.left)

      store.commit.audio.setCurrentTime({
        value: currentTime,
        source: CurrentTimeSource.Cursor
      })
    }

    // Use mouseup/mousedown to detect if mouse has moved during the click
    // If yes, the event will be handled by Region.vue
    // See https://stackoverflow.com/a/16972807
    let tmpClientX: number | undefined
    const onMousedown = (e: MouseEvent) => {
      tmpClientX = e.clientX
    }
    const onMouseup = (e: MouseEvent) => {
      if (tmpClientX === undefined) {
        return
      }
      // The mouse has moved, don't handle it
      if (tmpClientX !== undefined && tmpClientX !== e.clientX) {
        return
      }
      tmpClientX = undefined
      onClick(e)
    }

    // Set listeners for onClick
    onMounted(() => watchEffect(() => {
      if (!parentContainer.value) {
        console.warn('Unexpected value (PlayCursor.vue): ', parentContainer.value)
        return
      }
      // Remove previous in case value changed
      parentContainer.value.removeEventListener('mousedown', onMousedown)
      parentContainer.value.removeEventListener('mouseup', onMouseup)

      parentContainer.value.addEventListener('mousedown', onMousedown)
      parentContainer.value.addEventListener('mouseup', onMouseup)
    }))

    onUnmounted(() => {
      if (!parentContainer.value) {
        return
      }
      parentContainer.value.removeEventListener('mousedown', onMousedown)
      parentContainer.value.removeEventListener('mouseup', onMouseup)
    })

    const keyFrames = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(100%)' }
    ]
    const timing = {
      duration: store.state.audio.duration,
      iterations: 1
    }

    function setAnimationPlayState (animation: Animation, playState: PlayState) {
      switch (playState) {
        case PlayState.Play:
          animation.play()
          break
        case PlayState.Pause:
          animation.pause()
          break
        case PlayState.Stop:
          animation.currentTime = 0
          animation.pause()
          break
        default:
          console.error('Unknown PlayState', playState)
      }
    }

    onMounted(async () => {
      assertIsDefined(cursor.value)

      if (!hasWebAnimationAPI) {
        console.error('Your browser do not support the Web Animation API. Downloading polyfill..')
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        await import('web-animations-js')
      }

      // Define animation and pause it
      const animation = cursor.value.animate(keyFrames, timing)
      animation.pause()

      // Update cursor's animation when audio's play state is updated
      // Specifying playState as a first param avoids
      // running watch when store's currentTime is updated
      const playState = computed(() => store.state.audio.playState)
      watch([ playState ], () => {
        animation.currentTime = store.state.audio.currentTime.value
        setAnimationPlayState(animation, playState.value)
      }, {
        flush: 'sync'
      })

      // Update on seek
      watchEffect(() => {
        const { value, source } = store.state.audio.currentTime
        // Improves animation performance and avoids flickering
        if (source !== CurrentTimeSource.Seek) {
          return
        }
        animation.currentTime = value
      })

      watchEffect(() => {
        animation.playbackRate = store.state.audio.playbackRate
      })
    })

    return {
      cursor,
      duration: store.state.audio.duration,
      onClick
    }
  }
})
</script>

<style lang="less" scoped>
.cursor {
  fill: red;
}
</style>
