<template>
  <div class="list-container">
    <div class="list-element create-annotation-track-button"
      @click="isAnnotationTrackFormOpen = !isAnnotationTrackFormOpen"
    >
      Create new annotation track
    </div>
    <div v-if = "isAnnotationTrackFormOpen">
      <CreateAnnotationTrack
        class="create-form"
        :item-id="itemUuid"
        @new-annotation-track="annotationTracks.add($event); isAnnotationTrackFormOpen = false"
        @close="isAnnotationTrackFormOpen = false"
      />
    </div>
    <div
      class="list-element"
      v-for="a of annotationTracks.annotationTracks"
      ref="annotationTrackRefs"
      :key="a.uuid"
      :annotation-track="a"
    >
      <div
        class="selected-annotation-track"
        @click="selectedAnnotationTrack = a.uuid"
      >
        <svg v-if="selectedAnnotationTrack === a.uuid" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pencil-alt" class="svg-inline--fa fa-pencil-alt fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"></path></svg>
      </div>
      <div
        class="selected-annotation-track"
        @click="annotationStore.toggleAnnotationTrack(a.uuid)">
        <svg v-if="annotationStore.annotations.has(a.uuid)" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" class="svg-inline--fa fa-eye fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path></svg>
        <svg v-else aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-slash" class="svg-inline--fa fa-eye-slash fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"></path></svg>
      </div>
      {{ a.title }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  PropType,
  computed,
  inject
} from 'vue'
import { AnnotationTrackStore } from '@/store/annotation-track'
import annotationTrackStore from '@/store/annotation-track'
import CreateAnnotationTrack from '@/components/annotation/CreateAnnotationTrack.vue'
import { selectedAnnotationTrackKey } from '@/components/Player.vue'

import { useAnnotationStore } from '@/store/annotation'

export default defineComponent({
  components: {
    CreateAnnotationTrack
  },
  props: {
    annotationTracks: {
      type: Object as PropType<AnnotationTrackStore>,
      required: true
    },
    itemUuid: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const annotationStore = useAnnotationStore()
    const isAnnotationTrackFormOpen = ref(false)
    const itemUuid = props.itemUuid
    const annotationTracks = annotationTrackStore(computed(() => itemUuid))
    const selectedAnnotationTrack = inject(selectedAnnotationTrackKey)

    return {
      isAnnotationTrackFormOpen,
      itemUuid,
      annotationTracks,
      selectedAnnotationTrack,
      annotationStore,
    }
  }
})
</script>
<style lang="less" scoped>
.list-container {
  opacity: 0.95;
  cursor: pointer;
  padding-right: 5px;
}
.list-element {
  text-align: left;
  font-size: 16px;
  display: flex;
  margin-top: 2px;
  display: flex;
}
.list-element:hover {
  background: gainsboro;
}
.selected-annotation-track {
  height: 15px;
  width: 15px;
  margin: 0px 5px;
}
</style>
