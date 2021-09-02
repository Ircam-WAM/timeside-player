<template>
  <div class="list-container">
    <div v-if="analysisError">
      {{ formatResponseError(analysisError) }}
    </div>
    <div
      v-if="analysisLoading"
    >
      Loading...
    </div>
    <div
      v-else
    >
      <div
        v-for="a of analysis"
        :key="a.uuid"
        :value="a.uuid"
        class="checklist"
        @click="submit(a)"
      >
       {{ a.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted
} from 'vue'

import { useApi, Analysis, AnalysisTrack } from '@/utils/api'
import { getAnalysisUrl, getItemUrl } from '@ircam/timeside-sdk'

import { formatResponseError } from '@/utils/response-error'

// import useAnalysis from '@/utils/analysis-list-store'

export default defineComponent({
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  emits: [
    'new-analysis-track',
  ],
  setup (props, { emit }) {
    const { api, currentBaseUrl } = useApi()
    // const { analysis, analysisLoading, analysisError } = useAnalysis()
    const analysis = ref<Array<Analysis>>()
    const analysisLoading = ref(true)
    const analysisError = ref<Response>()

    const selectedAnalysisId = ref<Analysis['uuid']>()

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

    const submitLoading = ref(false)
    const submitError = ref<Response | Error | undefined>()

    async function submit (selectedAnalysis: Analysis) {
      if (!selectedAnalysis.uuid) {
        return undefined
      }
      // Building URL
      // https://github.com/Parisson/TimeSide/issues/188
      const analysisTrack: AnalysisTrack = {
        item: getItemUrl(currentBaseUrl, props.itemId),
        analysis: getAnalysisUrl(currentBaseUrl, selectedAnalysis.uuid)
      }
      submitLoading.value = true
      try {
        const at = await api.createAnalysisTrack({ analysisTrack })
        if (!selectedAnalysis) {
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
.list-container {
  opacity: 0.95;
  cursor: pointer;
  padding-right: 5px
}
.checklist {
  text-align: left;
  font-size: 16px;
  display: flex;
  margin-top: 2px;
  position: relative;
  top: 50%
}
.checklist:hover {
  background: gainsboro;
}
</style>
