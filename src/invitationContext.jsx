import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  buildPersonalizedCopy,
  decodeInviteToken,
  detectPresetFromName,
  sanitizeOverrides,
} from './personalization'

const SESSION_INVITE_KEY = 'wanderblush_active_invite_v1'
const DEFAULT_INVITE = { preset: 'chung', name: '', note: '', overrides: {} }

const InvitationContext = createContext(null)

function readInitialState() {
  if (typeof window === 'undefined') {
    return { invite: DEFAULT_INVITE, isHostMode: false, shouldCleanUrl: false }
  }

  try {
    const params = new URLSearchParams(window.location.search)
    const hostParam = params.get('host') || params.get('tao-thiep')
    const isHostMode = hostParam === '1' || hostParam === 'true'

    const tokenParam = params.get('i')
    if (tokenParam) {
      const decoded = decodeInviteToken(tokenParam)
      if (decoded) {
        const resolved = {
          preset: decoded.preset,
          name: decoded.name || '',
          note: decoded.note || '',
          overrides: sanitizeOverrides(decoded.overrides),
        }
        if (!isHostMode) {
          try {
            window.sessionStorage.setItem(SESSION_INVITE_KEY, JSON.stringify(resolved))
          } catch {
            // Bỏ qua nếu trình duyệt chặn sessionStorage
          }
        }
        return {
          invite: resolved,
          isHostMode,
          shouldCleanUrl: !isHostMode,
        }
      }
      return {
        invite: DEFAULT_INVITE,
        isHostMode,
        shouldCleanUrl: !isHostMode,
      }
    }

    const legacyName =
      params.get('to') || params.get('guest') || params.get('name') || params.get('khach')
    const legacyPreset = params.get('p')
    if (legacyName || legacyPreset) {
      const cleanName = (legacyName || '').trim()
      const preset = legacyPreset || detectPresetFromName(cleanName) || 'ban'
      const resolved = { preset, name: cleanName, note: '', overrides: {} }
      if (!isHostMode) {
        try {
          window.sessionStorage.setItem(SESSION_INVITE_KEY, JSON.stringify(resolved))
        } catch {
          // Bỏ qua nếu trình duyệt chặn sessionStorage
        }
      }
      return {
        invite: resolved,
        isHostMode,
        shouldCleanUrl: !isHostMode,
      }
    }

    if (!isHostMode) {
      try {
        const saved = window.sessionStorage.getItem(SESSION_INVITE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === 'object' && parsed.preset) {
            return {
              invite: {
                preset: parsed.preset,
                name: String(parsed.name || ''),
                note: String(parsed.note || ''),
                overrides: sanitizeOverrides(parsed.overrides),
              },
              isHostMode: false,
              shouldCleanUrl: false,
            }
          }
        }
      } catch {
        // ignore invalid storage
      }
    }

    return { invite: DEFAULT_INVITE, isHostMode, shouldCleanUrl: false }
  } catch {
    return { invite: DEFAULT_INVITE, isHostMode: false, shouldCleanUrl: false }
  }
}

export function InvitationProvider({ children }) {
  const [initial] = useState(() => readInitialState())
  const [invite, setInvite] = useState(initial.invite)
  const [isHostMode] = useState(initial.isHostMode)
  const [hostPanelOpen, setHostPanelOpen] = useState(initial.isHostMode)
  const [previewRequestCount, setPreviewRequestCount] = useState(0)

  // Sau khi đã đọc xong ?i=... từ đường dẫn, tự làm sạch thanh địa chỉ trình duyệt
  useEffect(() => {
    if (!initial.shouldCleanUrl || typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      const params = url.searchParams
      const keysToStrip = ['i', 'to', 'guest', 'name', 'khach', 'p']
      let changed = false
      for (const k of keysToStrip) {
        if (params.has(k)) {
          params.delete(k)
          changed = true
        }
      }
      if (changed) {
        const nextSearch = params.toString()
        const cleanHref = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`
        window.history.replaceState(null, '', cleanHref)
      }
    } catch {
      // ignore
    }
  }, [initial.shouldCleanUrl])

  const copy = useMemo(() => buildPersonalizedCopy(invite), [invite])

  const startGuestPreview = useCallback((nextInvite) => {
    setInvite({
      preset: nextInvite?.preset || 'chung',
      name: String(nextInvite?.name || '').trim(),
      note: String(nextInvite?.note || '').trim(),
      overrides: sanitizeOverrides(nextInvite?.overrides),
    })
    setHostPanelOpen(false)
    setPreviewRequestCount((c) => c + 1)
  }, [])

  const reopenHostPanel = useCallback(() => {
    setHostPanelOpen(true)
  }, [])

  const resetPreview = useCallback(() => {
    setInvite(DEFAULT_INVITE)
    try {
      window.sessionStorage.removeItem(SESSION_INVITE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(
    () => ({
      invite,
      copy,
      isHostMode,
      hostPanelOpen,
      previewRequestCount,
      startGuestPreview,
      reopenHostPanel,
      resetPreview,
    }),
    [
      invite,
      copy,
      isHostMode,
      hostPanelOpen,
      previewRequestCount,
      startGuestPreview,
      reopenHostPanel,
      resetPreview,
    ]
  )

  return <InvitationContext.Provider value={value}>{children}</InvitationContext.Provider>
}

export function useInvitation() {
  const ctx = useContext(InvitationContext)
  if (ctx) return ctx
  const fallbackInvite = DEFAULT_INVITE
  return {
    invite: fallbackInvite,
    copy: buildPersonalizedCopy(fallbackInvite),
    isHostMode: false,
    hostPanelOpen: false,
    previewRequestCount: 0,
    startGuestPreview: () => {},
    reopenHostPanel: () => {},
    resetPreview: () => {},
  }
}
