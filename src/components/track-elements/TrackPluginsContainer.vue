<template>
  <svg
    ref="slotContainer"
    class="track-plugins-container"
    width="100%"
    height="100%"
  >
    <!-- Use of an empty rect to get events -->
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      stroke="black"
      stroke-width="0"
      fill="none"
    />
    <slot />
  </svg>
</template>

<script lang="ts">
import {
  defineComponent,
  InjectionKey,
  Ref,
  provide,
  ref
} from 'vue'

export const slotContainerKey: InjectionKey<Ref<SVGSVGElement | undefined>> = Symbol('track-plugins-container-svg')

export default defineComponent({
  setup () {
    // Provide slotContainer for children
    const slotContainer = ref<SVGSVGElement>()
    provide(slotContainerKey, slotContainer)

    return {
      slotContainer
    }
  }
})
</script>

<style lang="less" scoped>
.track-plugins-container {
  display: block;
  position: absolute;
  top: 0;
  z-index: -1;

  cursor: text;
}
</style>
