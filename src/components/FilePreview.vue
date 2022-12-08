<template>
  <component :is="tag" class="file-preview">
    <button @click="$emit('remove', file)" class="close-icon" aria-label="Remove">×</button>
    <!-- <img :src="file.url" :alt="file.file.name" :title="file.file.name" /> -->
    <Icon icon="material-symbols:audio-file-outline-rounded" class="audio-file-icon" />
    <p class="file-title">{{ file.file.name }}</p>
    <span class="status-indicator loading-indicator" v-show="file.status == 'loading'">...</span>
    <span class="status-indicator success-indicator" v-show="file.status == true">OK</span>
    <span class="status-indicator failure-indicator" v-show="file.status == false">Error</span>
  </component>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

defineProps({
  file: { type: Object, required: true },
  tag: { type: String, default: 'li' },
})

defineEmits(['remove'])
</script>

<style lang="less" scoped>
.file-preview {
  width: 10%;
  margin: 1rem;
  position: relative;
  aspect-ratio: 1/1;
  list-style: none;
  img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
	}
  .file-title {
    font-size: 0.8rem;
    margin: 0;
  }
  .audio-file-icon {
    width: 3rem;
    height: 3rem;
  }
	.close-icon, .status-indicator {
		--size: 15px;
		position: absolute;
		line-height: var(--size);
		height: var(--size);
		border-radius: var(--size);
		box-shadow: 0 0 5px currentColor;
		appearance: none;
		border: 0;
		width: 100%;
    margin: 0 auto;
		padding: 0;
    left: 0;
	}
	.close-icon {
		width: var(--size);
		font-size: var(--size);
		background: #933;
		color: #fff;
		top: 0;
    left: 3rem;
		cursor: pointer;
	}
	.status-indicator {
		font-size: calc(0.75 * var(--size));
		bottom: -1rem;
		padding: 0 10px;
	}
	.loading-indicator {
		animation: pulse 1.5s linear 0s infinite;
		color: #000;
	}
	.success-indicator {
		background: #6c6;
		color: #040;
	}
	.failure-indicator {
		background: #933;
		color: #fff;
	}
}
@keyframes pulse {
	0% {
		background: #fff;
	}
	50% {
		background: #ddd;
	}
	100% {
		background: #fff;
	}
}
</style>