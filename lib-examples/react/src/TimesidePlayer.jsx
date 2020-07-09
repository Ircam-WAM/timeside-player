import React, { useState, useRef, useEffect } from 'react'
import TimesidePlayer from '@ircam/timeside-player'

export default function TimesidePlayerWrapper(props) {
  const playerEl = useRef(null)

  useEffect(() => {
    const timesidePlayer = TimesidePlayer(playerEl.current, props.uuid)
    return () => timesidePlayer.destroy()
  })

  return (
    <div className="player-container">
      <div ref={playerEl} />
    </div>
  );
}
