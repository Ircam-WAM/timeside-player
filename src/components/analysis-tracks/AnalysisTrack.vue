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
      <AnnotationRegion
        class="annotation-container"
        :result-uuid="result.uuid"
        :selection="props.selection"
      />
      <Annotations
        class="annotation-container annotations"
        :selection="props.selection"
        :player-width="playerWidth"
      />
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
import AnnotationRegion from '@/components/annotation/AnnotationRegion.vue'
import Annotations from '@/components/annotation/Annotations.vue'
import { Region as RegionType } from '@/types/region'

import { useApi, Analysis, AnalysisTrack } from '@/utils/api'
import { AnalysisRenderTypeEnum, getUuidFromAnalysisUrl } from '@ircam/timeside-sdk'
import useResult from '@/utils/use-result'
import { usePlayerRect } from '@/utils/use-player-rect'

export default defineComponent({
  name: 'AnnalysisTrack',
  components: {
    HDF5Visualization,
    BitmapVisualization,
    AnnotationRegion,
    Annotations
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
    },
    selection: {
      type: Object as PropType<RegionType>,
      required: false,
      default: undefined
    }
  },
  emits: [ 'deleted', 'selection' ],
  // See https://github.com/Ircam-WAM/TimeSide/issues/174
  setup (props, { emit }) {
    const { api } = useApi()
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

      const analysisButtonElement = <HTMLElement>document.querySelector('.actions')?.firstChild
      analysisButtonElement.click()
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

    const selection = ref<RegionType>()

    // two-way data binding
    watch([ () => props.selection ], () => {
      selection.value = props.selection
    }, { immediate: true })
    watch([ selection ], () => {
      emit('selection', selection.value)
    }, { immediate: true })

    const playerSize = usePlayerRect()
    const playerWidth = computed(() => playerSize.value.right - playerSize.value.left)

    return {
      // result
      result,
      loadingResult,
      errorResult,

      // delete analysis track
      deleteAt,
      loadingDelete,
      props,
      // analysis
      analysis,
      loadingAnalysis,
      errorAnalysis,
      AnalysisRenderTypeEnum,
      innerSelection: selection,
      playerWidth
    }
  }
})
</script>

<style lang="less" scoped>
.analysis-track {
  width: 100%;
  height: 200px;
  margin-top: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
}
.annotation-container {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.7;
  height: 100%;
  width: 100%;
  z-index: 1;
}
.annotations{
  pointer-events: none;
}
</style>
