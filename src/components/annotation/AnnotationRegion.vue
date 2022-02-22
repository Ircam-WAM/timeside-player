<template>
  <div
    ref="parentContainer"
    class="container"
  >
    <div
      v-if="start"
      class="delimiter left"
      :style="{position: 'absolute', left: `${start - 4}px`, height: '100%'}"
      @mousedown.stop="startResizeLeft"
    />
    <div
      v-if="width"
      ref="el"
      class="content"
      :style="{position: 'absolute', left: `${start}px`, height: '100%', width: `${width}px`}"
      @mousedown.stop="startMove"
    >
      <CreateAnnotation
        v-if="start && !annotationStore.editingAnnotation"
        :selection="props.selection"
        :start="start"
        :width="width"
        @close="closeHandler"
      />
      <EditAnnotation
        v-if="start && annotationStore.editingAnnotation"
        :selection="props.selection"
        :start="start"
        :width="width"
        @close="closeHandler"
      />
    </div>
    <div
      v-if="stop"
      class="delimiter right"
      :style="{position: 'absolute', left: `${stop}px`, height: '100%'}"
      @mousedown.stop="startResizeRight"
    />
    <svg
      v-if="stop && width && width > 40"
      :style="{position: 'absolute', left: `${stop - 40}px`, height: '40px', width: '40px'}"
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
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  PropType,
  onMounted,
  onUnmounted,
  watchEffect
} from 'vue'
import { assertIsDefined } from '@/utils/type-assert'
import { Region as RegionType } from '@/types/region'
import { usePlayerRect } from '@/utils/use-player-rect'
import useTrackHelpers from '@/utils/use-track-helpers'
import { Annotation } from '@/utils/api'
import { useAnnotationStore } from '@/store/annotation'
import CreateAnnotation from '@/components/annotation/CreateAnnotation.vue'
import EditAnnotation from '@/components/annotation/EditAnnotation.vue'

enum Direction {
  Left,
  Right,
}

export default defineComponent({
  name: 'AnnotationRegion',
  components: {
    CreateAnnotation,
    EditAnnotation
  },
  props: {
    selection: {
      type: Object as PropType<RegionType>,
      required: false,
      default: undefined
    },
    selectedAnnotationForEdition: {
      type: Object as PropType<Annotation>,
      required: false,
      default: undefined
    }
  },
  setup (props) {
    const annotationStore = useAnnotationStore()
    const parentContainer = ref<HTMLDivElement>()
    const { timeToPosition, positionToTime } = useTrackHelpers()
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
    const playerWidth = computed(() => playerSize.value.right - playerSize.value.left)

    watch(() => annotationStore.editingAnnotation, (editing) => {
      if (editing === undefined) {
        start.value = undefined
        stop.value = undefined
        return
      }
      start.value = timeToPosition(editing.annotation.startTime!, props.selection)
      stop.value = timeToPosition(editing.annotation.stopTime, props.selection)
    })

    watch(() => props.selection, (selection, prevSelection) => {
      if (start.value === undefined || stop.value === undefined) {
        return
      }
      start.value = timeToPosition(positionToTime(start.value, prevSelection), selection)
      stop.value = timeToPosition(positionToTime(stop.value, prevSelection), selection)
    })

    const closeHandler = () => {
      start.value = undefined
      stop.value = undefined
      annotationStore.editingAnnotation = undefined
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
        window.removeEventListener('mousemove', moveCreate)
        window.removeEventListener('mouseup', stopCreate)
      }

      window.addEventListener('mousemove', moveCreate)
      window.addEventListener('mouseup', stopCreate)
    }

    // Set listeners for startCreate
    onMounted(() => watchEffect(() => {
      if (!parentContainer.value) {
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
      closeHandler,
      parentContainer,
      playerWidth,
      props,
      annotationStore
    }
  }
})
</script>

<style lang="less" scoped>
.delimiter {
  width: 4px;
  background-color: black;

  &.left {
    padding-left: 5px;
    cursor: w-resize;
  }
  &.right {
    padding-right: 5px;
    cursor: e-resize;
  }
}

.content  {
  cursor: grab;
  background:#76D7C4  ;
}
.contairer {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
}

.close {
  cursor: pointer;
}

</style>
