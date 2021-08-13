import { Ref, ref, onMounted, onBeforeUnmount } from 'vue'
import { assertIsDefined } from '@/utils/type-assert'

export default function useBoundingClientRect (el: Ref<Element | undefined>): Ref<DOMRectReadOnly> {
  let observer: ResizeObserver
  const clientRect = ref<DOMRect>(new DOMRectReadOnly())

  // Set initial value
  onMounted(() => {
    assertIsDefined(el.value)
    clientRect.value = el.value.getBoundingClientRect()
  })

  // start ResizeObserver
  onMounted(() => {
    observer = new ResizeObserver(entries => {
      assertIsDefined(el.value)
      const resized = entries.find(e => e.target === el.value)
      assertIsDefined(resized)
      // resize.contentRect gives the coordinates inside the element parent
      // el.value.getBoundingClientRect gives the coordinates inside the viewport
      // clientRect.value = resized.contentRect as DOMRectReadOnly
      clientRect.value = el.value.getBoundingClientRect()
    })

    assertIsDefined(el.value)
    observer.observe(el.value)
  })

  // stop ResizeObserver
  onBeforeUnmount(() => {
    if (observer !== undefined) {
      assertIsDefined(el.value)
      observer.unobserve(el.value)
    }
  })

  return clientRect
}
