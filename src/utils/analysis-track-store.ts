import {
  ref,
  onMounted,
  watch,
  ComputedRef,
  Ref
} from '@vue/composition-api'
import api, { AnalysisTrack } from '@/utils/api'

export interface AnalysisTrackStore {
  analysisTracks: Ref<AnalysisTrack[] | undefined>;
  loading: Ref<boolean>;
  error: Ref<Response | Error | undefined>;
  add (at: AnalysisTrack): void;
  remove (uuid: string): void;
}

export default function (itemUuid: ComputedRef<string>): AnalysisTrackStore {
  const analysisTracks = ref<AnalysisTrack[]>()
  const loading = ref(false)
  const error = ref<Response | Error | undefined>()

  onMounted(() => watch(itemUuid, async () => {
    await fetch()
  }, { immediate: true }))

  async function fetch () {
    loading.value = true
    try {
      // Reverse array to show last-recently-added item first
      analysisTracks.value = (await api.listAnalysisTracks({ itemUuid: itemUuid.value })).reverse()
    } catch (e) {
      error.value = e
    }
    loading.value = false
  }

  function add (at: AnalysisTrack) {
    analysisTracks.value = analysisTracks.value || []
    analysisTracks.value.unshift(at)
  }

  function remove (uuid: string) {
    if (!analysisTracks.value) {
      return
    }
    analysisTracks.value = analysisTracks.value.filter(at => at.uuid !== uuid)
  }

  return {
    analysisTracks,
    loading,
    error,

    add,
    remove
  }
}
