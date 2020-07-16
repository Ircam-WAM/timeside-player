<template>
  <div class="annotation-track-container">
    <div class="annotation-track">
      <div class="info-box">
        <div class="info-type">
          Annotation Track
        </div>
        <div class="info-title">
          {{ annotationTrack.title }}
          <span v-if="annotationTrack.description">- {{ annotationTrack.description }}</span>
        </div>
        <p v-if="annotationTrack.author" class="author" title="author">
          Made by {{ annotationTrack.author }}
        </p>
        <p class="is-public" title="visibility">
          <template v-if="annotationTrack.isPublic">
            <svg
              class="visibility-icon"
              aria-hidden="true"
              focusable="false"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path
                d="M423.5 0C339.5.3 272 69.5 272 153.5V224H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48h-48v-71.1c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v80c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-80C576 68 507.5-.3 423.5 0z"
              />
            </svg>
            <!-- Alternative icon (lock) -->
            <!--
            <svg
              class="visibility-icon"
              aria-hidden="true"
              focusable="false"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                d="M400 256H152V152.9c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-16C376 68 307.5-.3 223.5 0 139.5.3 72 69.5 72 153.5V256H48c-26.5 0-48 21.5-48 48v160c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"
              />
            </svg>
            -->
            <span>Public</span>
          </template>
          <template v-else>
            <svg
              class="visibility-icon"
              focusable="false"
              aria-hidden="true"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"
              />
            </svg>
            <span>Private</span>
          </template>
        </p>
        <button class="delete" @click="destroy">
          {{ loadingDestroy ? 'Loading...' : 'Delete' }}
        </button>
      </div>
      <Annotations
        :track-id="annotationTrack.uuid"
        :annotations="annotations"
        :selection="selection"
        @select-annotation="selectedAnnotation = $event"
      />
    </div>
    <div v-if="selectedAnnotation" class="annotation-detail">
      <table class="detail-table">
        <tbody>
          <tr>
            <th>Title:</th>
            <td>{{ selectedAnnotation.title }}</td>
          </tr>
          <tr>
            <th>Description: </th>
            <td>{{ selectedAnnotation.description }}</td>
          </tr>
          <tr>
            <th>Start time: </th>
            <td>{{ selectedAnnotation.startTime }}</td>
          </tr>
          <tr>
            <th>Stop time:</th>
            <td>{{ selectedAnnotation.stopTime }}</td>
          </tr>
        </tbody>
      </table>
      <div class="btn-list">
        <button
          class="btn grey-btn"
          @click="selectedAnnotation = undefined"
        >
          Cancel
        </button>
        <button
          class="btn red-btn"
          :disabled="loadingDestroyAnnotation"
          @click="destroySelectedAnnotation"
        >
          {{ loadingDestroyAnnotation ? 'Loading...' : 'Delete' }}
        </button>
      </div>
      <div v-if="errorDestroyAnnotation" class="error">
        An error occured while deleting annotation: {{ formatResponseError(errorDestroyAnnotation) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  computed
} from '@vue/composition-api'

import Annotations from '@/components/annotation/Annotations.vue'

import annotationStore from '@/utils/annotation-store'
import api, { AnnotationTrack, Annotation } from '@/utils/api'
import { formatResponseError } from '@/utils/response-error'
import { Region as RegionType } from '@/types/region'

export default defineComponent({
  props: {
    annotationTrack: {
      type: Object as PropType<AnnotationTrack>,
      required: true
    },
    selection: {
      type: Object as PropType<RegionType>
    }
  },
  components: {
    Annotations
  },
  setup (props, { emit }) {
    const loadingDestroy = ref(false)
    const errorDestroy = ref()
    const selectedAnnotation = ref<Annotation | undefined>()

    async function destroy () {
      if (!props.annotationTrack.uuid) {
        throw new Error(`Unexpected props.annotation.uuid: ${props.annotationTrack.uuid}`)
      }
      loadingDestroy.value = true
      try {
        await api.destroyAnnotationTrack({ uuid: props.annotationTrack.uuid })
        emit('destroy', props.annotationTrack.uuid)
      } catch (e) {
        errorDestroy.value = e
      }
      loadingDestroy.value = false
    }

    const annotations = annotationStore(computed(() => props.annotationTrack.uuid || ''))

    const loadingDestroyAnnotation = ref(false)
    const errorDestroyAnnotation = ref<Response | Error | undefined>()
    async function destroySelectedAnnotation () {
      if (!selectedAnnotation.value || !selectedAnnotation.value.uuid) {
        throw new Error('unexpected empty selectedAnnotation')
      }
      const uuid = selectedAnnotation.value.uuid
      loadingDestroyAnnotation.value = true
      errorDestroyAnnotation.value = undefined
      try {
        await api.destroyAnnotation({ uuid })
        annotations.remove(uuid)
      } catch (e) {
        errorDestroyAnnotation.value = e
      }
      loadingDestroyAnnotation.value = false
      selectedAnnotation.value = undefined
    }

    return {
      destroy,
      loadingDestroy,
      errorDestroy,

      selectedAnnotation,
      annotations,

      formatResponseError,
      destroySelectedAnnotation,
      loadingDestroyAnnotation,
      errorDestroyAnnotation
    }
  }
})
</script>

<style lang="less" scoped>
.annotation-track-container {
  width: 100%;
}

.annotation-track {
  position: relative;
}

.annotation-detail {
  border: 3px solid #4D4F4E;
  padding: 10px;
  margin-bottom: 5px;
  font-size: 18px;

  .detail-table {
    margin: 0 auto;
    margin-bottom: 10px;
    text-align: left;

    & th {
      padding-right: 15px;
    }
  }
}

.is-public {
  display: flex;
  justify-content: center;
  align-items: center;

  & span {
    /* Specifiy height to fix alignment issues */
    height: 9px;
  }

  .visibility-icon {
    height: 20px;
    margin-right: 7px;

    & ::v-deep path {
      fill: #838688;
    }
  }
}

.btn-list {
  display: flex;
  justify-content: center;

  & > * {
    margin: 5px;
    flex-basis: content;
    min-width: 250px;
  }
}

.error {
  color: red;
}
</style>
