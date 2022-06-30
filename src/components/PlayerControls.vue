<template>
  <div class="player-controls">
    <Icon id="stop-icon" icon="fad:backward" class="player-icon" @click="handlePlayEnd" />
    <Icon v-if="!isPlaying" id="play-icon" icon="fad:play" class="player-icon" @click="handlePlayPause" />
    <Icon v-else id="pause-icon" icon="fad:pause" class="player-icon" @click="handlePlayPause" />
    <div id="player-timecode">
      <p id="player-current-time">
        {{ currentTime }}
      </p>
      <p id="player-total-time">
        {{ totalTime }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

import { Icon } from '@iconify/vue'

let audioElement: HTMLAudioElement

export default defineComponent({
  name: 'PlayerControls',
  components: {
    Icon
  },
  props: {
    stopped: {
      type: Boolean,
      required: false
    }
  },
  setup () {
    onMounted(() => {

    })

    const isPlaying = ref(false)

    const currentTime = ref('00:00')
    const totalTime = ref('/ 00:00')

    function handlePlayPause () {
      // const audioElement = document.querySelector('.audio')?.getElementsByTagName('audio')[0]

      if (isPlaying.value === true) {
        audioElement?.pause()
      } else {
        audioElement?.play()
      }

      isPlaying.value = !isPlaying.value
    }

    function handlePlayEnd () {
      audioElement.currentTime = 0
    }

    setTimeout(() => {
      audioElement = document.querySelector('.audio')?.getElementsByTagName('audio')[0]!

      audioElement.addEventListener('ended', () => { isPlaying.value = false })
      audioElement.addEventListener('timeupdate', () => { currentTime.value = formatTime(audioElement.currentTime.toFixed()) })

      audioElement.onloadedmetadata = function () {
        totalTime.value = '/ ' + formatTime(audioElement.duration)
      }
    }, 500)

    function formatTime (seconds: any) {
      let minutes: any = Math.floor(seconds / 60)!
      minutes = (minutes >= 10) ? minutes : '0' + minutes
      seconds = Math.floor(seconds % 60)
      seconds = (seconds >= 10) ? seconds : '0' + seconds
      return minutes + ':' + seconds
    }

    return {
      isPlaying,

      currentTime,
      totalTime,

      handlePlayPause,
      handlePlayEnd
    }
  },
  data () {
    return {

    }
  }
})
</script>

<style lang="less" scoped>
.player-controls {
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: flex-start;
  margin-top: 1rem;
}

.player-icon {
  width: 30px;
  height: 30px;
  background-color: #dcdcdc;
  padding: 2px;
  margin-right: 5px;
  fill: #000;
  stroke: #000;
  stroke-width: 2px;

  &:hover {
    cursor: pointer;
  }
}

#player-timecode {
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
  width: auto;
  height: 30px;
  background-color: #dcdcdc;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;

  p {
    margin: 0;
  }

  #player-total-time {
    margin-left: 5px;
  }
}
</style>
