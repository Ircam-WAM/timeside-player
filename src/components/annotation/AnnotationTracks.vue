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
      <transition-group name="animate-track" tag="div" @enter="newTrack">
        <AnnotationTrack
          v-for="a of annotationTracks.annotationTracks"
          ref="annotationTrackRefs"
          :key="a.uuid"
          :annotation-track="a"
          class="annotation-track"
          @destroy="annotationTracks.remove($event)"
        />
      </transition-group>
    </div>
    <div v-else>
      Undefined behavior
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType
} from '@vue/composition-api'
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
    function newTrack (el: Element) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return {
      formatResponseError,
      newTrack
    }
  }
})
</script>

<style lang="less" scoped>
.error {
  color: red;
}

.annotation-track {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #c6c6c6;
}

.animate-track-enter-active {
  transition: box-shadow 5s;
}

.animate-track-enter,
.animate-track-leave-to {
  box-shadow: 10px 10px 45px rgba(0, 0, 0, 0.6);
}

</style>
