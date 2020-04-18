import { Ref, ref, onMounted, computed, watch } from '@vue/composition-api'

import { newAbortableApi, RetrieveItemWaveformRequest } from '@/utils/api'
import { Waveform as WaveformType, WaveformSegment } from '@/types/waveform'
import { ItemWaveformWaveform as WaveformTypeApi } from '@/utils/api'

// Convert the api format for easier usage
function toWaveformSegments (waveformApi: WaveformTypeApi): WaveformType {
  const data: WaveformSegment[] = []
  for (const i of waveformApi.time.keys()) {
    data[i] = {
      time: waveformApi.time[i], // from seconds to milliseconds
      min: waveformApi.min[i],
      max: waveformApi.max[i]
    }
  }

  const allVals = waveformApi.min.concat(waveformApi.max)
  const maxVal = Math.max(...allVals)
  const minVal = Math.min(...allVals)

  return {
    data,
    meta: {
      maxVal,
      minVal
    }
  }
}

// Check waveform's data length
function hasValidLength (waveformApi: WaveformTypeApi): boolean {
  return (waveformApi.time.length > 0) &&
    (waveformApi.time.length === waveformApi.min.length) &&
    (waveformApi.min.length === waveformApi.max.length)
}

function hasValidValues (waveformApi: WaveformTypeApi): boolean {
  const arrayHasConstantValues = (arr: number[]): boolean => {
    const isEqualFloat = (a: number, b: number) => Math.abs(a - b) <= 0.0001
    return arr.every((val: number) => isEqualFloat(val, arr[0]))
  }

  if (arrayHasConstantValues(waveformApi.min)) {
    console.error('Unexpected waveform: waveform.min has constant values', waveformApi.min)
    return false
  }
  if (arrayHasConstantValues(waveformApi.max)) {
    console.error('Unexpected waveform: waveform.max has constant values', waveformApi.max)
    return false
  }
  return true
}

// FIXME: This type will be defined by vue@3
type ComputedRef<T> = Readonly<Ref<Readonly<T>>>

interface UseWaveformReturn {
  isLoading: ComputedRef<boolean>;
  isValid: ComputedRef<boolean>;
  error: ComputedRef<Response | undefined>;
  waveform: ComputedRef<WaveformType | undefined>;
}

export default function useWaveform(params: ComputedRef<RetrieveItemWaveformRequest>): UseWaveformReturn {
  const isLoading = ref<boolean>(false)
  const error = ref<Response>()
  const waveformApi = ref<WaveformTypeApi>()

  const waveform = computed(() => {
    if (!waveformApi.value) {
      return undefined
    }
    return toWaveformSegments(waveformApi.value)
  })

  const isValid = computed(() => {
    if (!waveformApi.value) {
      return false
    }
    if (!hasValidLength(waveformApi.value)) {
      console.error('Unexpected waveform: waveform has invalid length', waveformApi.value)
      return false
    }
    return hasValidValues(waveformApi.value)
  })

  let abortController: AbortController | undefined = undefined

  const retrieve = async () => {
    // If a request is already ongoing, we abort it
    if (abortController) {
      abortController.abort()
    }

    isLoading.value = true

    try {
      // Use an AbortController to abort fetch requests
      abortController = new AbortController()
      const api = newAbortableApi(abortController)
      const resp = await api.retrieveItemWaveform(params.value)
      // Check exception after the fetch call
      // in the case where the request had time to finish
      if (abortController.signal.aborted) {
        throw new DOMException('', 'AbortError')
      }
      if (!resp.waveform) {
        throw new Error('waveform is empty')
      }
      waveformApi.value = resp.waveform
      error.value = undefined
      abortController = undefined
    } catch (err) {
      if (err.name === 'AbortError') {
        return
      }
      error.value = err
    }

    isLoading.value = false
  }

  // on mount and when request parameters are updated => update the waveform's data
  onMounted(() => watch([ params ], (value, oldValue, onInvalidate) => {
    isLoading.value = true

    // Delay the API call to optimize performance
    const delayed = setTimeout(() => {
      retrieve()
    }, 100)

    // If value is updated before
    onInvalidate(() => {
      clearTimeout(delayed)
    })
  }))

  return {
    isLoading,
    error,
    isValid,
    waveform,
  }
}
