<template>
  <form
    ref="formEl"
    class="create-annotation"
    @submit.prevent="submit"
  >
    <p>Add an anotation</p>
    <input
      v-model="form.title"
      placeholder="Title"
      name="title"
      type="text"
      required
    >
    <input
      v-model="form.description"
      placeholder="Description"
      name="description"
      type="text"
      required
    >
    <input
      v-model="form.startTime"
      name="start-time"
      type="number"
      placeholder="Start (seconds)"
      required
    >
    <input
      v-model="form.stopTime"
      name="stop-time"
      type="number"
      placeholder="Stop (seconds)"
      required
    >
    <button
      :disabled="loading"
    >
      {{ loading ? 'Loading...' : 'Add' }}
    </button>
    <div
      v-if="error"
      class="error"
    >
      Error: {{ error }}
    </div>
  </form>
</template>

<script lang="ts">
import {
  defineComponent,
  ref
} from 'vue'

import { useApi } from '@/utils/api'
import { getAnnotationTrackUrl } from '@ircam/timeside-sdk'

export default defineComponent({
  props: {
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
    const formEl = ref<HTMLFormElement>()
    const initialForm = () => ({
      title: '',
      description: '',
      startTime: 0,
      stopTime: 0
    })
    const form = ref(initialForm())

    const loading = ref(false)
    const error = ref()

    async function submit () {
      const track = getAnnotationTrackUrl(currentBaseUrl, props.trackId)
      const annotation = { track, ...form.value }
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
      form,
      formEl,
      submit,
      error,
      loading
    }
  }
})
</script>

<style lang="less" scoped>
.create-annotation {
  text-align: center;
  padding: 10px;

  & > * {
    margin: 0 auto;
    margin-bottom: 10px;
    display: block;
  }
}

.error {
  color: red;
}
</style>
