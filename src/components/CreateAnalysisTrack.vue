<template>
  <div>
    <p>Add an analysis track</p>
    <div v-if="analysisError">
      {{ analysisError }}
    </div>
    <form
      v-else
      @submit.prevent="submit"
    >
      <div class="field">
        <label for="analysis">Analysis</label>
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
              Select an Analysis
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
            Unexpected: analyis undefined but analysisLoading = false
          </template>
        </select>
      </div>
      <div>
        <button type="submit">
          Add analysis track
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref
} from '@vue/composition-api'

import api, {
  basePath,
  Analysis,
  AnalysisTrack,
  getItemUrl,
  getAnalysisUrl
} from '@/utils/api'

import { useToasted } from '@/utils/vue-toasted'

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
        toasted.success('AnalysisTrack added !')
      } catch (e) {
        analysisError.value = e
      }
    })

    /*
    const selectedAnalysis = computed(() => {
      if (!analysis.value) {
        return undefined
      }
      if (!selectedAnalysisId.value) {
        return undefined
      }
      return analysis.value.find(el => el.uuid === selectedAnalysisId.value)
    })
    */

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
      try {
        const at = await api.createAnalysisTrack({ analysisTrack })
        emit('newAnalysisTrack', at)
        // console.log(resp)
      } catch (e) {
        // console.error('Unable to create track: ', e)
      }
    }

    return {
      analysis,
      analysisLoading,
      selectedAnalysisId,
      analysisError,
      submit
    }
  }
})
</script>

<style lang="less" scoped>
.field {
  margin-bottom: 10px;

  & > label {
    margin-right: 10px;
  }
}
</style>
