import {
  ref,
  onMounted,
  watch,
  ComputedRef,
  Ref
} from '@vue/composition-api'
import api, { AnnotationTrack } from '@/utils/api'

export interface AnnotationTrackStore {
  annotationTracks: Ref<AnnotationTrack[] | undefined>;
  loading: Ref<boolean>;
  error: Ref<Response | Error | undefined>;
  add (at: AnnotationTrack): void;
  remove (uuid: string): void;
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

  return {
    annotationTracks,
    loading,
    error,

    add,
    remove
  }
}
