import {
  ref,
  reactive,
  InjectionKey,
  inject
} from 'vue'
import { useApi, Annotation } from '@/utils/api'

export interface EditingAnnotation {
  annotation: Annotation
  annotationTrack: string
}

export interface AnnotationStore {
  annotations: Map<string, Annotation[]>

  editingAnnotation?: EditingAnnotation

  fetch: (uuid: string) => Promise<void>
  loadingFetch: boolean
  errorFetch: Response | Error | undefined

  toggleAnnotationTrack: (uuid: string) => void
  addAnnotation: (annotationTrackUuid: string, annotation: Annotation) => void
  editAnnotation: (annotation: Annotation) => void
  removeEditingAnnotation: () => void
}

export function createAnnotationStore (): AnnotationStore {
  const { api } = useApi()
  const annotations = ref(new Map<string, Annotation[]>())
  const editingAnnotation = ref<EditingAnnotation>()

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

  async function toggleAnnotationTrack (annotationTrackUuid: string): Promise<void> {
    if (annotations.value.has(annotationTrackUuid)) {
      annotations.value.delete(annotationTrackUuid)
    } else {
      await fetch(annotationTrackUuid)
    }
  }

  function addAnnotation (annotationTrackUuid: string, a: Annotation): void {
    if (annotations.value.has(annotationTrackUuid)) {
      let annotationsList = annotations.value.get(annotationTrackUuid)
      if (annotationsList === undefined) {
        annotationsList = [ a ]
      } else {
        annotationsList.push(a)
      }
      annotations.value.set(annotationTrackUuid, annotationsList)
    }
  }

  function editAnnotation (a: Annotation): void {
    if (editingAnnotation.value !== undefined) {
      const annotationsList = annotations.value.get(editingAnnotation.value.annotationTrack)
      if (annotationsList !== undefined) {
        annotationsList[annotationsList.indexOf(editingAnnotation.value.annotation)] = a
        annotations.value.set(editingAnnotation.value.annotationTrack, annotationsList)
        editingAnnotation.value = undefined
      }
    }
  }

  function removeEditingAnnotation (): void {
    if (editingAnnotation.value !== undefined) {
      const annotationsList = annotations.value.get(editingAnnotation.value.annotationTrack)
      if (annotationsList !== undefined) {
        const index = annotationsList.indexOf(editingAnnotation.value.annotation)
        if (index > -1) {
          annotationsList.splice(index, 1)
        }
        editingAnnotation.value = undefined
      }
    }
  }

  return reactive({
    annotations,
    editingAnnotation,

    fetch,
    loadingFetch,
    errorFetch,

    toggleAnnotationTrack,
    addAnnotation,
    editAnnotation,
    removeEditingAnnotation
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
