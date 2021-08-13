import { ComputedRef, Ref, ref, onMounted, computed, watch } from 'vue'

import { useApi, RetrieveItemWaveformRequest, ItemWaveformWaveform as WaveformTypeApi } from '@/utils/api'
import { Waveform as WaveformType, WaveformSegment } from '@/types/waveform'

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
    const isEqualFloat = (a: number, b: number): boolean => Math.abs(a - b) <= 0.0001
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
  const emptyPoints = waveformApi.min.filter((min, idx) => min === waveformApi.max[idx])
  if (emptyPoints.length > waveformApi.min.length / 4) {
    console.error('Unexpected waveform: waveform has too many empty points (min = max)', emptyPoints)
    // Not returning false for testing purposes
  }
  return true
}

interface UseWaveformReturn {
  isLoading: Ref<boolean>
  isValid: ComputedRef<boolean>
  error: Ref<Response | undefined>
  waveform: ComputedRef<WaveformType | undefined>
}

export default function useWaveform (params: ComputedRef<RetrieveItemWaveformRequest>): UseWaveformReturn {
  const { newAbortableApi } = useApi()
  const isLoading = ref<boolean>(false)
  const error = ref<Response>()
  const waveformApi = ref<WaveformTypeApi>()

  const waveform = computed(() => {
    if (waveformApi.value === undefined) {
      return undefined
    }
    return toWaveformSegments(waveformApi.value)
  })

  const isValid = computed(() => {
    if (waveformApi.value === undefined) {
      return false
    }
    if (!hasValidLength(waveformApi.value)) {
      console.error('Unexpected waveform: waveform has invalid length', waveformApi.value)
      return false
    }
    return hasValidValues(waveformApi.value)
  })

  let abortController: AbortController | undefined

  const retrieve = async (): Promise<void> => {
    // If a request is already ongoing, we abort it
    if (abortController !== undefined) {
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
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new DOMException('', 'AbortError')
      }
      if (resp.waveform === undefined) {
        throw new Error('waveform is empty')
      }
      waveformApi.value = resp.waveform
      error.value = undefined
      abortController = undefined
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      error.value = err
    }

    isLoading.value = false
  }

  // on mount and when request parameters are updated => update the waveform's data
  onMounted(() => watch([ params ], () => {
    isLoading.value = true
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    retrieve()
  }, { immediate: true }))

  return {
    isLoading,
    error,
    isValid,
    waveform
  }
}
