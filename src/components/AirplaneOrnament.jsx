import { useEffect, useRef } from 'react'

/**
 * Airplane Ornament với vệt khói hồng kép (dual contrails) và chuyển động bay lướt
 * Trích xuất 100% vector SVG & motion matrix từ Framer Advent
 * (SVG #svg-1095829100_6458, #svg1622857382_264, linear-gradient mask)
 */
export default function AirplaneOrnament({ className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let rafId = 0
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        rafId = requestAnimationFrame(() => {
          const el = containerRef.current
          if (el) {
            const rect = el.getBoundingClientRect()
            const windowHeight = window.innerHeight
            // Progress: 0 khi phần tử bắt đầu vào đáy màn hình, 1 khi cuộn qua đỉnh
            const progress = (windowHeight - rect.top) / (windowHeight + rect.height + 250)
            const clamped = Math.max(-0.2, Math.min(1.2, progress))

            // Bay chéo góc 45° hướng về phía trước (lướt từ dưới-phải lên trên-trái)
            const travel = (clamped - 0.5) * -110
            el.style.setProperty('--plane-scroll-x', `${travel}px`)
            el.style.setProperty('--plane-scroll-y', `${travel}px`)
          }
          ticking = false
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={containerRef} className={`airplane-ornament ${className}`} aria-hidden="true">
      <div className="airplane-ornament__track">
        {/* Vùng vệt khói kép với gradient mask tan biến tự nhiên */}
        <div className="airplane-ornament__mask-wrap">
          {/* Vệt khói 1 - cánh phải */}
          <div className="airplane-ornament__trail trail--1">
            <svg
              viewBox="0 0 281.5 281.5"
              className="airplane-ornament__trail-svg"
              overflow="visible"
            >
              <path
                d="M 0 0 L 281.5 281.5"
                fill="none"
                stroke="rgba(214, 138, 149, 0.42)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Vệt khói 2 - cánh trái (lệch chéo 19px song song) */}
          <div className="airplane-ornament__trail trail--2">
            <svg
              viewBox="0 0 281.5 281.5"
              className="airplane-ornament__trail-svg"
              overflow="visible"
            >
              <path
                d="M 0 0 L 281.5 281.5"
                fill="none"
                stroke="rgba(214, 138, 149, 0.42)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Thân chiếc máy bay cánh đôi vintage màu hồng pastel Framer Advent */}
        <div className="airplane-ornament__plane-body">
          <svg
            viewBox="0 0 30 30"
            width="30"
            height="30"
            className="airplane-ornament__plane-svg"
            overflow="visible"
          >
            <g>
              {/* Đuôi máy bay */}
              <path
                d="M 8.346 28.945 C 9.108 29.706 10.342 29.706 11.103 28.945 C 11.864 28.184 11.864 26.949 11.103 26.188 L 3.826 18.911 C 3.064 18.15 1.83 18.15 1.069 18.911 C 0.308 19.672 0.308 20.906 1.069 21.668 Z"
                fill="#D68B96"
              />
              {/* Động cơ / cánh quạt mũi */}
              <path
                d="M 20.566 7.32 C 20.566 6.157 21.509 5.215 22.672 5.215 C 23.835 5.215 24.777 6.157 24.777 7.32 C 24.777 8.483 23.835 9.426 22.672 9.426 C 21.509 9.426 20.566 8.483 20.566 7.32 Z"
                fill="rgb(201, 100, 115)"
              />
              {/* Bóng đổ chi tiết */}
              <path
                d="M 22.961 7.028 C 22.401 6.468 21.864 6.021 21.345 5.684 C 21.287 5.73 21.232 5.779 21.18 5.832 C 20.358 6.654 20.358 7.987 21.18 8.809 C 22.002 9.631 23.335 9.631 24.158 8.809 C 24.21 8.757 24.26 8.701 24.307 8.643 C 23.97 8.127 23.524 7.591 22.961 7.028 Z M 4.451 19.537 C 3.519 20.646 2.811 21.473 2.559 21.725 C 2.317 21.966 2.107 22.238 1.934 22.532 L 7.457 28.056 C 7.752 27.883 8.023 27.672 8.265 27.431 C 8.517 27.178 9.343 26.471 10.452 25.538 Z"
                fill="rgb(0,0,0)"
                opacity="0.18"
              />
              {/* Thân giữa màu kem hồng */}
              <path
                d="M 22.496 7.508 C 20.7 5.712 18.779 4.719 16.983 6.516 C 14.888 8.611 4.633 21.292 3.365 22.56 C 2.238 23.687 2.238 25.514 3.365 26.64 C 4.491 27.767 6.318 27.767 7.445 26.64 C 8.713 25.372 21.394 15.117 23.489 13.022 C 25.286 11.225 24.293 9.305 22.496 7.508 Z"
                fill="rgb(239, 210, 214)"
              />
              {/* Vòng định vị thân */}
              <path
                d="M 10.723 17.164 C 10.723 16.001 11.665 15.059 12.828 15.059 C 13.991 15.059 14.933 16.001 14.933 17.164 C 14.933 18.327 13.991 19.269 12.828 19.269 C 11.665 19.269 10.723 18.327 10.723 17.164 Z"
                fill="rgb(201, 100, 115)"
              />
              {/* Bóng cánh */}
              <path
                d="M 16.318 7.207 C 14.834 8.853 11.981 12.278 9.316 15.486 L 14.5 20.67 C 17.708 18.005 21.134 15.152 22.779 13.668 Z"
                fill="rgb(0,0,0)"
                opacity="0.18"
              />
              {/* Cánh chính màu hồng #D68B96 */}
              <path
                d="M 22.534 26.888 C 24.133 28.486 26.725 28.486 28.323 26.887 C 29.922 25.289 29.922 22.697 28.323 21.099 L 8.921 1.697 C 7.323 0.098 4.731 0.098 3.133 1.697 C 1.534 3.296 1.534 5.887 3.133 7.486 Z"
                fill="#D68B96"
              />
              {/* Vạch kẻ trang trí trên cánh */}
              <path d="M 8.157 12.51 L 7.471 11.824 L 13.26 6.035 L 13.946 6.722 Z" fill="rgba(0,0,0,0.18)" />
              <path d="M 4.817 9.171 L 4.131 8.484 L 9.92 2.695 L 10.606 3.382 Z" fill="rgba(0,0,0,0.18)" />
              <path d="M 18.177 22.53 L 17.49 21.843 L 23.279 16.055 L 23.966 16.741 Z" fill="rgba(0,0,0,0.18)" />
              <path d="M 21.517 25.87 L 20.83 25.183 L 26.619 19.395 L 27.306 20.081 Z" fill="rgba(0,0,0,0.18)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
