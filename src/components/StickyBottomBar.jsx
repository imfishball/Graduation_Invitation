import { useEffect, useState } from 'react'
import { GRADUATION_INFO } from '../data'
import { DirectionsIcon, HeartIcon } from './Icons'

export default function StickyBottomBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false

    const update = () => {
      const next = (window.scrollY || window.pageYOffset || 0) > 320
      setVisible((prev) => (prev === next ? prev : next))
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <aside
      className={`mobile-bottom-bar${visible ? ' is-visible' : ''}`}
      aria-label="Thao tác nhanh"
      aria-hidden={!visible}
    >
      <div className="mobile-bottom-bar__inner">
        <a
          href={GRADUATION_INFO.googleMapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mobile-bottom-btn mobile-bottom-btn--maps"
          aria-label="Chỉ đường Google Maps đến UIT"
        >
          <DirectionsIcon size={14} />
          <span>Chỉ đường</span>
        </a>

        <a
          href="#contact"
          className="mobile-bottom-btn mobile-bottom-btn--rsvp"
          aria-label="Gửi lời chúc mừng đến Xuân Mai"
        >
          <HeartIcon size={14} />
          <span>Gửi lời chúc</span>
        </a>
      </div>
    </aside>
  )
}
