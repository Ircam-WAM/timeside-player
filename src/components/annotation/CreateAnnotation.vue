<template>
  <div
    class="create-annotation"
  >
    <input
      v-model="form.title"
      class="input title"
      placeholder="Title"
      name="title"
      type="text"
      :style="{width: `${width-10}px`}"
    >
    <textarea
      v-model="form.description"
      class="input description"
      placeholder="Description"
      name="description"
      type="text"
      :style="{width: `${width-10}px`}"
    />
    <div class=checkbox-and-label>
      <input
        class="input"
        type="checkbox"
        id="checkbox"
        v-model="globalAnnotationBool"
      >
      <label
        for="checkbox"
        :style="{width: `${width-10}px`}"
      >
        Global Annotation
      </label>
    </div>
    <button
      class="add-button"
      @submit.prevent="submit">
      Add
    </button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref
} from 'vue'

import { useApi } from '@/utils/api'
import { getAnnotationTrackUrl } from '@ircam/timeside-sdk'

export default defineComponent({
  props: {
    selection_start: {
      type: Number,
      required: false
    },
    selection_stop: {
      type: Number,
      required: false
    },
    start: {
      type: Number,
      required: true
    },
    stop: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    trackId: {
      type: String,
      required: true
    }
  },
  emits: [
    'new-annotation'
  ],
  setup (props, { emit }) {
    const { api, currentBaseUrl } = useApi()
    const duration = computed(() => 31)
    const selectionStart = computed(() => props.selection_start || 0)
    const selectionStop = computed(() => props.selection_stop || duration.value * 1000)
    const width = props.width
    const start = props.start
    const stop = props.stop

    const formEl = ref<HTMLFormElement>()
    const initialForm = () => ({
      title: '',
      description: ''
    })
    const form = ref(initialForm())
    const error = ref()

    async function submit () {
      const track = getAnnotationTrackUrl(currentBaseUrl, props.trackId)
      const annotation = { track, ...form.value, startTime: start, stopTime: stop }
      try {
        const newAnnotation = await api.createAnnotation({ annotation })
        form.value = initialForm()
        formEl.value?.reset()
        emit('new-annotation', newAnnotation)
      } catch (e) {
        error.value = e
      }
    }

    return {
      selectionStart,
      selectionStop,
      width,
      form,
      formEl
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

.checkbox-and-label {
  position: absolute;
  left: 5px;
  bottom: 10px
}
.add-button {
  position: absolute;
  right: 5px;
  bottom: 10px
}

</style>
