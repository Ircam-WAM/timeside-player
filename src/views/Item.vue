<template>
  <Player :item-id="$route.params.id" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

import Player from '@/components/Player.vue'

export default defineComponent({
  name: 'ListView',
  components: {
    Player
  }
})
</script>
