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

  // We need audio.isReady to be true before handling query parameters
  // Because we need to check if the query parameters are valid
  // according to the audio's length
  const ready = computed(() => store.getters.audio.isReady === true)

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
  onMounted(() => watch([ ready, queryParamsAsSelection ], () => {
    if (!ready.value) {
      return
    }
    setSelection()
  }))

  // Update query params when selection changes
  onMounted(() => watch([ ready, selectionAsQueryParams ], (value, oldValue, onInvalidate) => {
    if (!ready.value) {
      return
    }

    // Add delay to optimize performance
    const delayed = setTimeout(() => {
      setQueryParams()
    }, 100)

    // If value is updated before
    onInvalidate(() => {
      clearTimeout(delayed)
    })
  }))

}
