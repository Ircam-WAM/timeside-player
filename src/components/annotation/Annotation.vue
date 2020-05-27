<template>
  <div class="annotation">
    <b>
      Annotation Track: {{ annotation.title }}
      <span v-if="annotation.description">- {{ annotation.description }}</span>
    </b>
    <p class="author">
      Author: {{ annotation.author }}
    </p>
    <p class="is-public">
      Public: {{ annotation.isPublic }}
    </p>
    <button @click="destroy">
      {{ loadingDestroy ? 'Loading...' : 'Delete' }}
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

export default defineComponent({
  props: {
    annotation: {
      type: Object as PropType<AnnotationTrack>,
      required: true
    }
  },
  setup (props, { emit }) {
    const loadingDestroy = ref(false)
    const errorDestroy = ref()

    async function destroy () {
      if (!props.annotation.uuid) {
        throw new Error(`Unexpected props.annotation.uuid: ${props.annotation.uuid}`)
      }
      loadingDestroy.value = true
      try {
        await api.destroyAnnotationTrack({ uuid: props.annotation.uuid })
        emit('destroy', props.annotation.uuid)
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
.annotation {
  background: #80808045;
  width: 100%;
  margin: 5px;
  padding: 10px;
}
</style>
