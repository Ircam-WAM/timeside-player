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
      <transition-group name="animate-track" tag="div">
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
  PropType,
  onMounted,
  watch,
  computed,
  ref
} from '@vue/composition-api'
import { AnnotationTrackStore } from '@/utils/annotation-track-store'
import { formatResponseError } from '@/utils/response-error'
import { AnnotationTrack as AnnotationTrackType } from '@/utils/api'

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
  setup ({ annotationTracks }) {
    // FIXME: On vue@3 release, switch to functions refs
    // See https://composition-api.vuejs.org/api.html#template-refs
    const annotationTrackRefs = ref<{ $el: Element, _props: { annotationTrack: AnnotationTrackType } }[]>([])

    // Scroll to new element when added
    const atLength = computed(() => annotationTracks.annotationTracks ? annotationTracks.annotationTracks.length : 0)
    onMounted(() => watch(atLength, (newLength, oldLength) => {
      if (newLength === 0) {
        return
      }
      // Check only one item has been added
      if (newLength - oldLength !== 1) {
        return
      }
      // Get last added in store
      const lastAdded = annotationTracks.getLastAdded()
      if (!lastAdded) {
        console.warn('unexpected empty last added')
        return
      }
      // Refs are not ordered, we have to find by props
      const newElementRef = annotationTrackRefs.value.find(r => r._props.annotationTrack === lastAdded)
      if (!newElementRef) {
        console.warn('new item not found')
        return
      }
      newElementRef.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }))

    return {
      formatResponseError,
      annotationTrackRefs
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
