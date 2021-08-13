<template>
  <div v-if="typeof $route.params.id !== 'string'">
    Unexpected $route.params.id: {{ $route.params.id }}
  </div>
  <PlayerContainer v-else :item-id="$route.params.id" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PlayerContainer from '@/components/PlayerContainer.vue'

export default defineComponent({
  name: 'ListView',
  components: {
    PlayerContainer
  }
})
</script>
