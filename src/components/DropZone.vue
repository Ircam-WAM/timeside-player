<template>
  <div :data-active="active" @dragenter.prevent="setActive" @dragover.prevent="setActive" @dragleave.prevent="setInactive" @drop.prevent="onDrop">
    <!-- share state with the scoped slot -->
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['files-dropped'])

// Create active state and manage it with functions
const active = ref(false)
let inactiveTimeout: number | undefined = 0

function setActive() {
  active.value = true
  clearTimeout(inactiveTimeout)
}
function setInactive() {
  inactiveTimeout = setTimeout(() => {
    active.value = false
  }, 50)
}

function onDrop (e: { dataTransfer: { files: any } } | DragEvent) {
    setInactive()
    emit('files-dropped', [...e.dataTransfer?.files])
}

function preventDefaults (e: { preventDefault: () => void }) {
  e.preventDefault()
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })
})
</script>