<template>
  <div class="annotation-track">
    <b>
      Annotation Track: {{ annotationTrack.title }}
      <span v-if="annotationTrack.description">- {{ annotationTrack.description }}</span>
    </b>
    <p class="author">
      Author: {{ annotationTrack.author }}
    </p>
    <p class="is-public">
      Public: {{ annotationTrack.isPublic }}
    </p>
    <Annotations :track-id="annotationTrack.uuid" />
    <button @click="destroy">
      {{ loadingDestroy ? 'Loading...' : 'Delete Annotation Track' }}
    </button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref
} from '@vue/composition-api'

import api, { AnnotationTrack } from '@/utils/api'
import Annotations from '@/components/annotation/Annotations.vue'

export default defineComponent({
  props: {
    annotationTrack: {
      type: Object as PropType<AnnotationTrack>,
      required: true
    }
  },
  components: {
    Annotations
  },
  setup (props, { emit }) {
    const loadingDestroy = ref(false)
    const errorDestroy = ref()

    async function destroy () {
      if (!props.annotationTrack.uuid) {
        throw new Error(`Unexpected props.annotation.uuid: ${props.annotationTrack.uuid}`)
      }
      loadingDestroy.value = true
      try {
        await api.destroyAnnotationTrack({ uuid: props.annotationTrack.uuid })
        emit('destroy', props.annotationTrack.uuid)
      } catch (e) {
        errorDestroy.value = e
      }
      loadingDestroy.value = false
    }

    return {
      destroy,
      loadingDestroy,
      errorDestroy
    }
  }
})
</script>

<style lang="less" scoped>
.annotation-track {
  background: #80808045;
  width: 100%;
  margin: 5px;
  padding: 10px;
}
</style>
