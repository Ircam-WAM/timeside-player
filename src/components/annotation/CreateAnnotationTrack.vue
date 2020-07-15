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
      <label for="is-public">Make annotation public</label>
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
import api, { basePath, getItemUrl } from '@/utils/api'

export default defineComponent({
  props: {
    itemId: {
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
      isPublic: false
    })
    const form = ref(initialForm())

    const loading = ref(false)
    const error = ref()

    async function submit () {
      const item = getItemUrl(basePath, props.itemId)
      const annotationTrack = { item, ...form.value }
      try {
        const newAnnotation = await api.createAnnotationTrack({ annotationTrack })
        toasted.success('AnnotationTrack added !')
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
      loading
    }
  }
})
</script>

<style lang="less" scoped>
.form-title {
  font-weight: bold;
  font-size: 18px;
  margin-top: 0;
}

.error {
  color: red;
}
</style>
