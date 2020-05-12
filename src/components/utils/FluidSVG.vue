<template>
  <!--
    We have to use a div wrapper for ResizeObserver
    ResizeObserver is not working yet on SVG elements (as of 04/2020)
    See https://github.com/w3c/csswg-drafts/issues/4032#issuecomment-510137495
    For firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1565557
  -->
  <div ref="el">
    <svg
      class="fluid-svg"
      :height="svgSize.height"
      :width="svgSize.width"
      :viewBox="`0 0 ${svgSize.width} ${svgSize.height}`"
    >
      <slot />
    </svg>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  watchEffect
} from '@vue/composition-api'

import useBoundingClientRect from '@/utils/use-bounding-client-rect'

export default defineComponent({
  setup (_, { emit }) {
    const el = ref()
    const svgSize: Ref<ClientRect> = useBoundingClientRect(el)

    watchEffect(() => {
      emit('resized', svgSize.value)
    })

    return {
      el,
      svgSize
    }
  }
})
</script>

<style lang="less" scoped>
.fluid-svg {
  /*
    Avoid infinite re-render loop when no size is set
    SVG is set as inline element by default
    See https://stackoverflow.com/a/27834092
  */
  display: block;
}
</style>
