import {
  ref,
  onMounted,
  watch,
  ComputedRef,
  reactive,
  InjectionKey,
  inject
} from 'vue'
import { useApi, AnnotationTrack } from '@/utils/api'

export interface AnnotationTrackStore {
  annotationTracks: AnnotationTrack[] | undefined
  loading: boolean
  error: Response | Error | undefined
  add: (at: AnnotationTrack) => void
  remove: (uuid: string) => void
}

export default function (itemUuid: ComputedRef<string>): AnnotationTrackStore {
  const { api } = useApi()
  const annotationTracks = ref<AnnotationTrack[]>()
  const loading = ref(false)
  const error = ref<Response | Error | undefined>()

  onMounted(() => watch(itemUuid, async () => {
    await fetch()
  }, { immediate: true }))

  async function fetch (): Promise<void> {
    loading.value = true
    try {
      // Reverse array to show last-recently-added item first
      annotationTracks.value = (await api.listAnnotationTracks({ itemUuid: itemUuid.value })).reverse() as AnnotationTrack[]
    } catch (e) {
      error.value = e
    }
    loading.value = false
  }

  function add (at: AnnotationTrack): void {
    annotationTracks.value = annotationTracks.value ?? []
    annotationTracks.value.unshift(at)
  }

  function remove (uuid: string): void {
    if (annotationTracks.value === undefined) {
      return
    }
    annotationTracks.value = annotationTracks.value.filter(at => at.uuid !== uuid)
  }

  return reactive({
    annotationTracks,
    loading,
    error,

    add,
    remove
  })
}

export const annotationTrackStoreKey: InjectionKey<AnnotationTrackStore> = Symbol('annotation-track-store')

export function useAnnotationTrackStore (): AnnotationTrackStore {
  const resolved = inject(annotationTrackStoreKey)
  if (resolved === undefined) {
    throw new Error('store not found')
  }
  return resolved
}
