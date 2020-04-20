import { Ref, ref, onMounted, onUnmounted } from '@vue/composition-api'
import { assertIsDefined } from '@/utils/type-assert'
import ResizeObserverPolyfill from 'resize-observer-polyfill';

export default function useBoundingClientRect(el: Ref<Element | undefined>): Ref<ClientRect> {
  let observer: ResizeObserver
  const clientRect = ref<DOMRectReadOnly>({ x: 0, y: 0, width: 0, height: 0 })

  // Set initial value
  onMounted(() => {
    assertIsDefined(el.value)
    clientRect.value = el.value.getBoundingClientRect()
  })

  // start ResizeObserver
  onMounted(() => {
    observer = new ResizeObserverPolyfill(entries => {
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
  onUnmounted(() => {
    if (observer) {
      assertIsDefined(el.value)
      observer.unobserve(el.value)
    }
  })

  return clientRect
}
