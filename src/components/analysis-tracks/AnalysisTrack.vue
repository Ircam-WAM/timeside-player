<template>
  <div class="analysis-track">
    <div class="info-box" :title="analysis ? analysis.uuid : undefined">
      <div v-if="loadingAnalysis">
        Loading analysis...
      </div>
      <div v-else-if="errorAnalysis">
        Error retrieving analysis: {{ errorAnalysis }}
      </div>
      <div v-else-if="analysis" class="info-title">
        {{ analysis.title }}
      </div>
      <div v-else>
        Unexpected behavior
      </div>
      <button class="delete" @click="deleteAt">
        {{ loadingDelete ? 'Loading...' : 'x' }}
      </button>
    </div>
    <div v-if="loadingResult || loadingAnalysis">
      Loading result...
    </div>
    <div v-else-if="errorResult">
      Error retrieving result: {{ errorResult }}
    </div>
    <div v-else-if="errorAnalysis">
      Error retrieving analysis: {{ errorAnalysis }}
    </div>
    <template v-else-if="result && analysis">
      <template v-if="analysis.renderType === AnalysisRenderTypeEnum.NUMBER_0">
        <HDF5Visualization
          :result-uuid="result.uuid"
          :start="start"
          :stop="stop"
        />
      </template>
      <template v-else-if="analysis.renderType === AnalysisRenderTypeEnum.NUMBER_1">
        <BitmapVisualization
          :result-uuid="result.uuid"
          :start="start"
          :stop="stop"
        />
      </template>
      <div v-else>
        Unknwon type of visualization (mimeType: "{{ result.mimeType }}", hdf5: "{{ result.hdf5 }}")
      </div>
      <TrackPluginsContainer v-if="addAnnotation" class="track-plugins-container">
        <Region v-model="innerSelection" />
      </TrackPluginsContainer>
    </template>
    <div v-else>
      Unexpected behavior (result undefined)
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  ref,
  onMounted,
  watch
} from 'vue'

import HDF5Visualization from '@/components/analysis-tracks/HDF5Visualization.vue'
import BitmapVisualization from '@/components/analysis-tracks/BitmapVisualization.vue'
import TrackPluginsContainer from '@/components/track-elements/TrackPluginsContainer.vue'
import Region from '@/components/track-elements/Region.vue'

import { useApi, Analysis, AnalysisTrack } from '@/utils/api'
import { AnalysisRenderTypeEnum, getUuidFromAnalysisUrl } from '@ircam/timeside-sdk'
import useResult from '@/utils/use-result'

export default defineComponent({
  components: {
    HDF5Visualization,
    BitmapVisualization,
    TrackPluginsContainer,
    Region
  },
  props: {
    analysisTrack: {
      type: Object as PropType<AnalysisTrack>,
      required: true
    },
    start: {
      type: Number,
      required: false,
      default: undefined
    },
    stop: {
      type: Number,
      required: false,
      default: undefined
    },
    addAnnotation: {
      type: Boolean,
      required: true
    }
  },
  emits: [ 'deleted' ],
  // See https://github.com/Parisson/TimeSide/issues/174
  setup (props, { emit }) {
    const { api } = useApi()
    var addAnnotation = props.addAnnotation
    // Reactive analysisTrack
    const _analysisTrack = computed(() => props.analysisTrack)
    const { loading: loadingResult, result, error: errorResult } = useResult(_analysisTrack)

    const loadingDelete = ref(false)

    async function deleteAt () {
      loadingDelete.value = true
      const uuid = _analysisTrack.value.uuid
      if (!uuid) {
        throw new Error('Unable to delete AnalysisTrack: no uuid')
      }
      await api.destroyAnalysisTrack({ uuid })
      emit('deleted', uuid)
      loadingDelete.value = false
    }

    const loadingAnalysis = ref(false)
    const errorAnalysis = ref()
    const analysis = ref<Analysis>()
    onMounted(() => watch(_analysisTrack, () => {
      (async () => {
        loadingAnalysis.value = true
        errorAnalysis.value = undefined
        try {
          const uuid = getUuidFromAnalysisUrl(_analysisTrack.value.analysis)
          analysis.value = await api.retrieveAnalysis({ uuid })
        } catch (e) {
          errorAnalysis.value = e
        }
        loadingAnalysis.value = false
      })()
    }, { immediate: true }))

    return {
      // result
      result,
      loadingResult,
      errorResult,

      // delete analysis track
      deleteAt,
      loadingDelete,

      // analysis
      analysis,
      loadingAnalysis,
      errorAnalysis,
      AnalysisRenderTypeEnum,
      addAnnotation
    }
  }
})
</script>

<style lang="less" scoped>
.analysis-track {
  width: 100%;
  height: 200px;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
}

</style>
