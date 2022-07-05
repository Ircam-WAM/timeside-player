<template>
  <div class="selection-tracks">
    <div v-if="analysisTracks.loading" class="loading">
      Loading...
    </div>
    <div v-else-if="analysisTracks.error" class="error">
      An error occured getting analysis tracks: {{ formatResponseError(analysisTracks.error) }}
    </div>
    <div v-else-if="!analysisTracks">
      Unexpected behavior: analysisTracks is undefined and no API error
    </div>
    <div v-else class="tracks">
      <div class="track-list">
        <transition-group name="animate-track" tag="div" @enter="newTrack">
          <AnalysisTrack
            v-for="at of analysisTracks.analysisTracks"
            :key="at.uuid"
            :start="selection ? selection.start : undefined"
            :stop="selection ? selection.stop : undefined"
            :analysis-track="at"
            :add-annotation="addAnnotation"
            :selection="selection"
            class="analysis-track"
            @deleted="analysisTracks.remove($event)"
          />
        </transition-group>
        <TrackPluginsContainer class="track-plugins-container">
          <InteractivePlayCursor :selection="innerSelection" />
        </TrackPluginsContainer>
      </div>
    </div>
    <Axis
      :first-time="selection ? selection.start : 0"
      :last-time="selection ? selection.stop : lastTime"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  watch,
  ref
} from 'vue'
import { useAudioStore } from '@/store/audio'

import Axis from '@/components/track-elements/Axis.vue'
import AnalysisTrack from '@/components/analysis-tracks/AnalysisTrack.vue'

import { formatResponseError } from '@/utils/response-error'

import TrackPluginsContainer from '@/components/track-elements/TrackPluginsContainer.vue'
import InteractivePlayCursor from '@/components/track-elements/InteractivePlayCursor.vue'

import { AnalysisTrackStore } from '@/store/analysis-track'
import { Region as RegionType } from '@/types/region'

export default defineComponent({
  name: 'AnalysisTracks',
  components: {
    Axis,
    AnalysisTrack,
    TrackPluginsContainer,
    InteractivePlayCursor
  },
  props: {
    itemId: {
      type: String,
      required: true
    },
    analysisTracks: {
      type: Object as PropType<AnalysisTrackStore>,
      required: true
    },
    selection: {
      type: Object as PropType<RegionType>,
      required: false,
      default: undefined
    },
    addAnnotation: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'selection'
  ],
  setup (props, { emit }) {
    const audioStore = useAudioStore()
    const selection = ref<RegionType>()

    // two-way data binding
    watch([ () => props.selection ], () => {
      selection.value = props.selection
    }, { immediate: true })
    watch([ selection ], () => {
      emit('selection', selection.value)
    }, { immediate: true })

    function newTrack (el: Element) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return {
      // Use a different name to avoid namespace conflicts with `selection` props
      innerSelection: selection,

      formatResponseError,
      lastTime: computed(() => audioStore.state.duration),
      newTrack
    }
  }
})
</script>

<style lang="less" scoped>
.tracks {
  position: relative;
}

.waveform-zoom,
.analysis-track {
  height: 200px;
}

.track-list > *:not(:last-child) {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #c6c6c6;
}

.animate-track-enter-active {
  transition: box-shadow 5s;
}

.animate-track-enter,
.animate-track-leave-to {
  box-shadow: 10px 10px 45px rgba(0, 0, 0, 0.6);
}

.error {
  color: red;
}
</style>
