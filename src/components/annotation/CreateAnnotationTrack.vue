<template>
  <form
    ref="formEl"
    class="create-annotation-track"
    @submit.prevent="submit"
  >
    <p>Add an anotation track</p>
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
    <div>
      <label for="is-public">Public</label>
      <input
        id="is-public"
        v-model="form.isPublic"
        type="checkbox"
        name="isPublic"
      >
    </div>
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
import api from '@/utils/api'
import { getItemUrl } from '@/utils/api-url-builder'

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
      const item = getItemUrl(props.itemId)
      const annotationTrack = { item, ...form.value }
      try {
        const newAnnotation = await api.createAnnotationTrack({ annotationTrack })
        toasted.success('AnnotationTrack added !')
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
.create-annotation-track {
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
