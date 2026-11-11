import { useEffect, useRef } from 'react'

/**
 * Đầu section dùng chung: bông hoa 4 cánh bo tròn xoay nhịp nhàng + nhãn viết tay + tiêu đề
 * Clone 1:1 từ Framer Advent (Variant 1 Flower & SVG #2441539992)
 */
export default function SectionHead({ tagline, title, id, className = '' }) {
  const flowerRef = useRef(null)

  useEffect(() => {
    let rafId = 0
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        rafId = requestAnimationFrame(() => {
          const el = flowerRef.current
          if (el) {
            const scrollY = window.scrollY || window.pageYOffset || 0
            // Xoay thêm theo tỉ lệ scroll (0.08 độ mỗi px cuộn)
            const rot = (scrollY * 0.08) % 360
            el.style.setProperty('--scroll-flower-rot', `${rot}deg`)
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
    <div className={`section-head ${className}`}>
      {/* Bông hoa xoay kết hợp xoay theo scroll & xoay ambient vô tận */}
      <div ref={flowerRef} className="section-head__flower-wrap" aria-hidden="true">
        <svg
          className="section-head__flower-svg"
          viewBox="0 0 18 18"
          width="28"
          height="28"
          fill="none"
          role="presentation"
        >
          <g>
            {/* Cánh trên */}
            <path
              d="M 10.001 5 C 10.001 7.762 7.762 10.001 5 10.001 C 2.239 10.001 0 7.762 0 5 C 0 2.239 2.239 0 5 0 C 7.762 0 10.001 2.239 10.001 5 Z"
              fill="rgb(244, 171, 186)"
              transform="translate(4.005 0)"
            />
            {/* Cánh dưới */}
            <path
              d="M 10.001 5 C 10.001 7.762 7.762 10.001 5 10.001 C 2.239 10.001 0 7.762 0 5 C 0 2.239 2.239 0 5 0 C 7.762 0 10.001 2.239 10.001 5 Z"
              fill="rgb(244, 171, 186)"
              transform="translate(4.005 7.999)"
            />
            {/* Cánh trái */}
            <path
              d="M 5 0 C 7.762 0 10.001 2.239 10.001 5 C 10.001 7.762 7.762 10.001 5 10.001 C 2.239 10.001 0 7.762 0 5 C 0 2.239 2.239 0 5 0 Z"
              fill="rgb(244, 171, 186)"
              transform="translate(0 4.005)"
            />
            {/* Cánh phải */}
            <path
              d="M 5 0 C 7.762 0 10.001 2.239 10.001 5 C 10.001 7.762 7.762 10.001 5 10.001 C 2.239 10.001 0 7.762 0 5 C 0 2.239 2.239 0 5 0 Z"
              fill="rgb(244, 171, 186)"
              transform="translate(7.999 4.005)"
            />
            {/* Đốm chuyển tiếp giữa cánh */}
            <path
              d="M 5.48 5.825 C 5.559 5.362 5.572 4.881 5.512 4.39 C 5.178 1.669 2.718 -0.271 0 0.031 C 0.021 0.031 0.041 0.029 0.062 0.029 C 2.824 0.029 5.062 2.269 5.062 5.029 C 5.062 5.341 5.033 5.647 4.979 5.943 Z"
              fill="rgb(245, 237, 225)"
              transform="translate(8.944 7.977)"
            />
            <path
              d="M 5.943 0.571 C 5.648 0.516 5.343 0.488 5.03 0.488 C 2.268 0.488 0.029 2.727 0.029 5.489 C 0.029 5.509 0.031 5.53 0.031 5.551 C -0.27 2.833 1.67 0.371 4.39 0.038 C 4.881 -0.022 5.362 -0.01 5.824 0.07 Z"
              fill="rgb(245, 237, 225)"
              transform="translate(7.966 3.51)"
            />
            <path
              d="M 0.571 0 C 0.515 0.302 0.488 0.608 0.488 0.914 C 0.488 3.676 2.725 5.914 5.488 5.914 L 5.549 5.914 C 2.832 6.214 0.371 4.274 0.038 1.553 C -0.022 1.062 -0.01 0.581 0.069 0.118 Z"
              fill="rgb(245, 237, 225)"
              transform="translate(3.51 4.084)"
            />
            <path
              d="M 0.118 5.48 C 0.581 5.559 1.062 5.572 1.553 5.512 C 4.272 5.178 6.212 2.716 5.912 0 C 5.912 0.019 5.914 0.041 5.914 0.062 C 5.914 2.822 3.675 5.062 0.912 5.062 C 0.6 5.062 0.295 5.033 0 4.979 Z"
              fill="rgb(245, 237, 225)"
              transform="translate(4.084 8.944)"
            />
            {/* Tâm hoa tròn màu kem */}
            <path
              d="M 5.177 2.589 C 5.177 4.018 4.018 5.177 2.588 5.177 C 1.159 5.177 0 4.018 0 2.589 C 0 1.159 1.159 0 2.588 0 C 4.018 0 5.177 1.159 5.177 2.589 Z"
              fill="rgb(245, 237, 225)"
              transform="translate(6.413 6.413)"
            />
            {/* Bóng đổ tâm hoa */}
            <path
              d="M 3.647 0 C 4.031 0.452 4.265 1.036 4.265 1.676 C 4.265 3.106 3.106 4.265 1.676 4.265 C 1.037 4.265 0.452 4.031 0 3.647 C 0.475 4.204 1.181 4.559 1.97 4.559 C 3.4 4.559 4.559 3.4 4.559 1.97 C 4.559 1.181 4.204 0.475 3.647 0 Z"
              fill="rgba(214, 139, 188, 0.12)"
              transform="translate(7.032 7.032)"
            />
          </g>
        </svg>
      </div>

      <span className="section-head__tagline">{tagline}</span>
      <h2 className="section-head__title" id={id}>
        {title}
      </h2>
    </div>
  )
}