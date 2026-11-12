import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import CountdownTimer from './components/CountdownTimer'
import About from './components/About'
import Newsletter from './components/Newsletter'
import Adventures from './components/Adventures'
import Instagram from './components/Instagram'
import Footer from './components/Footer'
import StickyBottomBar from './components/StickyBottomBar'
import BackgroundMusic from './components/BackgroundMusic'
import CoverCard from './components/CoverCard'
import HostInviteTool from './components/HostInviteTool'
import { InvitationProvider, useInvitation } from './invitationContext'
import {
  useContentProtection,
  useReveal,
  useScrollSpy,
  useHeaderSolid,
  useSmoothScroll,
} from './hooks'

const SECTION_IDS = ['top', 'countdown', 'about', 'contact', 'adventures', 'instagram']

/** Các section không có mục nav riêng sẽ dùng lại mục gần nhất */
const NAV_TARGET = {
  top: 'top',
  countdown: 'top',
  about: 'about',
  contact: 'contact',
  adventures: 'adventures',
  instagram: 'instagram',
}

function AppContent() {
  useContentProtection()
  useSmoothScroll()
  useReveal()
  const activeSection = useScrollSpy(useMemo(() => SECTION_IDS, []))
  const activeId = NAV_TARGET[activeSection]
  const headerSolid = useHeaderSolid()
  const { isHostMode, hostPanelOpen, previewRequestCount } = useInvitation()

  const shellRef = useRef(null)
  const coverTimerRef = useRef(null)
  const [coverState, setCoverState] = useState(() => {
    if (typeof window === 'undefined') return 'open'
    if (isHostMode) return 'closed'
    const hash = window.location.hash
    return hash && hash.length > 1 && hash !== '#top' ? 'closed' : 'open'
  }) // 'open' | 'opening' | 'closed'

  // Khi chủ thiệp bấm "Xem thử toàn bộ thiệp", mở lại CoverCard từ đầu trang
  useEffect(() => {
    if (previewRequestCount === 0) return
    if (coverTimerRef.current) clearTimeout(coverTimerRef.current)
    setCoverState('open')
    window.scrollTo(0, 0)
  }, [previewRequestCount])

  useEffect(() => {
    const shell = shellRef.current
    const shouldLockBackground = coverState === 'open' || hostPanelOpen

    if (shouldLockBackground) {
      document.body.classList.add('is-locked')
      if (coverState === 'open') window.scrollTo(0, 0)
      shell?.setAttribute('inert', '')
      return () => {
        document.body.classList.remove('is-locked')
        shell?.removeAttribute('inert')
      }
    }
    shell?.removeAttribute('inert')
    document.body.classList.remove('is-locked')
    return undefined
  }, [coverState, hostPanelOpen])

  useEffect(() => {
    return () => {
      if (coverTimerRef.current) clearTimeout(coverTimerRef.current)
    }
  }, [])

  const handleOpenCover = () => {
    if (coverState !== 'open') return
    document.body.classList.remove('is-locked')
    setCoverState('opening')
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    coverTimerRef.current = setTimeout(() => {
      setCoverState('closed')
    }, reduced ? 60 : 720)
  }

  // Hỗ trợ mở thẳng link có #anchor (ví dụ /#contact) sau khi React mount
  useEffect(() => {
    const hash = window.location.hash
    if (!hash || hash.length < 2) return
    const id = decodeURIComponent(hash.slice(1))
    const jumpToTarget = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior: 'auto' })
      }
    }
    const raf = requestAnimationFrame(jumpToTarget)
    const timer = setTimeout(jumpToTarget, 180)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {coverState !== 'closed' && !hostPanelOpen && (
        <CoverCard closing={coverState === 'opening'} onOpen={handleOpenCover} />
      )}

      <HostInviteTool />

      <div ref={shellRef} className="site-shell">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <Header activeId={activeId} solid={headerSolid} />

        <main id="main">
          <Hero entered={coverState !== 'open'} />
          <CountdownTimer />
          <About />
          <Newsletter />
          <Adventures />
          <Instagram />
        </main>

        <Footer />
        <StickyBottomBar />
        <BackgroundMusic solid={headerSolid} />
      </div>
    </>
  )
}

export default function App() {
  return (
    <InvitationProvider>
      <AppContent />
    </InvitationProvider>
  )
}