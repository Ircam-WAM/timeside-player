import {
  ref,
  onMounted,
  watch,
  ComputedRef,
  reactive
} from 'vue'
import { useApi, AnalysisTrack } from '@/utils/api'

export interface AnalysisTrackStore {
  analysisTracks: AnalysisTrack[] | undefined
  loading: boolean
  error: Response | Error | undefined
  add: (at: AnalysisTrack) => void
  remove: (uuid: string) => void
}

export default function (itemUuid: ComputedRef<string>): AnalysisTrackStore {
  const { api } = useApi()
  const analysisTracks = ref<AnalysisTrack[]>()
  const loading = ref(false)
  const error = ref<Response | Error | undefined>()

  onMounted(() => watch(itemUuid, async () => {
    await fetch()
  }, { immediate: true }))

  async function fetch (): Promise<void> {
    loading.value = true
    try {
      // Reverse array to show last-recently-added item first
      analysisTracks.value = (await api.listAnalysisTracks({ itemUuid: itemUuid.value })).reverse()
    } catch (e) {
      error.value = e
    }
    loading.value = false
  }

  function add (at: AnalysisTrack): void {
    analysisTracks.value = analysisTracks.value ?? []
    analysisTracks.value.unshift(at)
  }

  function remove (uuid: string): void {
    if (analysisTracks.value === undefined) {
      return
    }
    analysisTracks.value = analysisTracks.value.filter(at => at.uuid !== uuid)
  }

  return reactive({
    analysisTracks,
    loading,
    error,

    add,
    remove
  })
}
