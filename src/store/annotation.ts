import {
  ref,
  ComputedRef,
  reactive,
  InjectionKey,
  inject
} from 'vue'
import { useApi, Annotation } from '@/utils/api'

export interface AnnotationStore {
  annotations: Map<string, Annotation[]>

  fetch: (uuid: string) => Promise<void>
  loadingFetch: boolean
  errorFetch: Response | Error | undefined

  toggleAnnotationTrack: (uuid: string) => void
  addAnnotation: (annotationTrackUuid: string,annotation: Annotation) => void
}

export function createAnnotationStore (): AnnotationStore {
  const { api } = useApi()
  const annotations = ref(new Map<string, Annotation[]>())

  const loadingFetch = ref(false)
  const errorFetch = ref<Response | Error | undefined>()

  async function fetch (annotationTrackUuid: string): Promise<void> {
    loadingFetch.value = true
    try {
      const annotationsList = await api.listAnnotations({ trackUuid: annotationTrackUuid })
      annotations.value.set(annotationTrackUuid, annotationsList)
    } catch (e) {
      errorFetch.value = e
    }
    loadingFetch.value = false
  }

  function toggleAnnotationTrack (annotationTrackUuid: string): void {
    if (annotations.value.has(annotationTrackUuid)) {
      annotations.value.delete(annotationTrackUuid)
    } else {
      fetch (annotationTrackUuid)
      for (const a of annotations.value.keys()) {
        console.log(a)
      }
    }
  }

  function addAnnotation (annotationTrackUuid: string, a: Annotation): void {
    if (annotations.value.has(annotationTrackUuid)){
      let annotationsList = annotations.value.get(annotationTrackUuid)
      if (annotationsList === undefined) {
        annotationsList = [a]
      } else {
        annotationsList.push(a)
      }
      annotations.value.set(annotationTrackUuid, annotationsList)
    }
  }

  return reactive({
    annotations,

    fetch,
    loadingFetch,
    errorFetch,

    toggleAnnotationTrack,
    addAnnotation,
  })
}

export const annotationStoreKey: InjectionKey<AnnotationStore> = Symbol('annotation-store')

export function useAnnotationStore (): AnnotationStore {
  const resolved = inject(annotationStoreKey)
  if (resolved === undefined) {
    throw new Error('store not found')
  }
  return resolved
}
