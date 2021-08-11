<template>
  <select multiple class="select-annotation">
    <option
      v-for="a of annotationTracks.annotationTracks"
      ref="annotationTrackRefs"
      :key="a.uuid"
      :annotation-track="a"
    >
      {{ a.title }}
    </option>
  </select>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType
} from '@vue/composition-api'
import { AnnotationTrackStore } from '@/utils/annotation-track-store'

export default defineComponent({
  props: {
    annotationTracks: {
      type: Object as PropType<AnnotationTrackStore>,
      required: true
    }
  }
})
</script>
