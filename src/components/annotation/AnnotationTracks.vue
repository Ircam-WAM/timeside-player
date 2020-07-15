<template>
  <div>
    <div v-if="annotationTracks.loading">
      Loading...
    </div>
    <div
      v-else-if="annotationTracks.error"
      class="error"
    >
      Error: {{ formatResponseError(annotationTracks.error) }}
    </div>
    <div
      v-else-if="annotationTracks"
      class="annotation-tracks"
    >
      <AnnotationTrack
        v-for="a of annotationTracks.annotationTracks"
        :key="a.uuid"
        :annotation-track="a"
        @destroy="annotationTracks.remove($event)"
      />
    </div>
    <div v-else>
      Undefined behavior
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { AnnotationTrackStore } from '@/utils/annotation-track-store'
import { formatResponseError } from '@/utils/response-error'
import AnnotationTrack from './AnnotationTrack.vue'

export default defineComponent({
  props: {
    annotationTracks: {
      type: Object as PropType<AnnotationTrackStore>,
      required: true
    }
  },
  components: {
    AnnotationTrack
  },
  setup () {
    return {
      formatResponseError
    }
  }
})
</script>

<style lang="less" scoped>
.error {
  color: red;
}
</style>
