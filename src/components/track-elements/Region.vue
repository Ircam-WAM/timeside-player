<template>
  <!--
    Use stop event modifiers to skip event handlers of InteractivePlayCursor
    We may remove them and make InteractivePlayCursor check event.target
  -->
  <g>
    <rect
      v-if="start"
      class="delimiter left"
      :x="start - 4"
      y="0"
      height="100%"
      @mousedown.stop="startResizeLeft"
    />
    <rect
      v-if="width"
      ref="el"
      class="content"
      :x="start"
      y="0"
      height="100%"
      :width="width"
      @mousedown.stop="startMove"
    />
    <rect
      v-if="stop"
      class="delimiter right"
      :x="stop"
      y="0"
      height="100%"
      @mousedown.stop="startResizeRight"
    />
    <svg
      v-if="stop && width && width > 40"
      :x="stop - 40"
      :y="0"
      width="40"
      height="40"
      viewBox="0 0 512 512"
      class="close"
      @mousedown.stop="closeHandler"
    >
      <!-- Use an empty rect so click event is on the whole svg -->
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="transparent"
      />
      <!-- center -->
      <g transform="scale(0.5) translate(256 256)">
        <path
          d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"
        />
      </g>
    </svg>
  </g>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  PropType,
  inject,
  onMounted,
  onUnmounted,
  watchEffect
} from '@vue/composition-api'
import { assertIsDefined } from '@/utils/type-assert'
import { Region as RegionType } from '@/types/region'
import { usePlayerRect } from '@/utils/use-player-rect'
import useTrackHelpers from '@/utils/use-track-helpers'

import { slotContainerKey } from '@/components/track-elements/TrackPluginsContainer.vue'

enum Direction {
  Left,
  Right,
}

