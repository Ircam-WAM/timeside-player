<template>
  <div>
    <p class="form-title">
      Add an analysis track
    </p>
    <div v-if="analysisError">
      {{ analysisError }}
    </div>
    <form
      v-else
      class="generic-form"
      @submit.prevent="submit"
    >
      <div class="field select-wrapper">
        <!--<label for="analysis">Analysis</label>-->
        <!--
          Use `@input` instead of `v-model` to set loading option
        -->
        <select
          id="analysis"
          required
          @input="selectedAnalysisId = $event.target.value"
        >
          <option
            v-if="analysisLoading"
            selected
            disabled
            value="loading"
          >
            Loading...
          </option>
          <template v-if="analysis">
            <option
              selected
              disabled
            >
              Analysis type
            </option>
            <option
              v-for="a of analysis"
              :key="a.uuid"
              :value="a.uuid"
            >
              <template v-if="a.description">
                {{ a.title }} ({{ a.description }})
              </template>
              <template v-else>
                {{ a.title }}
              </template>
            </option>
          </template>
          <template v-else>
            Unexpected: analysis undefined but analysisLoading = false
          </template>
        </select>
      </div>
      <div>
        <button type="submit" class="btn green-btn">
          <template v-if="submitLoading">
            Loading...
          </template>
          <template v-else>
            Add
          </template>
        </button>
        <div v-if="submitError" class="error">
          An error occured while adding analysis track: {{ formatResponseError(submitError) }}
        </div>
        <button type="button" class="btn grey-btn" @click="$emit('close')">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  computed
} from '@vue/composition-api'

import api, {
  basePath,
  Analysis,
  AnalysisTrack,
  getItemUrl,
  getAnalysisUrl
} from '@/utils/api'

import { useToasted } from '@/utils/vue-toasted'
import { formatResponseError } from '@/utils/response-error'

export default defineComponent({
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  setup (props, { emit }) {
    const toasted = useToasted()
    const analysis = ref<Array<Analysis>>()
    const analysisLoading = ref(true)
    const selectedAnalysisId = ref<Analysis['uuid']>()
    const analysisError = ref<Response>()

    onMounted(async () => {
      try {
        const resp = await api.listAnalysis()
        analysis.value = resp
        analysisLoading.value = false
        analysisError.value = undefined
      } catch (e) {
        if (e instanceof Response) {
          analysisError.value = e
        } else {
          console.error('Unknown error occured', e)
        }
      }
    })

    const selectedAnalysis = computed(() => {
      if (!analysis.value) {
        return undefined
      }
      if (!selectedAnalysisId.value) {
        return undefined
      }
      return analysis.value.find(el => el.uuid === selectedAnalysisId.value)
    })

    const submitLoading = ref(false)
    const submitError = ref<Response | Error | undefined>()

    async function submit () {
      if (!selectedAnalysisId.value) {
        throw new Error('unexpected submit: no selectedAnalysisId')
      }

      // Building URL
      // https://github.com/Parisson/TimeSide/issues/188
      const analysisTrack: AnalysisTrack = {
        item: getItemUrl(basePath, props.itemId),
        analysis: getAnalysisUrl(basePath, selectedAnalysisId.value)
      }
      submitLoading.value = true
      try {
        const at = await api.createAnalysisTrack({ analysisTrack })
        if (!selectedAnalysis.value) {
          throw new Error('unexpected empty selectedAnalysis')
        }
        toasted.success(`Analysis track "${selectedAnalysis.value.title?.toLowerCase()}" added`)
        emit('new-analysis-track', at)
      } catch (e) {
        submitError.value = e
      }
      submitLoading.value = false
    }

    return {
      analysis,
      analysisLoading,
      selectedAnalysisId,
      analysisError,

      formatResponseError,
      submitLoading,
      submitError,
      submit
    }
  }
})
</script>

<style lang="less" scoped>
.error {
  color: red;
}
</style>
