<template>
  <form
    ref="formEl"
    class="create-annotation-track generic-form"
    @submit.prevent="submit"
  >
    <p class="form-title">
      Add an annotation track
    </p>
    <div class="field">
      <input
        v-model="form.title"
        placeholder="Title"
        name="title"
        type="text"
        required
      >
    </div>
    <div class="field">
      <input
        v-model="form.description"
        placeholder="Description"
        name="description"
        type="text"
        required
      >
    </div>
    <div class="field left">
      <input
        id="is-public"
        v-model="form.isPublic"
        type="checkbox"
        name="isPublic"
      >
      <label for="is-public">Make annotations public</label>
    </div>
    <button
      class="btn green-btn"
      :disabled="loading"
    >
      {{ loading ? 'Loading...' : 'Add' }}
    </button>
    <button type="button" class="btn grey-btn" @click="$emit('close')">
      Cancel
    </button>
    <div
      v-if="error"
      class="error"
    >
      Error: {{ formatResponseError(error) }}
    </div>
  </form>
</template>

<script lang="ts">
import {
  defineComponent,
  ref
} from 'vue'

import { useApi } from '@/utils/api'
import { formatResponseError } from '@/utils/response-error'
import { getItemUrl } from '@ircam/timeside-sdk'

export default defineComponent({
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  emits: [
    'new-annotation-track',
    'close'
  ],
  setup (props, { emit }) {
    const { api, currentBaseUrl } = useApi()
    const formEl = ref<HTMLFormElement>()
    const initialForm = () => ({
      title: '',
      description: '',
      isPublic: false
    })
    const form = ref(initialForm())

    const loading = ref(false)
    const error = ref<Response>()

    async function submit () {
      const item = getItemUrl(currentBaseUrl, props.itemId)
      const annotationTrack = { item, ...form.value }
      try {
        const newAnnotation = await api.createAnnotationTrack({ annotationTrack })
        form.value = initialForm()
        formEl.value?.reset()
        emit('new-annotation-track', newAnnotation)
      } catch (e) {
        error.value = e
      }
    }

    return {
      form,
      formEl,
      submit,
      error,
      loading,
      formatResponseError
    }
  }
})
</script>

<style lang="less" scoped>

.error {
  color: red;
}
</style>
