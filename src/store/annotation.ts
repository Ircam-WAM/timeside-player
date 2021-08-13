import {
  ref,
  onMounted,
  watch,
  ComputedRef,
  reactive
} from 'vue'
import { useApi, Annotation } from '@/utils/api'

export interface AnnotationStore {
  annotations: Annotation[] | undefined

  fetch: () => Promise<void>
  loadingFetch: boolean
  errorFetch: Response | Error | undefined

  add: (at: Annotation) => void
  remove: (uuid: string) => void
}

export default function (annotationTrackUuid: ComputedRef<string>): AnnotationStore {
  const { api } = useApi()
  const annotations = ref<Annotation[]>()

  const loadingFetch = ref(false)
  const errorFetch = ref<Response | Error | undefined>()

  onMounted(() => watch(annotationTrackUuid, async () => {
    await fetch()
  }, { immediate: true }))

  async function fetch (): Promise<void> {
    loadingFetch.value = true
    try {
      annotations.value = await api.listAnnotations({ trackUuid: annotationTrackUuid.value })
    } catch (e) {
      errorFetch.value = e
    }
    loadingFetch.value = false
  }

  function add (a: Annotation): void {
    annotations.value = annotations.value ?? []
    annotations.value.push(a)
  }

  function remove (uuid: string): void {
    if (annotations.value === undefined) {
      return
    }
    annotations.value = annotations.value.filter(a => a.uuid !== uuid)
  }

  return reactive({
    annotations,

    fetch,
    loadingFetch,
    errorFetch,

    add,
    remove
  })
}
