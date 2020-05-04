<template>
  <div>
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
  onMounted,
  onUnmounted,
  ref,
  watch,
  PropType,
  computed
} from '@vue/composition-api'

import { useStore } from '@/store/index'
import { PlayState } from '@/store/audio'
import { Region as RegionType } from '@/types/region'

import TrackPluginsContainer from '@/components/TrackPluginsContainer.vue'
import InteractivePlayCursor from '@/components/InteractivePlayCursor.vue'
import Region from '@/components/Region.vue'
import WaveformContainer from '@/components/WaveformContainer.vue'
import Axis from '@/components/Axis.vue'

export default defineComponent({
  props: {
    itemId: {
      type: String,
      required: true
    },
    selection: {
      type: Object as PropType<RegionType>,
      required: false
    }
  },
  components: {
    WaveformContainer,
    TrackPluginsContainer,
    InteractivePlayCursor,
    Region,
    Axis
  },
  setup (props, { emit }) {
    const store = useStore()
    const selection = ref<RegionType>()

    // two-way data binding
    watch([ () => props.selection ], () => {
      selection.value = props.selection
    })
    watch([ selection ], () => {
      emit('selection', selection.value)
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        switch (store.state.audio.playState) {
          case PlayState.Play:
            store.commit.audio.setPlayState(PlayState.Pause)
            break
          case PlayState.Stop:
          case PlayState.Pause:
            store.commit.audio.setPlayState(PlayState.Play)
            break
          default:
            console.error('Unknown PlayState', store.state.audio.playState)
        }
      }
    }

    onMounted(() => { window.addEventListener('keydown', onKeyDown) })
    onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })

    return {
      // Use a different name to avoid namespace conflicts with `selection` props
      innerSelection: selection,
      lastTime: computed(() => store.state.audio.duration)
    }
  }
})
</script>

<style lang="less" scoped>
.maintrack-container {
  position: relative;
}
</style>
