<template>
  <div class="annotations">
    <CreateAnnotation
      :track-id="trackId"
      @new-annotation="annotations.add($event)"
    />
    <template v-if="annotations">
      <Annotation
        v-for="a of annotations.annotations"
        :key="a.uuid"
        :annotation="a"
        class="annotation"
        @click.native="$emit('select-annotation', a)"
        @destroy="annotations.remove($event)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed
} from '@vue/composition-api'

import Annotation from '@/components/annotation/Annotation.vue'
import CreateAnnotation from '@/components/annotation/CreateAnnotation.vue'
import { AnnotationStore } from '@/utils/annotation-store'
import { Region as RegionType } from '@/types/region'

export default defineComponent({
  props: {
    trackId: {
      type: String,
      required: true
    },
    annotations: {
      type: Object as PropType<AnnotationStore>,
      required: true
    },
    selection: {
      type: Object as PropType<RegionType>
    }
  },
  components: {
    CreateAnnotation,
    Annotation
  },
  setup (props) {
    const filteredAnnotations = computed(() => {
      if (!props.selection) {
        return props.annotations
      }
      // TODO: Filter annotations according to props.selection
      return props.annotations
    })

    return {
      filteredAnnotations
    }
  }
})
</script>

<style lang="less" scoped>
.annotations {
  position: relative;
}
</style>
