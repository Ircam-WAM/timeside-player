<template>
  <div class="tracks-container">
    <div class="tracks">
      <WaveformContainer
        :item-id="itemId"
        :start="selection.start"
        :stop="selection.stop"
        :nb-pixels="2048"
      />
      <!-- Let's add more tracks here later -->
    </div>
    <div class="tracks-plugins">
      <svg
        width="100%"
        height="100%"
        style="display: block;"
      >
        <PlayCursor
          :selection="selection"
        />
      </svg>
      <Axis
        :first-time="selection.start"
        :last-time="selection.stop"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType
} from '@vue/composition-api'

import PlayCursor from '@/components/PlayCursor.vue'
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
    WaveformContainer,
    Axis,
    PlayCursor
  }
})
</script>

<style lang="less" scoped>
.tracks-container {
  position: relative;

  & > .tracks-plugins {
    height: 100%;
    position: absolute;
    top: 0;
  }
}
</style>
