<template>
  <div
    ref="el"
    class="player"
  >
    <div class="top-line">
      <div class="top-right">
        <Audio v-if="audioSrcs" :audio-srcs="audioSrcs" />
      </div>
    </div>
    <div v-if="audioReady" class="player-content">
      <!--
        These components need audio to be loaded because
        they need audio's duration to compute position
      -->
      <MainTrack
        class="main-track"
        :item-id="item.uuid"
        :selection="selection"
        @selection="onSelection"
      />
      <div>
        <Timer class="timer" />
      </div>
      <div ref="advanced-player-container" class="advanced-player-title section-title">
        <h4>Advanced player</h4>
        <Icon icon="fad:caret-down" class="icon-caret icon-caret-down" :class="{ 'show': !isAdvancedPlayerOpen }" @click="isAdvancedPlayerOpen = !isAdvancedPlayerOpen" />
        <Icon icon="fad:caret-up" class="icon-caret icon-caret-up" :class="{ 'show': isAdvancedPlayerOpen }" @click="isAdvancedPlayerOpen = !isAdvancedPlayerOpen" />
      </div>
      <div v-if="isAdvancedPlayerOpen" class="advanced-player-container">
        <div class="menu">
          <div class="line">
            <div class="actions">
              <button
                :class="{ 'active': isAnalysisTrackFormOpen }"
                @click="isAnalysisTrackFormOpen = !isAnalysisTrackFormOpen; isAnnotationTrackFormOpen = false"
              >
                <span class="plus-picto">+</span>
                Analysis
              </button>
              <button
                :class="{ 'active': isAnnotationTrackFormOpen }"
                @click="isAnnotationTrackFormOpen = !isAnnotationTrackFormOpen; isAnalysisTrackFormOpen = false"
              >
                <span class="plus-picto">+</span>
                Annotation
              </button>
            </div>
          </div>
        </div>
        <div class="analysis-tab">
          <div v-if="isAnalysisTrackFormOpen" class="create-form-container">
            <CreateAnalysisTrack
              :item-id="item.uuid"
              :analysis-tracks="analysisTracks"
              class="create-form"
              @new-analysis-track="analysisTracks.add($event); isAnalysisTrackFormOpen = false"
              @close="isAnalysisTrackFormOpen = false"
            />
          </div>
          <div v-if="isAnnotationTrackFormOpen" class="create-form-container">
            <CreateAnnotationTrackList
              class="annotation-track-list"
              :annotation-tracks="annotationTracks"
              :item-uuid="item.uuid"
            />
          </div>
          <AnalysisTracks
            :item-id="item.uuid"
            :selection="selection"
            :analysis-tracks="analysisTracks"
            :add-annotation="isAnnotationTrackFormOpen"
          />
        </div>
      </div>
      <div ref="technical-informations-container" class="technical-informations-title section-title">
        <h4>Technical informations</h4>
        <Icon icon="fad:caret-down" class="icon-caret icon-caret-down" :class="{ 'show': !isTechnicalInfosOpen }" @click="isTechnicalInfosOpen = !isTechnicalInfosOpen" />
        <Icon icon="fad:caret-up" class="icon-caret icon-caret-up" :class="{ 'show': isTechnicalInfosOpen }" @click="isTechnicalInfosOpen = !isTechnicalInfosOpen" />
      </div>
      <div v-if="isTechnicalInfosOpen" class="technical-informations-container">
        <table class="info-table">
          <tbody>
            <tr>
              <th>uuid</th>
              <td>{{ item.uuid }}</td>
            </tr>
            <tr v-if="item.description">
              <th>Description</th>
              <td>{{ item.description }}</td>
            </tr>
            <tr>
              <th>Sample rate</th>
              <td>{{ item.samplerate }} Hz</td>
            </tr>
            <tr>
              <th>Audio duration</th>
              <td>{{ item.audioDuration }} seconds</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      Loading audio file...
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  computed,
  provide,
  InjectionKey,
  Ref
} from 'vue'

