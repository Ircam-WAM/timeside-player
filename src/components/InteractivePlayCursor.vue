<template>
  <PlayCursor />
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  watchEffect
} from '@vue/composition-api'

import PlayCursor from '@/components/PlayCursor.vue'

import { useStore } from '@/store/index'
import { CurrentTimeSource } from '@/store/audio'
import { usePlayerRect } from '@/utils/use-player-rect'
import useTrackHelpers from '@/utils/use-track-helpers'

import { slotContainerKey } from '@/components/Waveform.vue'

export default defineComponent({
  components: {
    PlayCursor
  },
  setup () {
    const store = useStore()
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
  }
})
</script>

<style lang="less" scoped>
</style>
