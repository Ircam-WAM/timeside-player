import React, { useState, useRef, useEffect } from 'react'

export default function TimesidePlayerWrapper(props) {
  const playerEl = useRef(null)

  let playerInstance

  // Load from UMD bundle
  const load = async () => {
    if (!window.timesidePlayer) {
      await import('https://unpkg.com/@ircam/timeside-player@latest/lib/timeside-player.umd.min.js')
    }
    const TimesidePlayer = window.timesidePlayer
    playerInstance = TimesidePlayer(playerEl.current, props.uuid)
  }

  const unload = () => {
    if (!playerInstance) {
      return
    }
    playerInstance.destroy()
  }

  useEffect(() => {
    load()
    return unload
  })

  return (
    <div className="player-container">
      <div ref={playerEl} />
    </div>
  );
}