import { useAudioStore } from '@/store/audio'
import { Item } from '@/utils/api'
import { providePlayerRect } from '@/utils/use-player-rect'
import useBoundingClientRect from '@/utils/use-bounding-client-rect'
import { Region as RegionType } from '@/types/region'

import { getAudioSrcs } from '@/utils/audio-srcs'
import bindSelectionUrl from '@/utils/bind-selection-url'

import Timer from '@/components/Timer.vue'
import Audio from '@/components/Audio.vue'
import MainTrack from '@/components/tracks/MainTrack.vue'
import AnalysisTracks from '@/components/tracks/AnalysisTracks.vue'
import CreateAnalysisTrack from '@/components/analysis-tracks/CreateAnalysisTrack.vue'
import CreateAnnotationTrackList from '@/components/annotation/CreateAnnotationTrackList.vue'

import analysisTrackStore from '@/store/analysis-track'
import annotationTrackStore from '@/store/annotation-track'
import { createAnnotationStore, annotationStoreKey } from '@/store/annotation'

import { Icon } from '@iconify/vue'

enum Tab {
  Info,
  Analysis
}

export const selectedAnnotationTrackKey: InjectionKey<Ref<string>> = Symbol('selectedAnnotationTrack')


export default defineComponent({
  name: 'Player',
  components: {
    Audio,
    Timer,
    MainTrack,
    AnalysisTracks,
    CreateAnalysisTrack,
    CreateAnnotationTrackList,
    Icon
  },
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true
    }
  },
  setup (props) {
    const audioStore = useAudioStore()
    const selection = ref<RegionType>()
    provide(selectedAnnotationTrackKey, ref<string>())
    provide(annotationStoreKey, createAnnotationStore())

    // Get playerRect and provide it for child components
    const el = ref<HTMLElement>()
    const playerSize = useBoundingClientRect(el)
    providePlayerRect(playerSize)

    const audioSrcs = computed(() => getAudioSrcs(props.item))
    const audioReady = computed(() => audioStore.getters.isReady)

    const onSelection = (val?: RegionType) => {
      selection.value = val
    }

    bindSelectionUrl(selection)

    const currentTab = ref(Tab.Analysis)
    function setTab (tab: Tab) {
      currentTab.value = tab
    }

    const isAdvancedPlayerOpen = ref(false)

    const isAnalysisTrackFormOpen = ref(false)
    const analysisTracks = analysisTrackStore(computed(() => props.item.uuid))

    const isAnnotationTrackFormOpen = ref(false)
    const annotationTracks = annotationTrackStore(computed(() => props.item.uuid))

    const isTechnicalInfosOpen = ref(false)

    setTitle(props.item)

    const hover = ref(false)

    return {
      el,
      onSelection,
      selection,
      audioSrcs,
      audioReady,

      currentTab,
      setTab,
      Tab,

      isAdvancedPlayerOpen,
      isAnalysisTrackFormOpen,
      analysisTracks,

      isAnnotationTrackFormOpen,
      annotationTracks,

      isTechnicalInfosOpen,

      hover
    }
  }
})
export function setTitle (item: Item) {
  const titleElement = document.querySelector('#header-title')?.getElementsByTagName('a')[0]!
  titleElement.innerHTML = item.title!
}
</script>

<style lang="less">
/* visibility helpers */
.show {
  display: block !important;
}

.hide {
  display: none !important;
}
</style>

<style lang="less" scoped>

.top-line {
  display: none;
  grid-template-columns: 1fr 1fr;
  grid-gap: 5px;
  grid-auto-rows: minmax(50px, auto);
  vertical-align: middle;
  margin: auto;

  .title {
    font-size: 18px;
    font-weight: bold;
    text-align: left;
    position: relative;
    display: flex;
    align-items: center;

    h3 {
      text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
    }
  }
  .information-bubble {
    height: 20px;
    width: 20px;
    margin-left: 10px;
  }

  .information-bubble:hover {
    cursor: pointer;
  }
  .top-center {
    text-align: center;
    display: flex;
    align-items: center;
  }
  .top-right {
    text-align: right;
    align-items: center;
  }
}

