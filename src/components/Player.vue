<template>
  <div
    ref="el"
    class="player"
  >
    <Audio :audio-srcs="audioSrcs" />
    <Timer />
    <MainTrack
      :item-id="item.uuid"
      @selection="selection = $event"
    />
    <div
      v-if="selection"
      class="tracks"
    >
      <WaveformContainer
        :item-id="item.uuid"
        :start="selection.start"
        :stop="selection.stop"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  PropType
} from '@vue/composition-api'

import { useStore } from '@/store/index'
import { Item } from '@/utils/api'
import { assertIsDefined } from '@/utils/type-assert'
import { providePlayerRect } from '@/utils/use-player-rect'
import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { Region as RegionType } from '@/types/region'

import WaveformContainer from '@/components/WaveformContainer.vue'
import Timer from '@/components/Timer.vue'
import Audio from '@/components/Audio.vue'
import MainTrack from '@/components/MainTrack.vue'

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

export default defineComponent({
  name: 'Player',
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true
    }
  },
  components: {
    WaveformContainer,
    Audio,
    Timer,
    MainTrack
  },
  setup ({ item }) {
    // item.uuid should always be defined
    assertIsDefined(item.uuid)

    const store = useStore()
    const selection = ref<RegionType>()

    // Get playerRect and provide it for child components
    const el = ref<HTMLElement>()
    const playerSize = useBoundingClientRect(el)
    providePlayerRect(playerSize)

    return {
      el,
      selection,
      audioSrcs: store.getters.items.getAudioSrcs(item.uuid)
    }
  }
})
</script>

<style lang="less" scoped>
.item-metadata {
  margin: 20px;
}

.error {
  color: red;
}
</style>
