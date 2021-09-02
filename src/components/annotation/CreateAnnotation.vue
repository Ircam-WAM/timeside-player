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
    >
    </textarea>
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
  computed,
  ref,
  inject,
  PropType
} from 'vue'

import { useApi } from '@/utils/api'
import { assertIsDefined } from '@/utils/type-assert'
import { getAnnotationTrackUrl } from '@ircam/timeside-sdk'
import { selectedAnnotationTrackKey } from '@/components/Player.vue'
import { Region as RegionType } from '@/types/region'
import { useAudioStore } from '@/store/audio'
import { useAnnotationStore } from '@/store/annotation'

export default defineComponent({
  props: {
    selection: {
      type: Object as PropType<RegionType>,
      required: false
    },
    start: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    playerWidth: {
      type: Number,
      required: true
    }
  },
  emits: {
    close
  },
  setup (props, { emit }) {
    const { api, currentBaseUrl } = useApi()
    const selectedAnnotationTrack = inject(selectedAnnotationTrackKey)
    const store = useAudioStore()
    const selectionStart = computed(() => props.selection?.start || 0)
    const selectionStop = computed(() => props.selection?.stop || store.state.duration)
    const annotationStore = useAnnotationStore()

    const formEl = ref<HTMLFormElement>()
    const initialForm = () => ({
      title: '',
      description: ''
    })
    const form = ref(initialForm())
    const error = ref()

    async function submit () {
      assertIsDefined(selectedAnnotationTrack)
      if (selectedAnnotationTrack.value === undefined) {
        throw new Error('no annotations selected')
      }
      const track = getAnnotationTrackUrl(currentBaseUrl, selectedAnnotationTrack.value)
      const startTime = Math.round(props.start * (selectionStop.value - selectionStart.value) / props.playerWidth + selectionStart.value)
      const stopTime = Math.round((props.start + props.width) * (selectionStop.value - selectionStart.value) / props.playerWidth + selectionStart.value)
      const annotation = { track, ...form.value, startTime: startTime, stopTime: stopTime }
      try {
        await api.createAnnotation({ annotation })
        form.value = initialForm()
        formEl.value?.reset()
        annotationStore.addAnnotation(selectedAnnotationTrack.value, annotation)
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
