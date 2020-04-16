<template>
  <g>
    <rect
      v-if="start"
      class="delimiter left"
      :x="start - 4"
      y="0"
      height="100%"
      @mousedown.stop="startResizeLeft"
      @click.stop
    />
    <rect
      ref="el"
      class="content"
      :x="start"
      y="0"
      height="100%"
      :width="width"
      @mousedown.stop="startMove"
      @click.stop
    />
    <rect
      v-if="stop"
      class="delimiter right"
      :x="stop"
      y="0"
      height="100%"
      @mousedown.stop="startResizeRight"
      @click.stop
    />
    <text
      v-if="width > 25"
      class="close"
      :x="stop - 25"
      y="25"
      font-size="40"
      @click="close"
    >
      &times;
    </text>
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

    watch([ inputTime ], () => {
      start.value = timeToPosition(inputTime.value.start)
      stop.value = timeToPosition(inputTime.value.stop)
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

    const close = () => {
      emit('close')
    }

    watch([ start, stop ], () => {
      emit('input', {
        start: positionToTime(start.value),
        stop: positionToTime(stop.value)
      })
    })

    return {
      el,
      width,
      start,
      stop,
      startMove,
      startResizeLeft,
      startResizeRight,
      close
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
