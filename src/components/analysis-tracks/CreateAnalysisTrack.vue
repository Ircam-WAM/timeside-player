<template>
  <div class="list-container">
    <div v-if="analysisError">
      {{ formatResponseError(analysisError) }}
    </div>
    <div
      v-if="analysisLoading"
    >
      Loading...
    </div>
    <div
      v-else
    >
      <div
        v-for="a of analysis"
        :key="a.uuid"
        :value="a.uuid"
        class="checklist"
        @click="submit(a)"
      >
        <p class="analysis-selection-title">
          {{ a.title }}
        </p>

        <Icon icon="fluent:presence-available-10-filled" class="analysis-icon analysis-icon-available" />

        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" class="analysis-icon analysis-icon-visibility analysis-icon-visible svg-inline--fa fa-eye fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" @click="handleAnalysisTrackVisibility"><path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" /></svg>
        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-slash" class="analysis-icon analysis-icon-visibility analysis-icon-hidden svg-inline--fa fa-eye-slash fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" @click="handleAnalysisTrackVisibility"><path fill="currentColor" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" /></svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted
} from 'vue'

import { useApi, Analysis, AnalysisTrack } from '@/utils/api'
import { getAnalysisUrl, getItemUrl } from '@ircam/timeside-sdk'

import { formatResponseError } from '@/utils/response-error'

import { Icon } from '@iconify/vue'

export default defineComponent({
  components: {
    Icon
  },
  props: {
    itemId: {
      type: String,
      required: true
    }
  },
  emits: [
    'new-analysis-track'
  ],
  setup (props, { emit }) {
    const { api, currentBaseUrl } = useApi()
    const analysis = ref<Array<Analysis>>()
    const analysisLoading = ref(true)
    const analysisError = ref<Response>()

    const selectedAnalysisId = ref<Analysis['uuid']>()

    const infoTitleElements = document.querySelectorAll('.info-title')!
    const analysisListElements: Array<HTMLElement> = []
    const availableAnalysisTracks: Array<String> = []

    onMounted(async () => {
      try {
        const resp = await api.listAnalysis()
        analysis.value = resp

        analysis.value.forEach(a => {
          infoTitleElements.forEach(title => {
            if (title.innerHTML === a.title) {
              availableAnalysisTracks.push(a.title)
            }
          })
        })

        setTimeout(() => {
          const checklistElements = document.querySelectorAll('.checklist')!
          checklistElements.forEach(el => {
            analysisListElements.push(<HTMLElement>el)
          })

          availableAnalysisTracks.forEach(a => {
            analysisListElements.forEach(el => {
              const textElement = el.getElementsByTagName('p')[0]
              if (textElement.innerHTML === a) {
                el.classList.add('analysis-available')

                const availableIconElement = el.getElementsByClassName('analysis-icon-available')[0]
                availableIconElement.classList.add('show')

                const visibleIconElement = el.getElementsByClassName('analysis-icon-visible')[0]
                visibleIconElement.classList.add('show')
              }
            })
          })
        }, 100)

        analysisLoading.value = false
        analysisError.value = undefined
      } catch (e) {
        if (e instanceof Response) {
          analysisError.value = e
        } else {
          console.error('Unknown error occured', e)
        }
      }
    })

    function handleAnalysisTrackVisibility (e: MouseEvent) {
      const target = <HTMLElement>e.currentTarget
      target.classList.remove('show')

      const analysisTitle = target.parentElement?.getElementsByClassName('analysis-selection-title')[0].innerHTML

      let selectedAnalysisTrack: HTMLElement

      if (target.classList.contains('analysis-icon-visible')) {
        // hidden
        target.nextElementSibling?.classList.add('show')

        const analysisTrackElements = document.querySelectorAll('.analysis-track')
        analysisTrackElements.forEach(el => {
          const infoTitleElement = el.getElementsByClassName('info-title')[0]

          if (infoTitleElement.innerHTML === analysisTitle) {
            selectedAnalysisTrack = <HTMLElement>el
            selectedAnalysisTrack.classList.remove('show')
            selectedAnalysisTrack.classList.add('hide')
          }
        })
      } else {
        // visible
        target.previousElementSibling?.classList.add('show')

        const analysisTrackElements = document.querySelectorAll('.analysis-track')
        analysisTrackElements.forEach(el => {
          const infoTitleElement = el.getElementsByClassName('info-title')[0]

          if (infoTitleElement.innerHTML === analysisTitle) {
            selectedAnalysisTrack = <HTMLElement>el
            selectedAnalysisTrack.classList.remove('hide')
            selectedAnalysisTrack.classList.add('show')
          }
        })
      }
    }

    const submitLoading = ref(false)
    const submitError = ref<Response | Error | undefined>()

    async function submit (selectedAnalysis: Analysis) {
      if (!selectedAnalysis.uuid) {
        return undefined
      }

      if (!availableAnalysisTracks.includes(selectedAnalysis.title!)) {
        // Building URL
        // https://github.com/Ircam-WAM/TimeSide/issues/188
        const analysisTrack: AnalysisTrack = {
          item: getItemUrl(currentBaseUrl, props.itemId),
          analysis: getAnalysisUrl(currentBaseUrl, selectedAnalysis.uuid!)
        }
        submitLoading.value = true
        try {
          const at = await api.createAnalysisTrack({ analysisTrack })
          if (!selectedAnalysis) {
            throw new Error('unexpected empty selectedAnalysis')
          }
          emit('new-analysis-track', at)
        } catch (e) {
          submitError.value = e
        }
        submitLoading.value = false
      }
    }

    return {
      analysis,
      analysisLoading,
      selectedAnalysisId,
      analysisError,

      handleAnalysisTrackVisibility,

      formatResponseError,
      submitLoading,
      submitError,
      submit
    }
  }
})
</script>

<style lang="less" scoped>
.list-container {
  opacity: 0.95;
  cursor: pointer;
  padding-right: 5px
}
.checklist {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  display: flex;
  margin-top: 2px;
  position: relative;
  top: 50%;

  p {
    margin: 0;
  }
}
.checklist:hover {
  background: gainsboro;
}

.analysis-available {
  background-color: #2c3e50;
  color: #ffffff;

  &:hover {
    background: #2c3e50;
    opacity: 0.8;
  }
}

.analysis-icon {
  display: none;
  width: 15px;
  height: 15px;
  margin-right: 10px;
}

.analysis-icon-available {
  margin-left: auto;
}

.analysis-icon-visibility {
  z-index: 1;
}
</style>
