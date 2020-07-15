import {
  ref,
  onMounted,
  watch,
  ComputedRef,
  Ref
} from '@vue/composition-api'
import api, { Annotation } from '@/utils/api'

export interface AnnotationStore {
  annotations: Ref<Annotation[] | undefined>;

  fetch (): Promise<void>;
  loadingFetch: ComputedRef<boolean>;
  errorFetch: ComputedRef<Response | Error | undefined>;

  add (at: Annotation): void;
  remove (uuid: string): void;
}

export default function (annotationTrackUuid: ComputedRef<string>): AnnotationStore {
  const annotations = ref<Annotation[]>()

  const loadingFetch = ref(false)
  const errorFetch = ref<Response | Error | undefined>()

  onMounted(() => watch(annotationTrackUuid, async () => {
    await fetch()
  }, { immediate: true }))

  async function fetch () {
    loadingFetch.value = true
    try {
      annotations.value = await api.listAnnotations({ trackUuid: annotationTrackUuid.value })
    } catch (e) {
      errorFetch.value = e
    }
    loadingFetch.value = false
  }

  function add (a: Annotation) {
    annotations.value = annotations.value || []
    annotations.value.push(a)
  }

  function remove (uuid: string) {
    if (!annotations.value) {
      return
    }
    annotations.value = annotations.value.filter(a => a.uuid !== uuid)
  }

  return {
    annotations,

    fetch,
    loadingFetch,
    errorFetch,

    add,
    remove
  }
}
