<template>
  <div>
    <CreateAnnotationTrack
      :item-id="itemId"
      @new-annotation="onNew"
    />
    <div v-if="loading">
      Loading...
    </div>
    <div
      v-else-if="error"
      class="error"
    >
      Error: {{ error }}
    </div>
    <div
      v-else-if="annotationTracks"
      class="annotation-tracks"
    >
      <AnnotationTrack
        v-for="a of annotationTracks"
        :key="a.uuid"
        :annotation-track="a"
        @destroy="onDestroy($event)"
      />
    </div>
    <div v-else>
      Undefined behavior
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  watch
} from '@vue/composition-api'

import AnnotationTrack from './AnnotationTrack.vue'

import CreateAnnotationTrack from '@/components/annotation/CreateAnnotationTrack.vue'
import api, { AnnotationTrack as AnnotationTrackType } from '@/utils/api'

export default defineComponent({
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  components: {
    CreateAnnotationTrack,
    AnnotationTrack
  },
  setup (props) {
    const annotationTracks = ref<AnnotationTrackType[]>()
    const loading = ref(false)
    const error = ref()

    onMounted(() => watch(() => props.itemId, () => {
      (async () => {
        loading.value = true
        try {
          annotationTracks.value = await api.listAnnotationTracks({ itemUuid: props.itemId })
        } catch (e) {
          error.value = e
        }
        loading.value = false
      })()
    }, { immediate: true }))

    const onNew = (at: AnnotationTrackType) => {
      if (!annotationTracks.value) {
        return
      }
      annotationTracks.value.push(at)
    }

    const onDestroy = (removedId: string) => {
      if (!annotationTracks.value) {
        return
      }
      annotationTracks.value = annotationTracks.value.filter(a => a.uuid !== removedId)
    }

    return {
      loading,
      error,
      annotationTracks,
      onNew,
      onDestroy
    }
  }
})
</script>

<style lang="less" scoped>
.error {
  color: red;
}
</style>
