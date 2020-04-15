<template>
  <WaveformContainer
    class="maintrack"
    :item-id="itemId"
    @mousedown="onMouseDown"
  >
    <PlayCursor />
    <Region
      v-if="selection"
      v-model="selection"
    />
  </WaveformContainer>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch
} from '@vue/composition-api'

import { useStore } from '@/store/index'
import { PlayState, CurrentTimeSource } from '@/store/audio'
import { usePlayerRect } from '@/utils/use-player-rect'
import { assertIsDefined } from '@/utils/type-assert'
import useTrackHelpers from '@/utils/use-track-helpers'
import { Region as RegionType } from '@/types/region'

import PlayCursor from '@/components/PlayCursor.vue'
import Region from '@/components/Region.vue'
import WaveformContainer from '@/components/WaveformContainer.vue'

enum Direction {
  Left,
  Right,
}

export default defineComponent({
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  components: {
    WaveformContainer,
    PlayCursor,
    Region
  },
  setup (_, { emit }) {
    const store = useStore()
    const playerSize = usePlayerRect()
    // Have to be declared after providePlayerRect()
    const { positionToTime } = useTrackHelpers()

    const selection = ref<RegionType>()
    const lastClickPos = ref<number | undefined>(undefined)
    const direction = ref<Direction | undefined>(undefined)

    const onClick = ({ clientX, target }: MouseEvent) => {
      if (!target) {
        throw new Error(`target not found: ${target}`)
      }
      const { left, width } = playerSize.value
      const xPos = clientX - left
      const duration = store.state.audio.duration
      const currentTime = xPos / width * duration

      store.commit.audio.setCurrentTime({
        value: currentTime,
        source: CurrentTimeSource.Cursor
      })
    }

    const onMouseMove = ({ clientX }: MouseEvent) => {
      if (lastClickPos.value !== undefined) {
        if (clientX === lastClickPos.value) {
          return
        } else if (clientX > lastClickPos.value) {
          direction.value = Direction.Right
        } else if (clientX < lastClickPos.value) {
          direction.value = Direction.Left
        }

        const lastClickTime = positionToTime(lastClickPos.value - playerSize.value.left)

        // Create initial empty selection
        selection.value = {
          start: lastClickTime,
          stop: lastClickTime
        }

        lastClickPos.value = undefined
      } else {
        assertIsDefined(selection.value)
      }

      const posX = clientX - playerSize.value.left
      let timeX = positionToTime(posX)

      if (direction.value === Direction.Left) {
        if (timeX > selection.value.stop) {
          timeX = selection.value.stop
        }

        selection.value = {
          ...selection.value,
          start: timeX
        }
      } else if (direction.value === Direction.Right) {
        if (timeX < selection.value.start) {
          timeX = selection.value.start
        }

        selection.value = {
          ...selection.value,
          stop: timeX
        }
      } else {
        throw new Error(`Direction is not set (${direction.value}). Unexpected.`)
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      // If no mousemove happened, then it's a click
      if (lastClickPos.value !== undefined) {
        onClick(e)
      }
    }

    const onMouseDown = ({ clientX }: MouseEvent) => {
      lastClickPos.value = clientX

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        switch (store.state.audio.playState) {
          case PlayState.Play:
            store.commit.audio.setPlayState(PlayState.Pause)
            break
          case PlayState.Stop:
          case PlayState.Pause:
            store.commit.audio.setPlayState(PlayState.Play)
            break
          default:
            console.error('Unknown PlayState', store.state.audio.playState)
        }
      }
    }

    // Notify parent component that selection has changed
    watch([ selection ], () => emit('selection', selection.value))

    onMounted(() => { window.addEventListener('keydown', onKeyDown) })
    onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })

    return {
      onMouseDown,
      selection
    }
  }
})
</script>

<style lang="less" scoped>
.maintrack {
  cursor: text;
}
</style>
