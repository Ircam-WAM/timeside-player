<template>
  <div class="annotations">
    <CreateAnnotation :track-id="trackId" @new-annotation="onNew($event)" />
    <template v-if="annotations">
      <div
        v-for="a of annotations"
        :key="a.uuid"
        class="annotation"
      >
        <p>Title: {{ a.title }}</p>
        <p>Description: {{ a.description }}</p>
        <p>Start time: {{ a.startTime }}</p>
        <p>Stop time: {{ a.stopTime }}</p>
        <button :disabled="loadingDestroy" @click="destroyAnnotation(a.uuid)">
          {{ loadingDestroy ? 'Loading...' : 'Delete Annotation' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  watch
} from '@vue/composition-api'

import api, { Annotation } from '@/utils/api'

import CreateAnnotation from '@/components/annotation/CreateAnnotation.vue'

export default defineComponent({
  props: {
    trackId: {
      type: String,
      required: true
    }
  },
  components: {
    CreateAnnotation
  },
  setup (props) {
    const loading = ref(false)
    const error = ref()
    const annotations = ref<Annotation[]>()

    onMounted(() => watch(() => props.trackId, () => {
      (async () => {
        loading.value = true
        try {
          annotations.value = await api.listAnnotations({ trackUuid: props.trackId })
        } catch (e) {
          error.value = e
        }
        loading.value = false
      })()
    }))

    const onNew = (at: Annotation) => {
      if (!annotations.value) {
        return
      }
      annotations.value.push(at)
    }

    const loadingDestroy = ref(false)

    const destroyAnnotation = async (removedId: string | undefined) => {
      if (removedId === undefined) {
        return
      }
      if (!annotations.value) {
        return
      }
      try {
        await api.destroyAnnotation({ uuid: removedId })
        annotations.value = annotations.value.filter(a => a.uuid !== removedId)
      } catch (e) {
        console.error(e)
      }
    }

    return {
      loading,
      error,
      annotations,
      onNew,
      destroyAnnotation,
      loadingDestroy
    }
  }
})
</script>

<style lang="less" scoped>
.annotation {
  background: grey;
  display: inline-block;
  margin: 10px;
}
</style>