.line {
  justify-content: space-between;
}

.player-content {
  margin-top: 20px;
}

.timer {
  text-align: right;
  font-size: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  text-align: left;
  position: relative;
  display: flex;
  align-items: center;

  h4 {
    text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
  }

  .icon-caret {
    width: 30px;
    height: 30px;
    display: none;
  }

  .icon-caret:hover {
    cursor: pointer;
  }
}

.menu {
  background-color: #dcdcdc;
  box-shadow: 2px 2px 1px rgba(0,0,0,0.2);

  button {
    font-size: 16px;
    display: block;
    background: gainsboro;
    color: #2c3e50;
    border: none;
    cursor: pointer;
    padding: 7px 10px;
  }
}
.actions {
  display: flex;

  & button {
    display: flex;
    align-items: center;

    &.active {
      background-color: silver;
    }

    & .plus-picto {
      font-size: 30px;
      font-weight: 600;
      height: 15px;
      margin-top: -23px;
      margin-right: 5px;
    }
  }
}
.info-tab {
  text-align: left;
  font-size: 18px;
}

.info-table {
  position: absolute;
  z-index: 6;
  background-color: white;
  opacity: 0.95;
  font-size: 14px;
  min-width: 400px;

  tr {
    margin-bottom: 5px;
  }
  th {
    padding-left: 5px;
    padding-right: 10px;
    color: #444;
    background-color: #f9f9f9;
    border-right: .3em solid #ddd;
  }
  td {
    padding-top: 5px;
    padding-left: 10px;
  }
}

.create-form-container {
  position: absolute;
  margin-left: 2px;
  padding: 10px;
  z-index: 2;
  background-color: white;
  border: 1px solid #dcdcdc;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
  opacity: 0.95;
}

.error {
  color: red;
}
</style>

<!-- Global style for the player -->
<style lang="less" scoped>
// https://github.com/vuejs/rfcs/blob/master/active-rfcs/0023-scoped-styles-changes.md
// https://stackoverflow.com/questions/66183082/avoid-v-deep-duplication-with-scss-and-vue-3#comment121520884_66184174
::v-deep(*) {
  .form-title {
    font-weight: bold;
    font-size: 18px;
    margin-top: 5px;
    margin-bottom: 10px
  }

  .generic-form {
    .select-wrapper {
      select {
        appearance: none;

        background: none;
        border: 1px solid grey;
        padding: 5px 7px;
        width: 100%;
        font-size: 16px;
      }

      position: relative;
    }

    input[type="text"], textarea {
      border: 1px solid grey;
      padding: 7px 10px;
    }

    input[type="checkbox"] {
      margin: 0;
      margin-right: 10px;
    }

    label {
      margin-right: 10px;
    }

    .field {
      margin-bottom: 10px;

      &.left {
        text-align: left;
      }
    }
  }

  .btn {
    font-size: 16px;
    border: none;
    cursor: pointer;
    margin-bottom: 5px;
    border-radius: 5px;
    background-color: gainsboro;
    margin-left: 5px;
    margin-right: 5px;
    padding: 5px
  }

  .grey-btn {
    padding: 5px;
    background-color: gainsboro;
    font-weight: normal;
  }

  .red-btn {
    background-color: #DB4D27;
    color: white;
  }

  .info-box {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 5;

    background-color: #c4c4c494;
    padding: 5px;
    border-radius: 5px;

    display: flex;
    justify-content: space-between;

    & .info-type {
      margin-top: 5px;
      margin-bottom: 5px;
      font-size: 14px;
    }

    & .info-title {
      margin-top: 2px;
      font-size: 14px;
      text-align: left;
    }

    .delete {
      border: none;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      background: rgba(0,0,0,0);
      color: #2c3e50;
      margin-right: -5px;
    }
  }
}
</style>
