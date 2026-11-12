import { useEffect, useRef } from 'react'

/**
 * Khinh khí cầu nhỏ với hiệu ứng lơ lửng bồng bềnh và nghiêng theo scroll
 * Vector SVG #svg611018078_23025 trích xuất chính xác 1:1 từ Framer Advent
 */
export default function HotAirBalloonOrnament({ className = '' }) {
  const balloonRef = useRef(null)

  useEffect(() => {
    const el = balloonRef.current
    if (!el) return undefined

    let rafId = 0
    let ticking = false
    let isNearViewport = false

    const update = () => {
      ticking = false
      if (!isNearViewport) return
      const rect = el.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const progress = (windowHeight - rect.top) / (windowHeight + 300)
      const clamped = Math.max(-0.5, Math.min(1.5, progress))

      const tilt = (clamped - 0.5) * -14
      const parallaxY = (clamped - 0.5) * -32
      el.style.setProperty('--balloon-scroll-tilt', `${tilt}deg`)
      el.style.setProperty('--balloon-scroll-y', `${parallaxY}px`)
    }

    const handleScroll = () => {
      if (!isNearViewport || ticking) return
      ticking = true
      rafId = requestAnimationFrame(update)
    }

    let observer = null
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          isNearViewport = Boolean(entries[0]?.isIntersecting)
          if (isNearViewport) handleScroll()
        },
        { rootMargin: '250px 0px' }
      )
      observer.observe(el)
    } else {
      isNearViewport = true
      handleScroll()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={balloonRef} className={`adventures__balloon ${className}`} aria-hidden="true">
      <div className="balloon-flight-wrap">
        <svg
          viewBox="0 0 40.12 56.03"
          width="40"
          height="56"
          className="balloon-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dây thừng giỏ */}
          <path
            d="M 14.02 46.178 L 12.481 46.606 L 12.294 45.93 L 11.773 44.072 L 10.071 37.954 L 10.063 37.931 L 10.009 37.729 L 10.405 37.62 L 11.548 37.301 L 11.727 37.931 L 13.437 44.072 L 13.95 45.93 Z"
            fill="rgba(214, 139, 150, 0.5)"
          />
          <path
            d="M 28.343 37.301 L 29.889 37.732 L 27.415 46.607 L 25.87 46.177 Z"
            fill="rgba(214, 139, 150, 0.5)"
          />
          <path
            d="M 17.675 37.028 L 18.641 46.281 L 17.046 46.447 L 16.08 37.194 Z"
            fill="rgba(214, 139, 150, 0.5)"
          />
          <path
            d="M 22.406 37.028 L 24.001 37.194 L 23.035 46.447 L 21.44 46.281 Z"
            fill="rgba(214, 139, 150, 0.5)"
          />

          {/* Thân khinh khí cầu: vòm ngoài hồng pastel + các múi trắng/hồng + đổ bóng tạo khối */}
          <path
            d="M 3.318 31.11 A 20.06 20.06 0 1 1 36.802 31.11 Z"
            fill="#D68B96"
          />
          <path
            d="M 35.91 20.046 C 35.91 24.135 34.94 27.938 33.275 31.11 L 6.792 31.11 C 5.126 27.938 4.157 24.135 4.157 20.046 C 4.157 9.018 11.21 0.07 19.931 0.001 C 19.965 0 19.999 0 20.033 0 C 20.068 0 20.102 0 20.136 0.001 C 28.857 0.07 35.91 9.018 35.91 20.046 Z"
            fill="#FFFFFF"
          />
          <path
            d="M 27.977 20.046 C 27.977 24.135 27.494 27.938 26.663 31.11 L 13.456 31.11 C 12.626 27.938 12.142 24.135 12.142 20.046 C 12.142 8.975 15.687 0 20.06 0 C 24.433 0 27.977 8.975 27.977 20.046 Z"
            fill="#D68B96"
          />
          <path
            d="M 20.06 0 A 20.06 20.06 0 0 1 36.802 31.11 L 20.06 31.11 Z"
            fill="#040000"
            fillOpacity="0.1"
          />

          {/* Cổ phễu nối khít đáy cầu */}
          <path
            d="M 36.802 31.08 L 31.491 37.954 L 8.661 37.954 L 3.318 31.08 Z"
            fill="#D68B96"
          />

          {/* Giỏ mây và túi cát */}
          <path
            d="M 28.734 44.083 L 28.734 50.364 C 28.734 52.082 27.957 53.629 26.729 54.671 C 25.741 55.502 24.474 56.008 23.091 56.008 L 17.02 56.008 C 16.522 56.008 16.04 55.945 15.582 55.821 C 14.766 55.603 14.012 55.207 13.382 54.671 C 12.511 53.932 11.866 52.937 11.563 51.802 C 11.439 51.344 11.376 50.862 11.376 50.364 L 11.376 44.083 L 28.734 44.083 Z"
            fill="#A87B5D"
          />
          <path
            d="M 26.746 54.694 C 25.762 55.526 24.492 56.03 23.111 56.03 L 17.035 56.03 C 15.653 56.03 14.384 55.526 13.4 54.694 Z"
            fill="#997053"
          />
          <path
            d="M 11.376 45.943 L 28.734 45.943 L 28.734 47.311 L 11.376 47.311 Z M 11.376 48.508 L 28.734 48.508 L 28.734 49.876 L 11.376 49.876 Z"
            fill="#CFA385"
          />
          <path
            d="M 26.566 47.08 C 26.566 48.25 25.774 49.198 24.796 49.198 C 23.819 49.198 23.026 48.25 23.026 47.08 C 23.026 45.91 24.281 43.81 24.796 43.81 C 25.444 43.81 26.566 45.91 26.566 47.08 Z"
            fill="#FFFFFF"
          />

          {/* Ánh sáng nhẹ góc trên-trái */}
          <path
            d="M 37.65 10.416 L 10.082 37.954 L 8.661 37.954 L 3.318 31.08 A 20.06 20.06 0 1 1 37.65 10.416 Z"
            fill="#FFFFFF"
            fillOpacity="0.1"
          />
        </svg>
      </div>
    </div>
  )
}
