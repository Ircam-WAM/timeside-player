import {
  Ref,
  computed,
  onMounted,
  watch
} from 'vue'

import { useRouter, useRoute } from 'vue-router'
import { assertIsDefined } from '@/utils/type-assert'
import { useAudioStore } from '@/store/audio'

import { Region as RegionType } from '@/types/region'

export default function bindSelectionUrl (selection: Ref<RegionType | undefined>): void {
  const router = useRouter()
  const route = useRoute()
  const audioStore = useAudioStore()

  const onReady = (): void => {
    const selectionAsQueryParams = computed(() => {
      const queryFmt = (val: number): string => val.toString()
      if (selection.value === undefined) {
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
      const { start: startRaw, stop: stopRaw } = route.query
      if (startRaw === null || stopRaw === null) {
        return undefined
      }
      if (Array.isArray(startRaw) || Array.isArray(stopRaw)) {
        return undefined
      }
      if (startRaw === '' || stopRaw === '') {
        return undefined
      }
      const start = parseInt(startRaw)
      const stop = parseInt(stopRaw)
      if (isNaN(start) || isNaN(stop)) {
        return undefined
      }
      const max = Math.round(audioStore.state.duration)
      if (start < 0 || start > max) {
        console.warn('query params: unexpected start value', start)
        return undefined
      }
      if (stop < 0 || stop > max) {
        console.warn('query params: unexpected stop value', stop)
        return undefined
      }
      return {
        start,
        stop
      }
    })

    const setQueryParams = (): void => {
      const { start, stop } = selectionAsQueryParams.value

      // Avoid 'NavigationDuplicated' error from vue-route
      const { start: oldStart, stop: oldStop } = route.query
      if (start === oldStart && stop === oldStop) {
        return
      }

      assertIsDefined(route.name)
      // Set query params
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.replace({
        ...route,
        query: {
          ...route.query,
          start,
          stop
        }
      })
    }

    const setSelection = (): void => {
      // Do not set selection if query params are invalid
      if (queryParamsAsSelection.value === undefined) {
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
    watch([ queryParamsAsSelection ], () => {
      setSelection()
    }, { immediate: true })

    // Update query params when selection changes
    watch([ selectionAsQueryParams ], () => {
      setQueryParams()
    }, { immediate: true })
  }

  // We need audio.isReady to be true before handling query parameters
  // Because we need to check if the query parameters are valid
  // according to the audio's length
  const ready = audioStore.getters.isReady

  onMounted(() => {
    let stopReadyWatcher: ReturnType<typeof watch> | null = null
    stopReadyWatcher = watch([ ready ], () => {
      if (!ready.value) {
        return
      }
      onReady()
      if (stopReadyWatcher !== null) {
        stopReadyWatcher()
      }
    }, { immediate: true })
  })
}
