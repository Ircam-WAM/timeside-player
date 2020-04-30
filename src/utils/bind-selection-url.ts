import {
  Ref,
  computed,
  onMounted,
  watch
} from '@vue/composition-api'

import useRouter from '@/utils/use-router'
import { assertIsDefined } from '@/utils/type-assert'
import { useStore } from '@/store/index'

import { Region as RegionType } from '@/types/region'

export default function bindSelectionUrl(selection: Ref<RegionType | undefined>) {
  const { route, router } = useRouter()
  const store = useStore()

  const onReady = () => {
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
      const { start: startRaw, stop: stopRaw } = route.value.query
      if (Array.isArray(startRaw) || Array.isArray(stopRaw)) {
        return undefined
      }
      if (!startRaw || !stopRaw) {
        return undefined
      }
      const start = parseInt(startRaw)
      const stop = parseInt(stopRaw)
      if (isNaN(start) || isNaN(start)) {
        return undefined
      }
      const max = Math.round(store.state.audio.duration)
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
      // Do not set selection if query params are invalid
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
    watch([ queryParamsAsSelection ], () => {
      setSelection()
    })

    // Update query params when selection changes
    watch([ selectionAsQueryParams ], () => {
      setQueryParams()
    })
  }

  // We need audio.isReady to be true before handling query parameters
  // Because we need to check if the query parameters are valid
  // according to the audio's length
  const ready = computed(() => store.getters.audio.isReady === true)

  onMounted(() => {
    const stopReadyWatcher = watch([ ready ], () => {
      if (ready.value !== true) {
        return
      }
      onReady()
      if (stopReadyWatcher) {
        stopReadyWatcher()
      }
    })
  })
}
