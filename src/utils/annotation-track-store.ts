import {
  ref,
  onMounted,
  watch,
  ComputedRef,
  reactive
} from '@vue/composition-api'
import api, { AnnotationTrack } from '@/utils/api'

export interface AnnotationTrackStore {
  annotationTracks: AnnotationTrack[] | undefined;
  loading: boolean;
  error: Response | Error | undefined;
  add (at: AnnotationTrack): void;
  remove (uuid: string): void;
  getLastAdded(): AnnotationTrack | undefined;
}

export default function (itemUuid: ComputedRef<string>): AnnotationTrackStore {
  const annotationTracks = ref<AnnotationTrack[]>()
  const loading = ref(false)
  const error = ref<Response | Error | undefined>()

  onMounted(() => watch(itemUuid, async () => {
    await fetch()
  }, { immediate: true }))

  async function fetch () {
    loading.value = true
    try {
      // Reverse array to show last-recently-added item first
      annotationTracks.value = (await api.listAnnotationTracks({ itemUuid: itemUuid.value })).reverse()
    } catch (e) {
      error.value = e
    }
    loading.value = false
  }

  function add (at: AnnotationTrack) {
    annotationTracks.value = annotationTracks.value || []
    annotationTracks.value.unshift(at)
  }

  function remove (uuid: string) {
    if (!annotationTracks.value) {
      return
    }
    annotationTracks.value = annotationTracks.value.filter(at => at.uuid !== uuid)
  }

  function getLastAdded () {
    if (!annotationTracks.value) {
      return
    }
    return annotationTracks.value[0]
  }

  return reactive({
    annotationTracks,
    loading,
    error,

    add,
    remove,

    getLastAdded
  })
}
