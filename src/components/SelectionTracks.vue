<template>
  <div class="selection-tracks">
    <div class="tracks">
      <WaveformContainer
        :item-id="itemId"
        :start="selection.start"
        :stop="selection.stop"
        :nb-pixels="2048"
      />
      <!-- Let's add more tracks here later -->
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
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType
} from '@vue/composition-api'

import TrackPluginsContainer from '@/components/TrackPluginsContainer.vue'
import InteractivePlayCursor from '@/components/InteractivePlayCursor.vue'
import Axis from '@/components/Axis.vue'
import WaveformContainer from '@/components/WaveformContainer.vue'

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
    InteractivePlayCursor
  },
  setup () {
    return {
    }
  }
})
</script>

<style lang="less" scoped>
.tracks {
  position: relative;
}
</style>
