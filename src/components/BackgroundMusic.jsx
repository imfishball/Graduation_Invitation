import { useEffect, useRef, useState } from 'react'
import { Volume2Icon, VolumeXIcon } from './Icons'

export default function BackgroundMusic({ solid = false }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const userPausedRef = useRef(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.35

    // Tự động phát khi người dùng tương tác lần đầu (nhấn Mở thiệp / click / chạm)
    const cleanup = () => {
      window.removeEventListener('pointerdown', handleFirstGesture)
      window.removeEventListener('click', handleFirstGesture)
      window.removeEventListener('scroll', handleFirstGesture)
    }

    function handleFirstGesture(event) {
      if (event?.type === 'click' && event.target?.closest?.('.music-toggle')) return
      if (userPausedRef.current) return
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          // Trình duyệt có thể vẫn chặn nếu chưa đủ tương tác
        })
      cleanup()
    }

    window.addEventListener('pointerdown', handleFirstGesture)
    window.addEventListener('click', handleFirstGesture)
    window.addEventListener('scroll', handleFirstGesture, { once: true })

    return cleanup
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      userPausedRef.current = true
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          userPausedRef.current = false
        })
        .catch(() => {
          // Bỏ qua lỗi phát nhạc khi trình duyệt chặn
        })
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/graduation-melody.mp3"
        loop
        preload="auto"
        aria-hidden="true"
      />

      <button
        type="button"
        className={`music-toggle${isPlaying ? ' is-playing' : ''}${solid ? ' is-solid' : ''}`}
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền thanh xuân'}
        title={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền thanh xuân'}
      >
        <span className="music-toggle__icon" aria-hidden="true">
          {isPlaying ? <Volume2Icon size={16} /> : <VolumeXIcon size={16} />}
        </span>

        <span className="music-toggle__equalizer" aria-hidden="true">
          <span className="eq-bar eq-bar-1" />
          <span className="eq-bar eq-bar-2" />
          <span className="eq-bar eq-bar-3" />
        </span>

        <span className="music-toggle__label">
          {isPlaying ? 'Nhạc nền' : 'Bật nhạc'}
        </span>
      </button>
    </>
  )
}
