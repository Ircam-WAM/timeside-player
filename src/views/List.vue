<template>
  <List />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

import List from '@/components/List.vue'

export default defineComponent({
  name: 'ListView',
  components: {
    List
  }
})
</script>
