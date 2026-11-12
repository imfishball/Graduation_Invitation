import { useCallback, useEffect, useRef, useState } from 'react'
import { POSTS } from '../data'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  NoteDoodleIcon,
  XIcon,
} from './Icons'
import SectionHead from './SectionHead'
import AirplaneOrnament from './AirplaneOrnament'
import HotAirBalloonOrnament from './HotAirBalloonOrnament'

const SCRAPBOOK_SLOTS = [
  {
    rot: '-2.1deg',
    offsetY: '0px',
    mobileShift: '-5px',
    fastener: 'tape-stripe',
    doodle: 'star',
  },
  {
    rot: '1.3deg',
    offsetY: '24px',
    mobileShift: '5px',
    fastener: 'tape-dots',
    doodle: 'heart',
  },
  {
    rot: '-1.1deg',
    offsetY: '4px',
    mobileShift: '-4px',
    fastener: 'pushpin',
    doodle: 'flower',
  },
  {
    rot: '-1.6deg',
    offsetY: '4px',
    mobileShift: '4px',
    fastener: 'tape-grid',
    doodle: 'sparkle',
  },
  {
    rot: '-1.3deg',
    offsetY: '28px',
    mobileShift: '-5px',
    fastener: 'tape-dots',
    doodle: 'heart',
  },
  {
    rot: '1.4deg',
    offsetY: '2px',
    mobileShift: '5px',
    fastener: 'tape-stripe',
    doodle: 'star',
  },
]

