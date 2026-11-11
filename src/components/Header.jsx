import { useEffect, useRef, useState } from 'react'
import { NAV_LINKS } from '../data'

/**
 * Header 66px: menu trái — logo phải trên desktop.
 * Khi ở trên hero: header trong suốt, chữ trắng. Cuộn qua hero thì đổi sang
 * nền kem và ghim lên đầu trang.
 * Ở mobile: logo bên trái + nút menu mở drawer.
 */
function FlowerIcon() {
  return (
    <span className="nav__flower" aria-hidden="true">
      <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
        <circle cx="9" cy="4.8" r="3.8" fill="#F4ABBA" />
        <circle cx="9" cy="13.2" r="3.8" fill="#F4ABBA" />
        <circle cx="4.8" cy="9" r="3.8" fill="#F4ABBA" />
        <circle cx="13.2" cy="9" r="3.8" fill="#F4ABBA" />
        <circle cx="9" cy="9" r="2.4" fill="#FFF2E2" />
      </svg>
    </span>
  )
}

export default function Header({ solid, activeId }) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const firstLinkRef = useRef(null)

  useEffect(() => {
    const drawer = document.getElementById('mobile-menu')
    if (!drawer) return

    // Menu đóng bị inert -> bàn phím không Tab nhầm vào link ẩn,
    // kể cả khi transition của trình duyệt bị treo
    if (!open) {
      drawer.setAttribute('inert', '')
      return
    }

    drawer.removeAttribute('inert')
    document.body.classList.add('is-locked')
    firstLinkRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('is-locked')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <header className={`header ${solid ? 'header--solid' : 'header--on-hero'}`}>
        <div className="container header__inner">
          <nav className="nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                className="nav__link"
                href={link.href}
                aria-current={activeId === link.href.slice(1) ? 'true' : undefined}
              >
                <FlowerIcon />
                <span className="nav__text">{link.label}</span>
              </a>
            ))}
          </nav>

          <a className="logo" href="#top" aria-label="Xuân Mai — về đầu trang">
            <span className="logo__brand">Xuân Mai</span>
            <span className="logo__suffix"> • UIT &apos;26</span>
          </a>

          <button
            ref={toggleRef}
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-toggle__bars" />
            <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </header>

      <div id="mobile-menu" className={`drawer${open ? ' is-open' : ''}`}>
        <div className="drawer__head">
          <span className="logo">
            <span className="logo__brand">Xuân Mai</span>
            <span className="logo__suffix"> • UIT &apos;26</span>
          </span>
          <button className="drawer__close" type="button" onClick={() => setOpen(false)}>
            <span aria-hidden="true">✕</span>
            <span className="visually-hidden">Close menu</span>
          </button>
        </div>

        <nav className="drawer__nav" aria-label="Mobile">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              ref={index === 0 ? firstLinkRef : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}