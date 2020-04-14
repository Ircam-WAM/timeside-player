<template>
  <PlayerContainer :item-id="$route.params.id" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

import PlayerContainer from '@/components/PlayerContainer.vue'

export default defineComponent({
  name: 'ListView',
  components: {
    PlayerContainer
  }
})
</script>
