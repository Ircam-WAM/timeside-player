import {
  onMounted,
  watch,
  Ref,
  ref
} from 'vue'

import { useApi, AnalysisTrack, Result, TimesideApi } from '@/utils/api'
import { getUuidFromResultUrl } from '@ircam/timeside-sdk'

async function timeout (ms: number): Promise<void> {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

async function getResult (input: AnalysisTrack, api: TimesideApi, abortController: AbortController): Promise<Result> {
  if (input.uuid === undefined) {
    throw new Error(`Analysis has empty UUID: ${JSON.stringify(input)}`)
  }

  // polls analysisTrack every X seconds
  // In the future, we may implement a websocket (or related) to get a notification from the server
  // See https://github.com/Ircam-WAM/TimeSide/issues/193
  let at = input
  while (at.resultUrl === 'Task running') {
    await timeout(5000)
    if (abortController.signal.aborted) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new DOMException('Aborted', 'AbortError')
    }
    at = await api.retrieveAnalysisTrack({ uuid: input.uuid })
  }

  if (at.resultUrl === undefined) {
    throw new Error(`AnalysisTrack has no resultUrl: ${JSON.stringify(at)}`)
  }

  let resultUuid
  try {
    resultUuid = getUuidFromResultUrl(at.resultUrl)
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(
        `Unable to get UUID for analysisTrack.result_url (${e.message}) ` +
        JSON.stringify(input)
      )
    } else {
      throw e
    }
  }

  return await api.retrieveResult({ uuid: resultUuid }) as Result
}

interface ResultReturn {
  result: Ref<Result | undefined>
  error: Ref<Response | undefined>
  loading: Ref<boolean>
}

export default function useResult (analysisTrack: Ref<AnalysisTrack>): ResultReturn {
  const { newAbortableApi } = useApi()
  const result = ref<Result | undefined>(undefined)
  const error = ref<Response | undefined>(undefined)
  const loading = ref(true)

  let abortController: AbortController | undefined

  async function setResult (): Promise<void> {
    loading.value = true
    error.value = undefined

    // If a request is already ongoing, we abort it
    if (abortController !== undefined) {
      abortController.abort()
    }

    try {
      abortController = new AbortController()
      const abortApi = newAbortableApi(abortController)
      const newResult = await getResult(analysisTrack.value, abortApi, abortController)
      result.value = newResult
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      error.value = err
    }
    loading.value = false
  }

  // Fetch analysisTrack when updated
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  onMounted(() => { watch(analysisTrack, () => { setResult() }, { immediate: true }) })

  return {
    result,
    loading,
    error
  }
}
