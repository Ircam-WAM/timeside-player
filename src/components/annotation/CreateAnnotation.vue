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
      placeholder="Start"
      required
    >
    <input
      v-model="form.stopTime"
      name="stop-time"
      type="number"
      placeholder="Stop"
      required
    >
    <button
      :disabled="loading"
    >
      {{ loading ? 'Loading...' : 'Submit' }}
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
} from '@vue/composition-api'

import { useToasted } from '@/utils/vue-toasted'
import api, { basePath, getAnnotationTrackUrl } from '@/utils/api'

export default defineComponent({
  props: {
    trackId: {
      type: String,
      required: true
    }
  },
  setup (props, { emit }) {
    const formEl = ref<HTMLFormElement>()
    const toasted = useToasted()
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
      const track = getAnnotationTrackUrl(basePath, props.trackId)
      const annotation = { track, ...form.value }
      try {
        const newAnnotation = await api.createAnnotation({ annotation })
        toasted.success('Annotation added !')
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
