<template>
  <rect
    ref="cursor"
    class="cursor"
    x="0"
    y="0"
    :width="cursorWidth"
    height="100%"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  Ref,
  watch,
  watchEffect,
  computed,
  PropType
} from 'vue'

import { assertIsDefined } from '@/utils/type-assert'

import { useAudioStore, PlayState, CurrentTimeSource } from '@/store/audio'

import { Region as RegionType } from '@/types/region'

export default defineComponent({
  name: 'PlayCursor',
  props: {
    selection: {
      type: Object as PropType<RegionType>,
      default: undefined
    }
  },
  setup (props) {
    const store = useAudioStore()
    const cursorWidth = 2
    const cursor: Ref<Element | undefined> = ref()

    const keyFrames = [
      { transform: 'translateX(0)' },
      { transform: `translateX(calc(100% - ${cursorWidth}px))` }
    ]

    const timing = computed<AnimationEffectTiming>(() => {
      if (props.selection) {
        const { start, stop } = props.selection
        return {
          duration: stop - start,
          delay: start,
          endDelay: store.state.duration - stop,
          iterations: 1
        }
      } else {
        return {
          duration: store.state.duration,
          // Need to explicit set delay / endDelay to avoid cursor offset when adding/removing selection
          delay: 0,
          endDelay: 0,
          iterations: 1,
          // Keep cursor at the end when the animation is finished
          fill: 'forwards'
        }
      }
    })

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
      // Define animation and pause it
      const animation = cursor.value.animate(keyFrames, timing.value)
      animation.pause()

      // Update cursor's animation when audio's play state is updated
      // Specifying playState as a first param avoids
      // running watch when store's currentTime is updated
      const playState = computed(() => store.state.playState)
      watch([ playState ], () => {
        animation.currentTime = store.state.currentTime.value
        setAnimationPlayState(animation, playState.value)
      }, {
        flush: 'sync',
        immediate: true
      })

      // Update on seek
      watchEffect(() => {
        const { value, source } = store.state.currentTime
        // Improves animation performance and avoids flickering
        if (source !== CurrentTimeSource.Seek) {
          return
        }
        animation.currentTime = value
      })

      // Update timing when updated
      watchEffect(() => {
        assertIsDefined(animation.effect)
        animation.effect.updateTiming(timing.value)
      })

      // Update playbackRate of animation when audio is updated
      watchEffect(() => {
        animation.playbackRate = store.state.playbackRate
      })
    })

    return {
      cursorWidth,
      cursor,
      duration: store.state.duration
    }
  }
})
</script>

<style lang="less" scoped>
.cursor {
  fill: red;
  /* Hides the element when the animation is in a delayed state */
  transform: translateX(-100%);
  position: relative;
  z-index: 1;

  // Fix offset. Default value is 1px
  // Without this, rect element with `height: 100%`
  // would have a height of `100% + 1px`
  stroke-width: 0;
}
</style>
