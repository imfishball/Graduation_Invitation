import { useCallback, useEffect, useRef, useState } from 'react'
import { INSTAGRAM } from '../data'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'
import SectionHead from './SectionHead'

const SCATTER_ROTS = ['-2.6deg', '2.2deg', '-1.9deg', '2.5deg']

const PIN_STYLES = [
  { name: 'Hồng phấn', body: '#e08c99', shade: '#c26e7c', hi: '#f2b8c1', rot: '-3deg', drop: '0px' },
  { name: 'Xanh bạc hà', body: '#8ec3a0', shade: '#6ea681', hi: '#b8dfc6', rot: '2.5deg', drop: '2px' },
  { name: 'Vàng mật ong', body: '#ecc066', shade: '#ce9f40', hi: '#f6d994', rot: '-2deg', drop: '0px' },
  { name: 'Xanh trời', body: '#89b7df', shade: '#6797c2', hi: '#b6d4f0', rot: '3deg', drop: '2px' },
  { name: 'Tím oải hương', body: '#b99fd6', shade: '#977bb8', hi: '#d6c4ec', rot: '-2.5deg', drop: '1px' },
  { name: 'Cam đào', body: '#eb9c84', shade: '#cd7c64', hi: '#f6beae', rot: '2deg', drop: '0px' },
  { name: 'Hồng san hô', body: '#d67887', shade: '#b65867', hi: '#ea9fab', rot: '-3deg', drop: '2px' },
  { name: 'Xanh matcha', body: '#a5c685', shade: '#85a765', hi: '#c5ddad', rot: '2.5deg', drop: '0px' },
  { name: 'Nâu kem ấm', body: '#dfa672', shade: '#bf8552', hi: '#efc9a3', rot: '-2deg', drop: '1px' },
]

function Clothespin({ pin }) {
  return (
    <span className="clothespin" aria-hidden="true" style={{ '--pin-rot': pin.rot }}>
      <svg
        className="clothespin__svg"
        viewBox="0 0 32 56"
        width="24"
        height="42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Nửa trái thân kẹp gỗ */}
        <path
          d="M9 5.5C9 3.6 10.6 2 12.5 2H15.3V22H8.5L9 5.5Z"
          fill={pin.body}
          stroke="rgba(52,38,28,0.16)"
          strokeWidth="0.6"
        />
        {/* Nửa phải thân kẹp gỗ tạo khối 3D */}
        <path
          d="M16.7 2H19.5C21.4 2 23 3.6 23 5.5L23.5 22H16.7V2Z"
          fill={pin.shade}
          stroke="rgba(52,38,28,0.16)"
          strokeWidth="0.6"
        />
        {/* Càng kẹp dưới bên trái */}
        <path
          d="M7.6 27.5H15.3V50.5C15.3 51.9 14.2 53 12.8 53H10.5C9.1 53 8 51.9 8.1 50.5L7.6 27.5Z"
          fill={pin.body}
          stroke="rgba(52,38,28,0.18)"
          strokeWidth="0.6"
        />
        {/* Càng kẹp dưới bên phải */}
        <path
          d="M16.7 27.5H24.4L23.9 50.5C24 51.9 22.9 53 21.5 53H19.2C17.8 53 16.7 51.9 16.7 50.5V27.5Z"
          fill={pin.shade}
          stroke="rgba(52,38,28,0.18)"
          strokeWidth="0.6"
        />
        {/* Vệt sáng thớ gỗ sơn nhẹ bên trái */}
        <path d="M10.4 4.5C10.4 3.8 11 3.3 11.6 3.3H12.4V21.2H10L10.4 4.5Z" fill={pin.hi} opacity="0.72" />
        <path
          d="M9.4 28.8H11.4V50.3C11.4 51 11 51.4 10.4 51.4C9.8 51.4 9.5 51 9.5 50.3L9.4 28.8Z"
          fill={pin.hi}
          opacity="0.68"
        />
        {/* Khe tách hai thanh gỗ */}
        <line x1="16" y1="2.5" x2="16" y2="52.5" stroke="rgba(42,32,26,0.28)" strokeWidth="1.15" />
        {/* Lò xo thép uốn giữa eo kẹp */}
        <rect x="6" y="21.4" width="20" height="6.8" rx="2.6" fill="#9ca5b0" />
        <rect x="6.8" y="22.3" width="18.4" height="2.2" rx="1.1" fill="#e1e6ec" />
        <circle cx="9.2" cy="24.8" r="2.1" fill="#7c8590" />
        <circle cx="9.2" cy="24.8" r="0.9" fill="#eef2f6" />
        <circle cx="22.8" cy="24.8" r="2.1" fill="#7c8590" />
        <circle cx="22.8" cy="24.8" r="0.9" fill="#eef2f6" />
        {/* Điểm nhấn mép kẹp tiếp xúc ảnh */}
        <rect x="8.8" y="48.6" width="14.4" height="1.5" rx="0.75" fill="rgba(255,255,255,0.28)" />
      </svg>
    </span>
  )
}

