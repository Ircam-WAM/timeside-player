<template>
  <div class="annotation" :style="style" :title="annotation.uuid">
    <div class="title-box">
      <p class="title">
        {{ annotation.title }}
      </p>
      <p v-if="annotation.description" class="description">
        {{ annotation.description }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed
} from 'vue'

import useTrackHelpers from '@/utils/use-track-helpers'
import { Annotation } from '@/utils/api'

export default defineComponent({
  props: {
    annotation: {
      type: Object as PropType<Annotation>,
      required: true
    }
  },
  setup (props) {
    const { timeToPosition } = useTrackHelpers()

    const style = computed(() => {
      const left = timeToPosition((props.annotation.startTime || 0) * 1000)
      const right = timeToPosition(props.annotation.stopTime * 1000)

      // https://stackoverflow.com/a/3426956
      function hashCode (str: string) {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash)
        }
        return hash
      }

      function intToRGB (i: number) {
        const c = (i & 0x00FFFFFF)
          .toString(16)
          .toUpperCase()

        return '00000'.substring(0, 6 - c.length) + c
      }

      function hexToRgb (hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        if (!result) {
          return null
        }
        return {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      }

      const style: Record<string, string> = {
        left: `${left}px`,
        width: `${right - left}px`
      }

      // Generate annotation color from title
      if (props.annotation.title) {
        const hex = intToRGB(hashCode(props.annotation.title))
        const rgb = hexToRgb(hex)
        if (rgb) {
          style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
        }
      }

      return style
    })

    return {
      style
    }
  }
})
</script>

<style lang="less" scoped>
.annotation {
  position: absolute;
  background: grey;
  display: inline-block;
  margin: 0;
  top: 0;
  height: 100%;
  cursor: pointer;

  opacity: 0.5;
  &:hover {
    opacity: 1;
  }

  & .title-box {
    position: absolute;
    top: 0;
    background-color: inherit;
    min-width: 100%;
    color: white;
    font-size: 18px;
    padding: 7px 20px;

    & p {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 3px;
      }
    }

    & .title {
      font-weight: bold;
    }
  }
}
</style>
