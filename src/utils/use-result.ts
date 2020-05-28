import {
  onMounted,
  watch,
  Ref,
  ref
} from '@vue/composition-api'

import { newAbortableApi, AnalysisTrack, Result, TimesideApi, getUuidFromResultUrl } from '@/utils/api'

function timeout (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getResult(input: AnalysisTrack, api: TimesideApi, abortController: AbortController) {
  if (!input.uuid) {
    throw new Error(`Analysis has empty UUID: ${input}`)
  }

  // polls analysisTrack every X seconds
  // In the future, we may implement a websocket (or related) to get a notification from the server
  // See https://github.com/Parisson/TimeSide/issues/193
  let at = input
  while (at.resultUrl === 'Task running') {
    await timeout(5000)
    if (abortController.signal.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    at = await api.retrieveAnalysisTrack({ uuid: input.uuid })
  }

  if (!at.resultUrl) {
    throw new Error(`AnalysisTrack has no resultUrl: ${at}`)
  }

  let resultUuid
  try {
    resultUuid = getUuidFromResultUrl(at.resultUrl)
  } catch (e) {
    throw new Error(
      `Unable to get UUID for analysisTrack.result_url (${e.message}) ` +
      JSON.stringify(input)
    )
  }

  return await api.retrieveResult({ uuid: resultUuid })
}

export default function useResult (analysisTrack: Ref<AnalysisTrack>) {
  const result = ref<Result | undefined>(undefined)
  const error = ref<Response | undefined>(undefined)
  const loading = ref(true)

  let abortController: AbortController | undefined = undefined

  async function setResult () {
    loading.value = true
    error.value = undefined

    // If a request is already ongoing, we abort it
    if (abortController) {
      abortController.abort()
    }

    try {
      abortController = new AbortController()
      const abortApi = newAbortableApi(abortController)
      const newResult = await getResult(analysisTrack.value, abortApi, abortController)
      result.value = newResult
    } catch (err) {
      if (err.name === 'AbortError') {
        return
      }
      error.value = err
    }
    loading.value = false
  }

  // Fetch analysisTrack when updated
  onMounted(() => { watch(analysisTrack, () => { setResult() }) })

  return {
    result,
    loading,
    error
  }
}
