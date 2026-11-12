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
 * Cuộn mượt quán tính trên desktop (wheel); mobile cảm ứng dùng cuộn gốc (compositor scroll)
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return undefined
    const isCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false
    if (isCoarsePointer) return undefined

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
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
 * - Dùng IntersectionObserver gốc (0 reflow mỗi frame cuộn)
 * - Chạy một lần duy nhất rồi tự hủy quan sát để tránh giật lag
 */
export function useReveal() {
  const reduced = useReducedMotion()

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal, .reveal-group'))
    if (!elements.length) return undefined

    if (reduced) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    let observer = null
    let remaining = elements.length
    const triggerOffset = 18

    const cleanupAll = () => {
      observer?.disconnect()
      window.removeEventListener('resize', checkVisible)
      window.removeEventListener('hashchange', checkVisible)
      document.removeEventListener('click', onAnchorClick)
    }

    const markVisible = (el) => {
      if (el.classList.contains('is-visible')) return
      el.classList.add('is-visible')
      observer?.unobserve(el)
      remaining -= 1
      if (remaining <= 0) {
        cleanupAll()
      }
    }

    const revealBatch = (targets) => {
      if (!targets.length) return

      const pendingCards = []
      const immediate = []

      targets.forEach((el) => {
        if (el.classList.contains('is-visible')) return
        const rect = el.getBoundingClientRect()
        if (el.hasAttribute('data-reveal-card') && rect.bottom >= 0) {
          pendingCards.push({ el, top: rect.top, left: rect.left })
        } else {
          immediate.push(el)
        }
      })

      immediate.forEach(markVisible)

      if (pendingCards.length) {
        pendingCards.sort((a, b) =>
          Math.abs(a.top - b.top) <= 44 ? a.left - b.left : a.top - b.top
        )
        pendingCards.forEach(({ el }, idx) => {
          const delayMs = Math.min(idx, 5) * 120
          el.style.setProperty('--reveal-delay', `${delayMs}ms`)
          markVisible(el)
        })
      }
    }

    function checkVisible() {
      if (remaining <= 0) return
      const triggerY = window.innerHeight - triggerOffset
      const hitting = elements.filter((el) => {
        if (el.classList.contains('is-visible')) return false
        return el.getBoundingClientRect().top <= triggerY
      })
      if (hitting.length) {
        revealBatch(hitting)
      }
    }

    function onAnchorClick(event) {
      if (event.target.closest('a[href^="#"]')) {
        setTimeout(checkVisible, 80)
        setTimeout(checkVisible, 360)
        setTimeout(checkVisible, 720)
      }
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entering = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target)
          if (entering.length) {
            revealBatch(entering)
          }
        },
        {
          threshold: 0.01,
          rootMargin: `0px 0px -${triggerOffset}px 0px`,
        }
      )

      elements.forEach((el) => observer.observe(el))

      checkVisible()
      window.addEventListener('resize', checkVisible, { passive: true })
      window.addEventListener('hashchange', checkVisible)
      document.addEventListener('click', onAnchorClick)

      const timer = setTimeout(checkVisible, 600)

      return () => {
        cleanupAll()
        clearTimeout(timer)
      }
    }

    elements.forEach((el) => el.classList.add('is-visible'))
    return undefined
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
    let threshold = 750

    const measure = () => {
      const hero = document.getElementById('top')
      threshold = hero ? Math.max(120, hero.offsetHeight - 70) : 750
    }

    const update = () => {
      const next = (window.scrollY || window.pageYOffset || 0) >= threshold
      setSolid((prev) => (prev === next ? prev : next))
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    update()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return solid
}

/** Đánh dấu mục nav đang hiển thị (scroll spy) không gây layout thrashing */
export function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    let ticking = false
    let cachedOffsets = []
    let maxScroll = 0

    const measure = () => {
      cachedOffsets = ids
        .map((id) => {
          const el = document.getElementById(id)
          return el ? { id, top: el.offsetTop } : null
        })
        .filter(Boolean)
      maxScroll = document.documentElement.scrollHeight - window.innerHeight
    }

    const update = () => {
      const y = window.scrollY || window.pageYOffset || 0
      const line = y + window.innerHeight * 0.35
      let current = ids[0]

      for (let i = 0; i < cachedOffsets.length; i++) {
        if (cachedOffsets[i].top <= line) {
          current = cachedOffsets[i].id
        }
      }

      if (maxScroll > 0 && y >= maxScroll - 24) {
        current = ids[ids.length - 1]
      }

      setActiveId((prev) => (prev === current ? prev : current))
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    update()

    const remeasureTimer = setTimeout(measure, 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      clearTimeout(remeasureTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [ids])

  return activeId
}