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
        <div>
          <div class="info-box">
            <p class="info-type">
              Waveform
            </p>
          </div>
          <WaveformContainer
            class="waveform-zoom"
            :item-id="itemId"
            :start="selection ? selection.start : undefined"
            :stop="selection ? selection.stop : undefined"
            :nb-pixels="2048"
          />
        </div>
        <transition-group name="animate-track" tag="div">
          <AnalysisTrack
            v-for="at of analysisTracks.analysisTracks"
            ref="analysisTrackRefs"
            :key="at.uuid"
            :start="selection ? selection.start : undefined"
            :stop="selection ? selection.stop : undefined"
            :analysis-track="at"
            class="analysis-track"
            @deleted="analysisTracks.remove($event)"
          />
        </transition-group>
      </div>
      <TrackPluginsContainer>
        <InteractivePlayCursor
          :selection="selection"
        />
      </TrackPluginsContainer>
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
  onMounted,
  watch,
  ref
} from '@vue/composition-api'
import { useStore } from '@/store/index'

import TrackPluginsContainer from '@/components/track-elements/TrackPluginsContainer.vue'
import InteractivePlayCursor from '@/components/track-elements/InteractivePlayCursor.vue'
import Axis from '@/components/track-elements/Axis.vue'
import WaveformContainer from '@/components/track-elements/WaveformContainer.vue'

import AnalysisTrack from '@/components/analysis-tracks/AnalysisTrack.vue'

import { formatResponseError } from '@/utils/response-error'

import { AnalysisTrackStore } from '@/utils/analysis-track-store'
import { AnalysisTrack as AnalysisTrackType } from '@/utils/api'
import { Region as RegionType } from '@/types/region'

export default defineComponent({
  name: 'AnalysisTracks',
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
      type: Object as PropType<RegionType>
    }
  },
  components: {
    TrackPluginsContainer,
    WaveformContainer,
    Axis,
    InteractivePlayCursor,

    AnalysisTrack
  },
  setup ({ analysisTracks }) {
    const store = useStore()
    // FIXME: On vue@3 release, switch to functions refs
    // See https://composition-api.vuejs.org/api.html#template-refs
    const analysisTrackRefs = ref<{ $el: Element, _props: { analysisTrack: AnalysisTrackType } }[]>([])

    // Scroll to new element when added
    const atLength = computed(() => analysisTracks.analysisTracks ? analysisTracks.analysisTracks.length : 0)
    onMounted(() => watch(atLength, (newLength, oldLength) => {
      if (newLength === 0) {
        return
      }
      // Check only one item has been added
      if (newLength - oldLength !== 1) {
        return
      }
      // Get last added in store
      const lastAdded = analysisTracks.getLastAdded()
      if (!lastAdded) {
        console.warn('unexpected empty last added')
        return
      }
      // Refs are not ordered, we have to find by props
      const newElementRef = analysisTrackRefs.value.find(r => r._props.analysisTrack === lastAdded)
      if (!newElementRef) {
        console.warn('new item not found')
        return
      }
      newElementRef.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }))

    return {
      analysisTrackRefs,
      formatResponseError,
      lastTime: computed(() => store.state.audio.duration)
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