export default function Adventures() {
  const [activeIndex, setActiveIndex] = useState(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [slideDir, setSlideDir] = useState('next')
  const gestureRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    lockedAxis: null,
  })
  const suppressClickRef = useRef(false)

  const total = POSTS.length
  const activePost = activeIndex !== null ? POSTS[activeIndex] : null

  const closeModal = useCallback(() => {
    setActiveIndex(null)
    setSwipeOffset(0)
    gestureRef.current.active = false
  }, [])

  const showPrev = useCallback(() => {
    setSlideDir('prev')
    setSwipeOffset(0)
    setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + total) % total))
  }, [total])

  const showNext = useCallback(() => {
    setSlideDir('next')
    setSwipeOffset(0)
    setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % total))
  }, [total])

  useEffect(() => {
    if (activeIndex === null) return undefined

    document.body.classList.add('is-locked')

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeModal()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        showNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        showPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('is-locked')
    }
  }, [activeIndex, closeModal, showNext, showPrev])

  const startGesture = (clientX, clientY, target) => {
    if (target?.closest?.('button')) return
    gestureRef.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      dx: 0,
      dy: 0,
      lockedAxis: null,
    }
  }

  const moveGesture = (clientX, clientY) => {
    const g = gestureRef.current
    if (!g.active) return
    const dx = clientX - g.startX
    const dy = clientY - g.startY
    g.dx = dx
    g.dy = dy

    if (!g.lockedAxis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      g.lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }

    if (g.lockedAxis === 'x') {
      const clamped = Math.max(-110, Math.min(110, dx * 0.55))
      setSwipeOffset(clamped)
    }
  }

  const endGesture = () => {
    const g = gestureRef.current
    if (!g.active) return
    const { dx, dy } = g
    g.active = false
    setSwipeOffset(0)

    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      suppressClickRef.current = true
      setTimeout(() => {
        suppressClickRef.current = false
      }, 80)
      if (dx < 0) {
        showNext()
      } else {
        showPrev()
      }
    }
  }

  return (
    <section className="section adventures" id="adventures" aria-labelledby="adventures-title">
      {/* Khinh khí cầu lơ lửng bồng bềnh và chuyển động theo scroll */}
      <HotAirBalloonOrnament />

      {/* Máy bay và vệt khói hồng lướt ngang qua tiêu đề */}
      <AirplaneOrnament className="adventures__airplane" />

      <div className="container">
        <SectionHead
          tagline="nhìn lại"
          title="Dấu Ấn Thanh Xuân"
          id="adventures-title"
          className="reveal"
        />

        <div className="scrapbook-grid" role="list" aria-label="Sổ lưu niệm Polaroid 6 dấu ấn thanh xuân">
          {POSTS.map((post, index) => {
            const slot = SCRAPBOOK_SLOTS[index % SCRAPBOOK_SLOTS.length]
            return (
              <div
                className="scrapbook-slot reveal"
                data-reveal-card=""
                role="listitem"
                key={post.slug}
                style={{
                  '--slot-offset-y': slot.offsetY,
                  '--slot-mobile-shift': slot.mobileShift,
                }}
              >
                <button
                  type="button"
                  className="polaroid-memory"
                  style={{ '--memory-rot': slot.rot }}
                  onClick={() => {
                    setSlideDir('next')
                    setSwipeOffset(0)
                    setActiveIndex(index)
                  }}
                  aria-label={`Mở xem kỷ niệm ${post.title} tại ${post.location}`}
                >
                  {slot.fastener === 'pushpin' ? (
                    <span className="sticky-note__pin polaroid-memory__pin" aria-hidden="true" />
                  ) : (
                    <span
                      className={`sticky-note__tape sticky-note__tape--${slot.fastener} polaroid-memory__tape`}
                      aria-hidden="true"
                    />
                  )}

                  <div className="polaroid-memory__media">
                    <img src={post.image} alt={post.alt} loading="eager" decoding="async" draggable={false} />
                  </div>

                  <div className="polaroid-memory__caption">
                    <h3 className="polaroid-memory__title">{post.title}</h3>
                    <div className="polaroid-memory__meta">
                      <span className="polaroid-memory__place">
                        <MapPinIcon size={11} />
                        <span>{post.location}</span>
                      </span>
                      <span className="polaroid-memory__doodle" aria-hidden="true">
                        <NoteDoodleIcon variant={slot.doodle} size={14} />
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {activePost && (
        <div
          className="story-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-modal-title"
          onClick={() => {
            if (suppressClickRef.current) return
            closeModal()
          }}
        >
          <div className="story-modal__backdrop" />

          <div
            className="story-modal__shell"
            onTouchStart={(e) => {
              const t = e.touches[0]
              if (t) startGesture(t.clientX, t.clientY, e.target)
            }}
            onTouchMove={(e) => {
              const t = e.touches[0]
              if (t) moveGesture(t.clientX, t.clientY)
            }}
            onTouchEnd={endGesture}
            onTouchCancel={endGesture}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse' || e.button !== 0) return
              startGesture(e.clientX, e.clientY, e.target)
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse') return
              moveGesture(e.clientX, e.clientY)
            }}
            onPointerUp={(e) => {
              if (e.pointerType !== 'mouse') return
              endGesture()
            }}
            onPointerCancel={endGesture}
          >
            <button
              type="button"
              className="story-modal__side-nav story-modal__side-nav--prev"
              onClick={(e) => {
                e.stopPropagation()
                showPrev()
              }}
              aria-label="Xem kỷ niệm trước"
            >
              <ChevronLeftIcon size={22} />
            </button>

            <article
              key={activePost.slug}
              className={`story-modal__card is-slide-${slideDir}`}
              onClick={(e) => e.stopPropagation()}
              style={
                swipeOffset !== 0
                  ? { transform: `translate3d(${swipeOffset}px, 0, 0)`, transition: 'none' }
                  : undefined
              }
            >
              <div className="story-modal__topbar">
                <span className="story-modal__counter">
                  Kỷ niệm {activeIndex + 1} / {total}
                </span>

                <button
                  type="button"
                  className="story-modal__close"
                  onClick={closeModal}
                  aria-label="Đóng xem kỷ niệm"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div className="story-modal__media">
                <img
                  src={activePost.image}
                  alt={activePost.alt}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>

              <div className="story-modal__body" data-lenis-prevent>
                <span className="story-modal__place">
                  <MapPinIcon size={13} />
                  <span>{activePost.location}</span>
                </span>

                <h3 className="story-modal__title" id="story-modal-title">
                  {activePost.title}
                </h3>

                <p className="story-modal__story">{activePost.excerpt}</p>
              </div>

              <footer className="story-modal__foot">
                <button
                  type="button"
                  className="story-modal__nav-btn"
                  onClick={showPrev}
                  aria-label="Kỷ niệm trước"
                >
                  <ChevronLeftIcon size={16} />
                  <span>Trước</span>
                </button>

                <div className="story-modal__dots" role="tablist" aria-label="Chọn kỷ niệm">
                  {POSTS.map((item, idx) => (
                    <button
                      key={item.slug}
                      type="button"
                      role="tab"
                      aria-selected={idx === activeIndex}
                      aria-label={`Xem kỷ niệm ${idx + 1}: ${item.title}`}
                      className={`story-modal__dot${idx === activeIndex ? ' is-active' : ''}`}
                      onClick={() => {
                        setSlideDir(idx >= activeIndex ? 'next' : 'prev')
                        setActiveIndex(idx)
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="story-modal__nav-btn"
                  onClick={showNext}
                  aria-label="Kỷ niệm tiếp theo"
                >
                  <span>Sau</span>
                  <ChevronRightIcon size={16} />
                </button>
              </footer>
            </article>

            <button
              type="button"
              className="story-modal__side-nav story-modal__side-nav--next"
              onClick={(e) => {
                e.stopPropagation()
                showNext()
              }}
              aria-label="Xem kỷ niệm tiếp theo"
            >
              <ChevronRightIcon size={22} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
