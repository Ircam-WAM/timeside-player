<template>
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
      v-if="width > 40"
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
import { defineComponent, ref, computed, watch, PropType, toRefs } from '@vue/composition-api'
import { assertIsDefined } from '@/utils/type-assert'
import { Region as RegionType } from '@/types/region'
import { usePlayerRect } from '@/utils/use-player-rect'
import useTrackHelpers from '@/utils/use-track-helpers'

export default defineComponent({
  name: 'Region',
  props: {
    value: {
      type: Object as PropType<RegionType>,
      required: true
    }
  },
  setup (props, { emit }) {
    const { value: inputTime } = toRefs(props)
    const {
      positionToTime,
      timeToPosition
    } = useTrackHelpers()
    const el = ref<HTMLDivElement>()
    const start = ref(timeToPosition(inputTime.value.start))
    const stop = ref(timeToPosition(inputTime.value.stop))
    const width = computed(() => {
      return stop.value - start.value
    })
    const playerSize = usePlayerRect()

    // two-way data binding
    watch([ inputTime ], () => {
      start.value = timeToPosition(inputTime.value.start)
      stop.value = timeToPosition(inputTime.value.stop)
    })
    watch([ start, stop ], () => {
      emit('input', {
        start: positionToTime(start.value),
        stop: positionToTime(stop.value)
      })
    })

    const startResizeLeft = () => {
      const resize = ({ clientX }: MouseEvent) => {
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
      }

      window.addEventListener('mouseup', stopResize)
      window.addEventListener('mousemove', resize)
    }

    const startMove = ({ clientX: originalClientX }: MouseEvent) => {
      assertIsDefined(el.value)
      // position of the cursor inside the element
      const cursorOffsetLeft = (originalClientX - el.value.getBoundingClientRect().left)

      const move = ({ clientX }: MouseEvent) => {
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
      }

      window.addEventListener('mouseup', stopMove)
      window.addEventListener('mousemove', move)
    }

    const startResizeRight = () => {
      const resize = ({ clientX }: MouseEvent) => {
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
      }

      window.addEventListener('mouseup', stopResize)
      window.addEventListener('mousemove', resize)
    }

    const closeHandler = () => {
      emit('close')
    }

    return {
      el,
      width,
      start,
      stop,
      startMove,
      startResizeLeft,
      startResizeRight,
      closeHandler
    }
  }
})
</script>

<style lang="less" scoped>
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
