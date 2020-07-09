<template>
  <div
    ref="el"
    class="player"
  >
    <Audio :audio-srcs="audioSrcs" />
    <div v-if="audioReady">
      <!--
        These components need audio to be loaded because
        they need audio's duration to compute position
      -->
      <Controls />
      <Timer />
      <MainTrack
        :item-id="item.uuid"
        :selection="selection"
        @selection="onSelection"
      />
      <AnnotationTracks :item-id="item.uuid" />
      <SelectionTracks
        v-if="selection"
        :item-id="item.uuid"
        :selection="selection"
      />
    </div>
    <div v-else>
      Loading audio file...
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  computed
} from '@vue/composition-api'

import { useStore } from '@/store/index'
import { Item } from '@/utils/api'
import { assertIsDefined } from '@/utils/type-assert'
import { providePlayerRect } from '@/utils/use-player-rect'
import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { Region as RegionType } from '@/types/region'

import bindSelectionUrl from '@/utils/bind-selection-url'

import Controls from '@/components/Controls.vue'
import Timer from '@/components/Timer.vue'
import Audio from '@/components/Audio.vue'
import MainTrack from '@/components/tracks/MainTrack.vue'
import SelectionTracks from '@/components/tracks/SelectionTracks.vue'
import AnnotationTracks from '@/components/annotation/AnnotationTracks.vue'

export default defineComponent({
  name: 'Player',
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true
    }
  },
  components: {
    Audio,
    Timer,
    MainTrack,
    SelectionTracks,
    Controls,
    AnnotationTracks
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

    const audioSrcs = computed(() => {
      assertIsDefined(item.uuid)
      return store.getters.items.getAudioSrcs(item.uuid)
    })
    const audioReady = computed(() => store.getters.audio.isReady)

    const onSelection = (val?: RegionType) => {
      selection.value = val
    }

    bindSelectionUrl(selection)

    return {
      el,
      onSelection,
      selection,
      audioSrcs,
      audioReady
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