export default defineComponent({
  name: 'Region',
  props: {
    value: {
      type: Object as PropType<RegionType>,
      required: false
    }
  },
  setup (props, { emit }) {
    const parentContainer = inject(slotContainerKey)
    if (!parentContainer) {
      throw new Error('Region.vue expects to be a child of TrackPluginsContainer.vue')
    }

    const {
      positionToTime,
      timeToPosition
    } = useTrackHelpers()
    const el = ref<HTMLDivElement>()
    const start = ref<number>()
    const stop = ref<number>()
    const width = computed(() => {
      if (start.value === undefined || stop.value === undefined) {
        return undefined
      }
      return stop.value - start.value
    })
    const playerSize = usePlayerRect()

    const setPosition = (input?: RegionType) => {
      if (!input) {
        return
      }
      start.value = timeToPosition(input.start)
      stop.value = timeToPosition(input.stop)
    }

    // one-way data binding
    watch(() => props.value, (input) => setPosition(input))

    // Recompute absolute coordinates from time values
    // when a resize occurs
    watch(playerSize, () => setPosition(props.value))

    // manually notify parent of the changes
    // instead of watch start/stop
    // in order to optimize performances
    const notifyParent = () => {
      if (start.value === undefined || stop.value === undefined) {
        emit('input', undefined)
        return
      }
      const newVal = {
        start: positionToTime(start.value),
        stop: positionToTime(stop.value)
      }
      if (props.value === undefined) {
        emit('input', newVal)
        return
      }
      if (props.value.start === newVal.start &&
          props.value.stop === newVal.stop) {
        // Do nothing
        return
      }
      emit('input', newVal)
    }

    const closeHandler = () => {
      start.value = undefined
      stop.value = undefined
      notifyParent()
    }

    const startCreate = ({ clientX: startClientX }: MouseEvent) => {
      const moveCreate = ({ clientX }: MouseEvent) => {
        let direction: Direction | undefined

        if (clientX === startClientX) {
          return
        } else if (clientX > startClientX) {
          direction = Direction.Right
        } else if (clientX < startClientX) {
          direction = Direction.Left
        }

        start.value = startClientX - playerSize.value.left
        stop.value = startClientX - playerSize.value.left

        let posX = clientX - playerSize.value.left

        if (direction === Direction.Left) {
          if (posX < 0) {
            posX = 0
          }
          if (posX > stop.value) {
            posX = stop.value
          }

          start.value = posX
        } else if (direction === Direction.Right) {
          if (posX > playerSize.value.width) {
            posX = playerSize.value.width
          }
          if (posX < start.value) {
            posX = start.value
          }

          stop.value = posX
        } else {
          throw new Error(`Direction is not set (${direction}). Unexpected.`)
        }
      }

      const stopCreate = () => {
        notifyParent()
        window.removeEventListener('mousemove', moveCreate)
        window.removeEventListener('mouseup', stopCreate)
      }

      window.addEventListener('mousemove', moveCreate)
      window.addEventListener('mouseup', stopCreate)
    }

    // Set listeners for startCreate
    onMounted(() => watchEffect(() => {
      if (!parentContainer.value) {
        console.warn('Unexpected value (Region.vue): ', parentContainer.value)
        return
      }
      // Remove previous in case value changed
      parentContainer.value.removeEventListener('mousedown', startCreate)
      parentContainer.value.addEventListener('mousedown', startCreate)
    }))

    onUnmounted(() => {
      if (!parentContainer.value) {
        return
      }
      parentContainer.value.removeEventListener('mousedown', startCreate)
    })

    const startResizeLeft = () => {
      const resize = ({ clientX }: MouseEvent) => {
        assertIsDefined(stop.value)
        let value = clientX - playerSize.value.left
        if (value < 0) {
          value = 0
        }
        if (value > stop.value) {
          value = stop.value
        }
        start.value = value
      }

      const stopResize = () => {
        window.removeEventListener('mouseup', stopResize)
        window.removeEventListener('mousemove', resize)
        notifyParent()
      }

      window.addEventListener('mouseup', stopResize)
      window.addEventListener('mousemove', resize)
    }

    const startMove = ({ clientX: originalClientX }: MouseEvent) => {
      assertIsDefined(el.value)
      // position of the cursor inside the element
      const cursorOffsetLeft = (originalClientX - el.value.getBoundingClientRect().left)

      const move = ({ clientX }: MouseEvent) => {
        assertIsDefined(width.value)
        let newStart = clientX - cursorOffsetLeft - playerSize.value.left
        let newEnd = newStart + width.value
        if (newStart <= 0) {
          newStart = 0
          newEnd = newStart + width.value
        }
        if (newEnd >= playerSize.value.width) {
          newEnd = playerSize.value.width
          newStart = newEnd - width.value
        }
        start.value = newStart
        stop.value = newEnd
      }

      const stopMove = () => {
        window.removeEventListener('mouseup', stopMove)
        window.removeEventListener('mousemove', move)
        notifyParent()
      }

      window.addEventListener('mouseup', stopMove)
      window.addEventListener('mousemove', move)
    }

    const startResizeRight = () => {
      const resize = ({ clientX }: MouseEvent) => {
        assertIsDefined(start.value)
        let value = clientX - playerSize.value.left
        if (value > playerSize.value.width) {
          value = playerSize.value.width
        }
        if (value < start.value) {
          value = start.value
        }
        stop.value = value
      }

      const stopResize = () => {
        window.removeEventListener('mouseup', stopResize)
        window.removeEventListener('mousemove', resize)
        notifyParent()
      }

      window.addEventListener('mouseup', stopResize)
      window.addEventListener('mousemove', resize)
    }

    return {
      el,
      width,
      start,
      stop,
      startCreate,
      startMove,
      startResizeLeft,
      startResizeRight,
      closeHandler
    }
  }
})
</script>

<style lang="less" scoped>
rect {
  // Fix offset. Default value is 1px
  // Without this, rect element with `height: 100%`
  // would have a height of `100% + 1px`
  stroke-width: 0;
}

.delimiter {
  width: 4px;

  &.left {
    padding-left: 5px;
    cursor: w-resize;
  }
  &.right {
    padding-right: 5px;
    cursor: e-resize;
  }
}

.content {
  cursor: grab;
  fill: rgba(255, 0, 0, 0.5);
}

.close {
  cursor: pointer;
}
</style>