export default function Instagram() {
  const trackRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0 })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const syncScrollButtons = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollPrev(el.scrollLeft > 8)
    setCanScrollNext(el.scrollLeft < maxScroll - 8)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return undefined

    syncScrollButtons()
    const onScroll = () => syncScrollButtons()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [syncScrollButtons])

  const scrollByCard = useCallback((direction) => {
    const el = trackRef.current
    if (!el) return
    const rail = el.querySelector('.instagram__rail') || el
    const cards = Array.from(el.querySelectorAll('.polaroid-hang'))
    const padLeft = parseFloat(window.getComputedStyle(rail).paddingLeft || '24') || 24
    const cur = el.scrollLeft

    if (direction > 0) {
      const next = cards.find((card) => card.offsetLeft - padLeft > cur + 12)
      el.scrollTo({ left: next ? next.offsetLeft - padLeft : el.scrollWidth, behavior: 'smooth' })
    } else {
      const prev = [...cards].reverse().find((card) => card.offsetLeft - padLeft < cur - 12)
      el.scrollTo({ left: prev ? Math.max(0, prev.offsetLeft - padLeft) : 0, behavior: 'smooth' })
    }
  }, [])

  const handlePointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = trackRef.current
    if (!el) return
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
    }
    setIsDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return
    const el = trackRef.current
    if (!el) return
    const dx = e.clientX - dragRef.current.startX
    el.scrollLeft = dragRef.current.startScrollLeft - dx
  }

  const handlePointerEnd = (e) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setIsDragging(false)
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    syncScrollButtons()
  }

  return (
    <section className="section instagram" id="instagram" aria-labelledby="instagram-title">
      <div className="container">
        <SectionHead tagline={INSTAGRAM.script} title="Khoảnh Khắc Kỷ Yếu" id="instagram-title" className="reveal" />

        <div className="instagram__controls reveal">
          <button
            type="button"
            className="instagram__nav-btn"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            aria-label="Xem các ảnh kỷ yếu trước"
          >
            <ChevronLeftIcon size={18} />
          </button>

          <button
            type="button"
            className="instagram__nav-btn"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            aria-label="Xem thêm các ảnh kỷ yếu tiếp theo"
          >
            <ChevronRightIcon size={18} />
          </button>
        </div>
      </div>

      <div className="instagram__viewport">
        <div
          ref={trackRef}
          className={`instagram__grid${isDragging ? ' is-dragging' : ''}`}
          tabIndex={0}
          role="region"
          aria-label="Dây ảnh kỷ yếu kẹp gỗ nhiều màu, cuộn ngang để xem thêm"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              scrollByCard(1)
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault()
              scrollByCard(-1)
            }
          }}
        >
          <div className="instagram__rail reveal-group">
            <div className="instagram__cord" aria-hidden="true" />

            {INSTAGRAM.photos.map((photo, index) => {
              const pin = PIN_STYLES[index % PIN_STYLES.length]
              const w = photo.width || 1200
              const h = photo.height || 1200
              const isWide = w > h
              return (
                <div
                  key={photo.image}
                  className={`polaroid-hang reveal-item${isWide ? ' polaroid-hang--wide' : ''}`}
                  style={{
                    '--stagger': index,
                    '--hang-drop': pin.drop,
                  }}
                >
                  <Clothespin pin={pin} />
                  <div
                    className="polaroid"
                    style={{
                      '--card-rot': SCATTER_ROTS[index % SCATTER_ROTS.length],
                    }}
                  >
                    <img
                      src={photo.image}
                      alt={photo.alt}
                      width={w}
                      height={h}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}