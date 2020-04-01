import { Ref, ref, onMounted, onUnmounted } from '@vue/composition-api'
import { assertIsDefined } from '@/utils/type-assert'

export default function useBoundingClientRect(el: Ref<Element | undefined>): Ref<ClientRect> {
  let observer: ResizeObserver
  const clientRect: Ref<ClientRect> = ref({ x: 0, y: 0, width: 0, height: 0 })

  // Set initial value
  onMounted(() => {
    assertIsDefined(el.value)
    clientRect.value = el.value.getBoundingClientRect()
  })

  // start ResizeObserver
  onMounted(() => {
    if (!ResizeObserver) {
      console.warn('ResizeObserver not implemented in your browser. See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#Browser_compatibility')
      return
    }

    observer = new ResizeObserver(entries => {
      assertIsDefined(el.value)
      const resized = entries.filter(e => e.target === el.value)
      assertIsDefined(resized)
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
