<template>
  <form
    class="create-annotation"
    @submit.prevent="submit"
  >
    <input
      v-model="form.title"
      class="input title"
      placeholder="Title"
      name="title"
      type="text"
      :style="{width: `${props.width - 10}px`}"
    >
    <textarea
      v-model="form.description"
      class="input description"
      placeholder="Description"
      name="description"
      type="text"
      :style="{width: `${props.width -10}px`}"
    />
    <button class="form-button">
      Save
    </button>
    <button
      type="button"
      class="form-buttun"
      @click="destroy"
    >
      Delete
    </button>
  </form>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType
} from 'vue'

import { useApi } from '@/utils/api'
import { getAnnotationTrackUrl } from '@ircam/timeside-sdk'
import { Region as RegionType } from '@/types/region'
import { useAnnotationStore } from '@/store/annotation'
import useTrackHelpers from '@/utils/use-track-helpers'

export default defineComponent({
  name: 'CreateAnnotation',
  props: {
    selection: {
      type: Object as PropType<RegionType>,
      required: false,
      default: undefined
    },
    start: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    }
  },
  emits: [
    'close'
  ],
  setup (props, { emit }) {
    const { positionToTime } = useTrackHelpers()
    const { api, currentBaseUrl } = useApi()
    const annotationStore = useAnnotationStore()

    if (annotationStore.editingAnnotation === undefined) {
      throw new Error('editAnnotation.annotationTrack is undefined')
    }

    const formEl = ref<HTMLFormElement>()
    const initialForm = () => ({
      title: '',
      description: ''
    })
    const form = ref(initialForm())
    form.value.title = annotationStore.editingAnnotation.annotation.title || ''
    if (annotationStore.editingAnnotation.annotation.description !== undefined) {
      form.value.description = annotationStore.editingAnnotation.annotation.description
    }
    const error = ref()

    async function submit () {
      if (annotationStore.editingAnnotation === undefined) {
        throw new Error('editAnnotation.annotationTrack is undefined')
      }
      const startTime = positionToTime(props.start, props.selection)
      const stopTime = positionToTime(props.start + props.width, props.selection)
      try {
        if (annotationStore.editingAnnotation.annotation.uuid === undefined) {
          throw new Error('editAnnotation.annotation.uuid is undefined')
        }
        const track = getAnnotationTrackUrl(currentBaseUrl, annotationStore.editingAnnotation.annotationTrack)
        const annotation = { uuid: annotationStore.editingAnnotation.annotation.uuid, track, ...form.value, startTime: startTime, stopTime: stopTime }
        const updateAnnotation = { uuid: annotationStore.editingAnnotation.annotation.uuid, annotation: annotation }
        await api.updateAnnotation(updateAnnotation)
        annotationStore.editAnnotation(annotation)
        form.value = initialForm()
        formEl.value?.reset()
        emit('close')
      } catch (e) {
        error.value = e
      }
    }

    async function destroy () {
      if (annotationStore.editingAnnotation === undefined) {
        throw new Error('editAnnotation.annotationTrack is undefined')
      }
      const aUuid = annotationStore.editingAnnotation.annotation.uuid
      if (aUuid === undefined) {
        throw new Error('editAnnotation.annotation.uuid is undefined')
      }
      try {
        await api.destroyAnnotation({ uuid: aUuid })
        annotationStore.removeEditingAnnotation()
        form.value = initialForm()
        formEl.value?.reset()
        emit('close')
      } catch (e) {
        error.value = e
      }
    }

    return {
      props,
      form,
      formEl,
      submit,
      destroy
    }
  }
})

</script>

<style lang="less" scoped>
.input {
  margin: 5px;
}
.title {
  margin-top: 5px;

}
.description {
  min-height: 120px;
}

</style>
