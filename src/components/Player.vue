<template>
  <div>
    <div class="title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts">
import { createComponent, ref } from '@vue/composition-api'

export default createComponent({
  name: 'Player',
  props: {
  },
  setup () {
    const title = ref('Beat it')

    return {
      title
    }
  }
})
</script>

<style lang="less">
</style>
