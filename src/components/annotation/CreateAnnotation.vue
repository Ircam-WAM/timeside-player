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
    <button
      class="save-button"
    >
      Save
    </button>
  </form>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  inject,
  PropType
} from 'vue'

import { useApi } from '@/utils/api'
import { assertIsDefined } from '@/utils/type-assert'
import { getAnnotationTrackUrl } from '@ircam/timeside-sdk'
import { selectedAnnotationTrackKey } from '@/components/Player.vue'
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
    const selectedAnnotationTrack = inject(selectedAnnotationTrackKey)
    const annotationStore = useAnnotationStore()

    const formEl = ref<HTMLFormElement>()
    const initialForm = () => ({
      title: '',
      description: ''
    })
    const form = ref(initialForm())
    const error = ref()

    async function submit () {
      const startTime = positionToTime(props.start, props.selection)
      const stopTime = positionToTime(props.start + props.width, props.selection)
      assertIsDefined(selectedAnnotationTrack)
      if (selectedAnnotationTrack.value === undefined) {
        throw new Error('no annotationtrack selected')
      }
      const track = getAnnotationTrackUrl(currentBaseUrl, selectedAnnotationTrack.value)
      const annotation = { track, ...form.value, startTime: startTime, stopTime: stopTime }
      try {
        const newAnnotation = await api.createAnnotation({ annotation })
        annotationStore.addAnnotation(selectedAnnotationTrack.value, newAnnotation)
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
      submit
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
.add-button {
  position: absolute;
  right: 5px;
  bottom: 10px
}

</style>
