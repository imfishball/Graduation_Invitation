import { useEffect, useState } from 'react'
import Lenis from 'lenis'

/** Kiểm tra phần tử có phải vùng nhập liệu cho phép chọn/sao chép nội dung người dùng gõ hay không */
function isEditableTarget(target) {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')
  )
}

/** Chặn chuột phải, kéo thả ảnh, bôi đen/sao chép trang và các phím tắt mở DevTools/lấy mã nguồn */
export function useContentProtection() {
  useEffect(() => {
    const captureOpts = { capture: true }

    const handleContextMenu = (event) => {
      event.preventDefault()
    }

    const handleDragStart = (event) => {
      event.preventDefault()
    }

    const handleSelectStart = (event) => {
      if (!isEditableTarget(event.target)) {
        event.preventDefault()
      }
    }

    const handleCopyOrCut = (event) => {
      if (!isEditableTarget(event.target)) {
        event.preventDefault()
      }
    }

    const handleKeyDown = (event) => {
      const key = typeof event.key === 'string' ? event.key.toLowerCase() : ''
      const mod = event.ctrlKey || event.metaKey
      const inEditable = isEditableTarget(event.target) || isEditableTarget(document.activeElement)

      if (key === 'f12' || key === 'contextmenu' || (event.shiftKey && key === 'f10')) {
        event.preventDefault()
        return
      }

      if (
        (mod && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) ||
        (event.metaKey && event.altKey && ['i', 'j', 'c', 'u'].includes(key))
      ) {
        event.preventDefault()
        return
      }

      if (mod && !event.altKey && ['u', 's', 'p'].includes(key)) {
        event.preventDefault()
        return
      }

      if (mod && !event.altKey && !event.shiftKey && ['a', 'c', 'x'].includes(key) && !inEditable) {
        event.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu, captureOpts)
    document.addEventListener('dragstart', handleDragStart, captureOpts)
    document.addEventListener('selectstart', handleSelectStart, captureOpts)
    document.addEventListener('copy', handleCopyOrCut, captureOpts)
    document.addEventListener('cut', handleCopyOrCut, captureOpts)
    document.addEventListener('keydown', handleKeyDown, captureOpts)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, captureOpts)
      document.removeEventListener('dragstart', handleDragStart, captureOpts)
      document.removeEventListener('selectstart', handleSelectStart, captureOpts)
      document.removeEventListener('copy', handleCopyOrCut, captureOpts)
      document.removeEventListener('cut', handleCopyOrCut, captureOpts)
      document.removeEventListener('keydown', handleKeyDown, captureOpts)
    }
  }, [])
}

/** Kiểm tra người dùng có bật tuỳ chọn giảm chuyển động không */
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setReduced(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Cuộn mượt quán tính (Lenis smooth inertia scroll)
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    let rafId = 0
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [reduced])
}

/**
 * Hiệu ứng Reveal khi cuộn: quan sát .reveal và .reveal-group
 * Sử dụng IntersectionObserver hiệu năng cao kèm fallback kiểm tra hình học
 */
export function useReveal() {
  const reduced = useReducedMotion()

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal, .reveal-group'))
    if (reduced) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const checkVisible = () => {
      const triggerY = window.innerHeight + 160
      elements.forEach((el) => {
        if (el.classList.contains('is-visible')) return
        const rect = el.getBoundingClientRect()
        if (rect.top < triggerY) {
          el.classList.add('is-visible')
        }
      })
    }

    let scrollRaf = 0
    const onScrollOrResize = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        checkVisible()
      })
    }

    const onAnchorClick = (event) => {
      if (event.target.closest('a[href^="#"]')) {
        setTimeout(checkVisible, 80)
        setTimeout(checkVisible, 360)
      }
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.01,
          rootMargin: '140px 0px 80px 0px',
        }
      )

      elements.forEach((el) => observer.observe(el))

      checkVisible()
      window.addEventListener('scroll', onScrollOrResize, { passive: true })
      window.addEventListener('resize', onScrollOrResize, { passive: true })
      window.addEventListener('hashchange', checkVisible)
      document.addEventListener('click', onAnchorClick)

      const timer = setTimeout(checkVisible, 600)

      return () => {
        observer.disconnect()
        if (scrollRaf) cancelAnimationFrame(scrollRaf)
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
        window.removeEventListener('hashchange', checkVisible)
        document.removeEventListener('click', onAnchorClick)
        clearTimeout(timer)
      }
    } else {
      elements.forEach((el) => el.classList.add('is-visible'))
    }
  }, [reduced])
}

/**
 * Header trong suốt chữ trắng khi ở trên Hero,
 * chuyển sang nền kem + chữ đen khi cuộn qua hết Hero.
 */
export function useHeaderSolid() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const hero = document.getElementById('top')
          if (hero) {
            const rect = hero.getBoundingClientRect()
            setSolid(rect.bottom <= 70)
          } else {
            setSolid(window.scrollY > 750)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return solid
}

/** Đánh dấu mục nav đang hiển thị (scroll spy) */
export function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    let ticking = false

    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.35
      let current = ids[0]

      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= line) current = id
      }

      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 20) {
        current = ids[ids.length - 1]
      }

      setActiveId(current)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return activeId
}