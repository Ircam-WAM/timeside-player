<template>
  <div class="maintrack-and-axis-container">
    <div class="maintrack-container">
      <WaveformContainer
        class="maintrack"
        :item-id="itemId"
      />
      <TrackPluginsContainer class="track-plugins-container">
        <Region v-model="innerSelection" />
        <InteractivePlayCursor />
      </TrackPluginsContainer>
    </div>
    <Axis
      :first-time="0"
      :last-time="lastTime"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  PropType,
  computed
} from 'vue'

import { useAudioStore } from '@/store/audio'
import { Region as RegionType } from '@/types/region'

import TrackPluginsContainer from '@/components/track-elements/TrackPluginsContainer.vue'
import InteractivePlayCursor from '@/components/track-elements/InteractivePlayCursor.vue'
import Region from '@/components/track-elements/Region.vue'
import WaveformContainer from '@/components/track-elements/WaveformContainer.vue'
import Axis from '@/components/track-elements/Axis.vue'

export default defineComponent({
  components: {
    WaveformContainer,
    TrackPluginsContainer,
    InteractivePlayCursor,
    Region,
    Axis
  },
  props: {
    itemId: {
      type: String,
      required: true
    },
    selection: {
      type: Object as PropType<RegionType>,
      required: false,
      default: undefined
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

    return {
      // Use a different name to avoid namespace conflicts with `selection` props
      innerSelection: selection,
      lastTime: computed(() => audioStore.state.duration)
    }
  }
})
</script>

<style lang="less" scoped>
.maintrack-and-axis-container{
  margin-left: 50px;
}
.maintrack-container {
  position: relative;
}

.maintrack {
  height: 70px;
}
</style>
