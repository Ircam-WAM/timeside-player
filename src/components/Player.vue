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
      <Timer />
      <MainTrack
        :item-id="item.uuid"
        :selection="selection"
        @selection="onSelection"
      />
      <div
        v-if="selection"
        class="tracks"
      >
        <WaveformContainer
          :item-id="item.uuid"
          :start="selection.start / 1000"
          :stop="selection.stop / 1000"
          :nb-pixels="2048"
        />
      </div>
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
  Ref,
  PropType,
  watch,
  onMounted,
  computed
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
  setup ({ item }, context) {
    // item.uuid should always be defined
    assertIsDefined(item.uuid)

    // Reactive router
    const route = computed(() => context.root.$route)
    const router = computed(() => context.root.$router)

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

    const selectionAsQueryParams = computed(() => {
      const queryFmt = (val: number) => val.toString()
      if (!selection.value) {
        return {
          start: undefined,
          stop: undefined
        }
      } else {
        return {
          start: queryFmt(selection.value.start),
          stop: queryFmt(selection.value.stop)
        }
      }
    })

    const queryParamsAsSelection = computed(() => {
      // Leave if duration is 0
      if (!audioReady.value) {
        return undefined
      }
      const { start: startRaw, stop: stopRaw } = route.value.query
      if (Array.isArray(startRaw) || Array.isArray(stopRaw)) {
        return undefined
      }
      if (!startRaw || !stopRaw) {
        return undefined
      }
      let start = parseInt(startRaw)
      let stop = parseInt(stopRaw)
      if (isNaN(start) || isNaN(start)) {
        return undefined
      }
      if (start > store.state.audio.duration) {
        start = store.state.audio.duration
      }
      if (stop > store.state.audio.duration) {
        stop = store.state.audio.duration
      }
      return {
        start,
        stop
      }
    })

    const setQueryParams = () => {
      const { start, stop } = selectionAsQueryParams.value

      // Avoid 'NavigationDuplicated' error from vue-route
      const { start: oldStart, stop: oldStop } = route.value.query
      if (start === oldStart && stop === oldStop) {
        return
      }

      assertIsDefined(route.value.name)
      // Set query params
      router.value.replace({
        ...route.value,
        name: route.value.name, // for typescript
        query: {
          ...route.value.query,
          start,
          stop
        }
      })
    }

    const setSelection = () => {
      if (!queryParamsAsSelection.value) {
        return
      }
      const { start, stop } = queryParamsAsSelection.value
      // Do not update when value has not changed
      if (selection.value !== undefined &&
          start === selection.value.start && stop === selection.value.stop) {
        return
      }

      selection.value = {
        start,
        stop
      }

      // set back query parameters for when start > store.state.audio.duration
      setQueryParams()
    }

    // Update selection when query params changes
    onMounted(() => watch([ queryParamsAsSelection ], () => {
      setSelection()
    }))

    // Update query params when selection changes
    onMounted(() => watch([ selectionAsQueryParams ], (value, oldValue, onInvalidate) => {
      // Add delay to optimize performance
      const delayed = setTimeout(() => {
        setQueryParams()
      }, 100)

      // If value is updated before
      onInvalidate(() => {
        clearTimeout(delayed)
      })
    }))

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
