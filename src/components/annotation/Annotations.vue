<template>
  <div>
    <div
      v-for="[key, annotations] in annotationStore.annotations"
      :key="key"
    >
      <div
        v-for="annotation in annotations"
        :key="annotation.uuid"
      >
        <div
          v-if="show(annotation)"
          class="annotation"
          :style="{
            left: `${left(annotation.startTime)}px`,
            width: `${right(annotation.stopTime) - left(annotation.startTime)}px`
          }"
          @mouseover="moreInfoUuid = annotation.uuid"
          @mouseleave="moreInfoUuid = undefined"
        >
          {{ annotation.title }}
          <div class="pencil"
               @click="annotationStore.editingAnnotation={annotation: annotation, annotationTrack: key}"
          >
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pencil-alt" class="svg-inline--fa fa-pencil-alt fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z" /></svg>
          </div>
        </div>
        <div
          v-if="show(annotation) && moreInfoUuid == annotation.uuid"
          class="description"
          :style="{left: `${right(annotation.stopTime)}px`}"
        >
          {{ annotation.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  ref
} from 'vue'

import { Region as RegionType } from '@/types/region'
import { useAnnotationStore } from '@/store/annotation'
import { useAudioStore } from '@/store/audio'
import { Annotation } from '@/utils/api'
import { assertIsDefined } from '@/utils/type-assert'

export default defineComponent({
  name: 'Annotations',
  props: {
    selection: {
      type: Object as PropType<RegionType>,
      default: undefined
    },
    playerWidth: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const store = useAudioStore()
    const annotationStore = useAnnotationStore()
    const selectionStart = computed(() => props.selection?.start || 0)
    const selectionStop = computed(() => props.selection?.stop || store.state.duration)
    const moreInfoUuid = ref<string | undefined>()
    const selectedAnnotationForEdition = ref<Annotation>()

    function show (annotation: Annotation) {
      if (annotationStore.editingAnnotation !== undefined &&
          annotation.uuid === annotationStore.editingAnnotation.annotation.uuid) {
        return false
      }
      return (annotation.stopTime > selectionStart.value && annotation.startTime! < selectionStop.value)
    }
    function timeToPosition (time: number) {
      const duration = selectionStop.value - selectionStart.value
      return Math.round((time - selectionStart.value) * props.playerWidth / duration)
    }
    function left (startTime?: number) {
      assertIsDefined(startTime)
      if (startTime < selectionStart.value) {
        return 0
      }
      return timeToPosition(startTime)
    }
    function right (stopTime?: number) {
      assertIsDefined(stopTime)
      if (stopTime > selectionStop.value) {
        return props.playerWidth
      }
      return timeToPosition(stopTime)
    }
    return {
      annotationStore,
      selectionStart,
      selectionStop,
      props,
      show,
      left,
      right,
      moreInfoUuid,
      selectedAnnotationForEdition
    }
  }
})
</script>

<style lang="less" scoped>
.annotation {
  position: absolute;
  background-color: #76D7C4 ;
  opacity: 0.7;
  pointer-events: auto;
}
.description {
  position: absolute;
  background-color: whitesmoke;
}
.pencil{
  height: 15px;
  width: 15px;
  margin: 0 10px;
}
</style>
