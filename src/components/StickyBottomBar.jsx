import { useEffect, useState } from 'react'
import { GRADUATION_INFO } from '../data'
import { DirectionsIcon, HeartIcon } from './Icons'

export default function StickyBottomBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Hiện thanh khi cuộn qua 300px (qua khỏi Hero)
      if (window.scrollY > 320) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <aside className="mobile-bottom-bar" aria-label="Thao tác nhanh">
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
