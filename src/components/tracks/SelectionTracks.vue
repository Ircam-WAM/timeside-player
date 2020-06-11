<template>
  <div class="selection-tracks">
    <div class="tracks">
      <div class="track-list">
        <WaveformContainer
          :item-id="itemId"
          :start="selection.start"
          :stop="selection.stop"
          :nb-pixels="2048"
        />
        <AnalysisTrack
          v-for="at of analysisTracks"
          :key="at.uuid"
          :start="selection.start"
          :stop="selection.stop"
          :analysis-track="at"
          @deleted="analysisTracks = analysisTracks.filter((at) => at.uuid !== $event)"
        />
      </div>
      <TrackPluginsContainer>
        <InteractivePlayCursor
          :selection="selection"
        />
      </TrackPluginsContainer>
    </div>
    <Axis
      :first-time="selection.start"
      :last-time="selection.stop"
    />
    <CreateAnalysisTrack
      :item-id="itemId"
      @newAnalysisTrack="analysisTracks.push($event)"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  onMounted,
  ref
} from '@vue/composition-api'

import TrackPluginsContainer from '@/components/track-elements/TrackPluginsContainer.vue'
import InteractivePlayCursor from '@/components/track-elements/InteractivePlayCursor.vue'
import Axis from '@/components/track-elements/Axis.vue'
import WaveformContainer from '@/components/track-elements/WaveformContainer.vue'

import CreateAnalysisTrack from '@/components/analysis-tracks/CreateAnalysisTrack.vue'
import AnalysisTrack from '@/components/analysis-tracks/AnalysisTrack.vue'

import api, { AnalysisTrack as AnalysisTrackType } from '@/utils/api'

import { Region as RegionType } from '@/types/region'

export default defineComponent({
  name: 'SelectionTracks',
  props: {
    itemId: {
      type: String,
      required: true
    },
    selection: {
      type: Object as PropType<RegionType>,
      required: true
    }
  },
  components: {
    TrackPluginsContainer,
    WaveformContainer,
    Axis,
    InteractivePlayCursor,

    AnalysisTrack,
    CreateAnalysisTrack
  },
  setup (props) {
    const analysisTracks = ref<AnalysisTrackType[]>(undefined)

    onMounted(async () => {
      analysisTracks.value = await api.listAnalysisTracks({ itemUuid: props.itemId })
    })

    return {
      analysisTracks
    }
  }
})
</script>

<style lang="less" scoped>
.tracks {
  position: relative;
}

.track-list > *:not(:last-child) {
  margin-bottom: 10px;
}
</style>
