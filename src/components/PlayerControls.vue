<template>
  <div class="player-controls">
    <Icon v-if="!isPlaying" id="play-icon" icon="fad:play" class="player-icon" @click="handlePlayPause" />
    <Icon v-else id="pause-icon" icon="fad:pause" class="player-icon" @click="handlePlayPause" />
    <Icon id="stop-icon" icon="fad:backward" class="player-icon" @click="handlePlayEnd" />
    <div id="player-timecode">
      <p id="player-time">
        {{ currentTime }} {{ totalTime }}
      </p>
    </div>
    <Icon icon="el:volume-up" class="player-icon volume-icon" @click="isVolumeSliderOpen = !isVolumeSliderOpen" />
    <Icon icon="fad:caret-down" class="icon-caret icon-caret-down" :class="{ 'show': !isPlayerMenuOpen }" @click="isPlayerMenuOpen = !isPlayerMenuOpen" />
    <Icon icon="fad:caret-up" class="icon-caret icon-caret-up" :class="{ 'show': isPlayerMenuOpen }" @click="isPlayerMenuOpen = !isPlayerMenuOpen" />
  </div>
  <div id="player-menu">
    <div v-if="isVolumeSliderOpen" id="player-volume-slider">
      <input ref="slider" type="range" min="0" max="1" step="0.001" value="1.0" @change="setVolume">
    </div>
    <select v-if="isPlayerMenuOpen" id="player-playback-rate" ref="playback-rate" name="playback-rate" @change="setPlaybackRate">
      <option value="">
        playback rate
      </option>
      <option value="0.5">
        0.5
      </option>
      <option value="1.0">
        1.0
      </option>
      <option value="1.5">
        1.5
      </option>
      <option value="2.0">
        2.0
      </option>
    </select>
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

    const slider = ref<HTMLInputElement>()

    const isPlaying = ref(false)
    const isVolumeOn = ref(true)
    const isVolumeSliderOpen = ref(false)
    const isPlayerMenuOpen = ref(false)

    const currentTime = ref('00:00')
    const totalTime = ref('/ 00:00')

    function handlePlayPause () {
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

      if (audioElement) {
        audioElement.addEventListener('ended', () => { isPlaying.value = false })
        audioElement.addEventListener('timeupdate', () => { currentTime.value = formatTime(audioElement.currentTime.toFixed()) })

        totalTime.value = '/ ' + formatTime(audioElement.duration)
      }
    }, 1000)

    function formatTime (seconds: any) {
      let minutes: any = Math.floor(seconds / 60)!
      minutes = (minutes >= 10) ? minutes : '0' + minutes
      seconds = Math.floor(seconds % 60)
      seconds = (seconds >= 10) ? seconds : '0' + seconds
      return minutes + ':' + seconds
    }

    function toggleVolume () {
      isVolumeOn.value = !isVolumeOn.value

      if (isVolumeOn.value) {
        audioElement.volume = parseFloat(slider.value?.value!)
      } else {
        audioElement.volume = 0
      }
    }

    function toggleVolumeSlider () {
      isVolumeSliderOpen.value = !isVolumeSliderOpen.value

      if (isVolumeOn.value) {
        audioElement.volume = parseFloat(slider.value?.value!)
      } else {
        audioElement.volume = 0
      }
    }

    function setVolume () {
      audioElement.volume = parseFloat(slider.value?.value!)
    }

    function setPlaybackRate (e: Event) {
      const playbackRate = (<HTMLSelectElement>e.currentTarget).value

      audioElement.playbackRate = parseFloat(playbackRate)
    }

    return {
      slider,

      isPlaying,
      isVolumeOn,
      isVolumeSliderOpen,
      isPlayerMenuOpen,

      currentTime,
      totalTime,

      handlePlayPause,
      handlePlayEnd,

      toggleVolume,
      toggleVolumeSlider,
      setVolume,
      setPlaybackRate
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

  .icon-caret {
    width: 30px;
    height: 30px;
    display: none;
  }

  .icon-caret:hover {
    cursor: pointer;
  }
}

.player-icon {
  width: 30px;
  height: 30px;
  background-color: #dcdcdc;
  box-shadow: 2px 2px 1px rgba(0,0,0,0.2);
  padding: 2px;
  margin-right: 5px;
  fill: #000;
  stroke: #000;
  stroke-width: 2px;
  opacity: 1;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
}

#player-timecode {
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
  width: max-content;
  height: 30px;
  background-color: #dcdcdc;
  box-shadow: 2px 2px 1px rgba(0,0,0,0.2);
  margin-right: 5px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;

  p {
    margin: 0;
  }

  #player-total-time {
    margin-left: 5px;
  }
}

#player-menu {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  width: auto;
}

.volume-icon {
  padding: 5px;
}

#player-volume-slider {
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: flex-start;
  margin-top: 1rem;
  margin-right: 1rem;
  width: 50%;

  input {
    -webkit-appearance: none;
    width: 100%;
    height: 10px;
    border-radius: 5px;
    background-color: #dcdcdc;
    box-shadow: 2px 2px 1px rgba(0,0,0,0.2);
    outline: none;
    opacity: 0.8;
    -webkit-transition: .2s;
    transition: opacity .2s;

    &:hover {
      opacity: 1;
    }
  }

  input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2c3e50;
    cursor: pointer;
  }

  input::-moz-range-thumb {
    width: 15px;
    height: 15px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2c3e50;
    cursor: pointer;
  }
}

#player-playback-rate {
  margin-top: 1rem;
  margin-left: auto;
  box-shadow: 1px 1px 1px rgba(0,0,0,0.2);
}
</style>