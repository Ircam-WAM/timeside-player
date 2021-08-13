<template>
  <div>
    <p class="form-title">
      Add an analysis track
    </p>
    <div v-if="analysisError">
      {{ formatResponseError(analysisError) }}
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
          v-model="selectedAnalysisId"
          required
        >
          <option
            v-if="analysisLoading"
            selected
            disabled
            value=""
          >
            Loading...
          </option>
          <template v-if="analysis">
            <option
              selected
              disabled
              value=""
            >
              Analysis type
            </option>
            <option
              v-for="a of analysis"
              :key="a.uuid"
              :value="a.uuid"
            >
              {{ a.title }}
              <template v-if="a.description">
                ({{ a.description }})
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
} from 'vue'

import { useApi, Analysis, AnalysisTrack } from '@/utils/api'
import { getAnalysisUrl, getItemUrl } from '@ircam/timeside-sdk'

import { formatResponseError } from '@/utils/response-error'

export default defineComponent({
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  emits: [
    'new-analysis-track',
    'close'
  ],
  setup (props, { emit }) {
    const analysis = ref<Array<Analysis>>()
    const analysisLoading = ref(true)
    const selectedAnalysisId = ref<Analysis['uuid']>('')
    const analysisError = ref<Response>()
    const { api, currentBaseUrl } = useApi()

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
        item: getItemUrl(currentBaseUrl, props.itemId),
        analysis: getAnalysisUrl(currentBaseUrl, selectedAnalysisId.value)
      }
      submitLoading.value = true
      try {
        const at = await api.createAnalysisTrack({ analysisTrack })
        if (!selectedAnalysis.value) {
          throw new Error('unexpected empty selectedAnalysis')
        }
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
