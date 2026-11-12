import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { INITIAL_GUESTBOOK, NEWSLETTER } from '../data'
import { useInvitation } from '../invitationContext'
import {
  buildInitialGuestbook,
  dispatchNotesSync,
  mergeServerNotes,
  NOTES_SYNC_EVENT,
  removeNoteFromLocalCaches,
} from '../notesSync'
import {
  buildPersonalizedCopy,
  detectPresetFromName,
  encodeInviteToken,
  INVITE_PRESETS,
  sanitizeOverrides,
} from '../personalization'
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  EditPenIcon,
  EyeIcon,
  EyeOffIcon,
  LinkIcon,
  LockIcon,
  RefreshIcon,
  TrashIcon,
  XIcon,
} from './Icons'

const HOST_HISTORY_KEY = 'wanderblush_host_invite_history_v1'
const HOST_AUTH_TOKEN_KEY = 'wanderblush_host_auth_token_v1'
const SELECTABLE_PRESETS = INVITE_PRESETS.filter((p) => p.id !== 'chung')

function AutoTextarea({ value, onChange, ...props }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const syncHeight = () => {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
    syncHeight()
    window.addEventListener('resize', syncHeight)
    return () => window.removeEventListener('resize', syncHeight)
  }, [value])

  return <textarea ref={ref} rows={1} value={value} onChange={onChange} {...props} />
}

function fallbackCopyText(text) {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return fallbackCopyText(text)
    }
  }
  return fallbackCopyText(text)
}

export default function HostInviteTool() {
  const { isHostMode, hostPanelOpen, startGuestPreview, resetPreview } = useInvitation()

  const [authStatus, setAuthStatus] = useState(() => {
    if (!isHostMode || typeof window === 'undefined') return 'locked'
    try {
      return window.sessionStorage.getItem(HOST_AUTH_TOKEN_KEY) ? 'checking' : 'locked'
    } catch {
      return 'locked'
    }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!isHostMode || authStatus !== 'checking') return undefined
    let cancelled = false

    const verifySavedSession = async () => {
      let savedToken = ''
      try {
        savedToken = window.sessionStorage.getItem(HOST_AUTH_TOKEN_KEY) || ''
      } catch {
        savedToken = ''
      }

      if (!savedToken) {
        if (!cancelled) setAuthStatus('locked')
        return
      }

      try {
        const res = await fetch('/api/host-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', token: savedToken }),
        })
        const data = await res.json().catch(() => ({}))
        if (!cancelled && res.ok && data?.ok) {
          setAuthStatus('unlocked')
          return
        }
      } catch {
        // Phiên cũ không hợp lệ hoặc mất kết nối -> yêu cầu nhập lại mật khẩu
      }

      try {
        window.sessionStorage.removeItem(HOST_AUTH_TOKEN_KEY)
      } catch {
        // ignore
      }
      if (!cancelled) setAuthStatus('locked')
    }

    verifySavedSession()
    return () => {
      cancelled = true
    }
  }, [isHostMode, authStatus])

  if (!isHostMode) return null

  const handleCloseToDefault = () => {
    resetPreview()
    startGuestPreview({ preset: 'chung', name: '', note: '', overrides: {} })
  }

  const handleLockSession = (notice = '') => {
    try {
      window.sessionStorage.removeItem(HOST_AUTH_TOKEN_KEY)
    } catch {
      // ignore
    }
    setPassword('')
    setShowPassword(false)
    setAuthError(typeof notice === 'string' ? notice : '')
    setAuthStatus('locked')
  }

  const handleUnlockSubmit = async (e) => {
    e.preventDefault()
    if (!password) {
      setAuthError('Vui lòng nhập mật khẩu để mở trang Host.')
      return
    }

    setSubmitting(true)
    setAuthError('')

    try {
      const res = await fetch('/api/host-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.ok && data?.token) {
        try {
          window.sessionStorage.setItem(HOST_AUTH_TOKEN_KEY, data.token)
        } catch {
          // ignore
        }
        setPassword('')
        setShowPassword(false)
        setAuthError('')
        setAuthStatus('unlocked')
      } else {
        setAuthError(data?.error || 'Mật khẩu chưa chính xác. Vui lòng thử lại.')
      }
    } catch {
      setAuthError('Không thể kết nối máy chủ xác thực. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authStatus !== 'unlocked') {
    if (!hostPanelOpen) return null

    return (
      <div
        className="host-studio host-studio--gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="host-gate-title"
        data-lenis-prevent
      >
        <div className="host-studio__dialog host-gate__dialog">
          <div className="host-studio__head">
            <div>
              <p className="host-studio__script">công cụ riêng của Xuân Mai</p>
              <h2 className="host-studio__title" id="host-gate-title">
                Mở Khóa Trang Quản Trị Thiệp
              </h2>
              <p className="host-studio__sub">
                Vui lòng nhập mật khẩu của chủ thiệp để truy cập trình tạo link cá nhân hóa.
              </p>
            </div>

            <button
              type="button"
              className="host-studio__close"
              onClick={handleCloseToDefault}
              aria-label="Đóng và xem bản thiệp mặc định"
              title="Xem thiệp mặc định"
            >
              <XIcon size={18} />
            </button>
          </div>

          {authStatus === 'checking' ? (
            <p className="host-gate__checking" role="status">
              Đang kiểm tra phiên đăng nhập...
            </p>
          ) : (
            <form className="host-gate__form" onSubmit={handleUnlockSubmit} noValidate>
              <div className="host-field">
                <label className="minimal-label" htmlFor="host-password-input">
                  Mật khẩu truy cập <span className="req">*</span>
                </label>

                <div className="host-gate__input-wrap">
                  <span className="host-gate__lead-icon" aria-hidden="true">
                    <LockIcon size={16} />
                  </span>
                  <input
                    id="host-password-input"
                    className="minimal-input host-input host-gate__input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu chủ thiệp..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (authError) setAuthError('')
                    }}
                    disabled={submitting}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="host-gate__eye"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-pressed={showPassword}
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="wishes-feedback wishes-feedback--error" role="status">
                  {authError}
                </p>
              )}

              <div className="host-gate__actions">
                <button
                  type="submit"
                  className="pill pill--rose host-btn host-gate__submit"
                  disabled={submitting}
                >
                  <LockIcon size={15} />
                  <span>{submitting ? 'Đang kiểm tra...' : 'Mở khóa trang Host'}</span>
                </button>

                <button
                  type="button"
                  className="host-preview-trigger"
                  onClick={handleCloseToDefault}
                  disabled={submitting}
                >
                  <EyeIcon size={15} />
                  <span>Xem thiệp mặc định</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  return <HostStudioWorkspace onLockSession={handleLockSession} />
}

function HostStudioWorkspace({ onLockSession }) {
  const { isHostMode, hostPanelOpen, copy, startGuestPreview, reopenHostPanel, resetPreview } =
    useInvitation()

  const [name, setName] = useState('')
  const [preset, setPreset] = useState('ban')
  const [manualPreset, setManualPreset] = useState(false)
  const [autoDetectedPreset, setAutoDetectedPreset] = useState(null)
  const [note, setNote] = useState('')
  const [overrides, setOverrides] = useState({})
  const [editingField, setEditingField] = useState(null) // { key, value } | null
  const [customSms, setCustomSms] = useState(null) // null = dùng SMS gợi ý theo vai vế
  const [copiedType, setCopiedType] = useState('') // 'link' | 'sms' | id | ''
  const [activeTab, setActiveTab] = useState('links') // 'links' | 'notes'
  const [notesList, setNotesList] = useState(() => buildInitialGuestbook(INITIAL_GUESTBOOK))
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesSyncMeta, setNotesSyncMeta] = useState({ shared: true, backend: 'unknown' })
  const [notesError, setNotesError] = useState('')
  const [notesNotice, setNotesNotice] = useState('')
  const [notesQuery, setNotesQuery] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [history, setHistory] = useState(() => {
    try {
      const saved = window.localStorage.getItem(HOST_HISTORY_KEY)
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!isHostMode || !hostPanelOpen) return undefined
    document.body.classList.add('is-locked')
    return () => {
      document.body.classList.remove('is-locked')
    }
  }, [isHostMode, hostPanelOpen])

  useEffect(() => {
    if (!copiedType) return undefined
    const timer = setTimeout(() => setCopiedType(''), 2000)
    return () => clearTimeout(timer)
  }, [copiedType])

  useEffect(() => {
    if (!notesNotice) return undefined
    const timer = setTimeout(() => setNotesNotice(''), 2800)
    return () => clearTimeout(timer)
  }, [notesNotice])

  const loadManagedNotes = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setNotesLoading(true)
    setNotesError('')
    try {
      const res = await fetch('/api/notes', { cache: 'no-store' })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok || !Array.isArray(data.notes)) {
        if (!silent) {
          setNotesError(data?.error || 'Không thể tải danh sách lời chúc lúc này.')
        }
        return
      }
      const merged = mergeServerNotes(data)
      setNotesList(merged)
      setNotesSyncMeta({ shared: data.shared !== false, backend: data.backend || 'unknown' })
      dispatchNotesSync({ notes: merged, shared: data.shared })
    } catch {
      if (!silent) {
        setNotesError('Không thể kết nối máy chủ để đồng bộ lời chúc.')
      }
    } finally {
      if (!silent) setNotesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadManagedNotes({ silent: true })

    const handleSync = (event) => {
      if (Array.isArray(event?.detail?.notes)) {
        setNotesList(event.detail.notes)
      }
    }
    window.addEventListener(NOTES_SYNC_EVENT, handleSync)
    return () => window.removeEventListener(NOTES_SYNC_EVENT, handleSync)
  }, [loadManagedNotes])

  const handleDeleteNote = async (entry) => {
    const targetId = String(entry?.id || '')
    if (!targetId || deletingId) return

    let savedToken = ''
    try {
      savedToken = window.sessionStorage.getItem(HOST_AUTH_TOKEN_KEY) || ''
    } catch {
      savedToken = ''
    }

    if (!savedToken) {
      onLockSession('Phiên đăng nhập Host đã hết hạn, vui lòng mở khóa lại.')
      return
    }

    setDeletingId(targetId)
    setNotesError('')
    setNotesNotice('')

    try {
      const res = await fetch(`/api/notes?id=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ id: targetId }),
      })
      const data = await res.json().catch(() => null)

      if (res.status === 401 || data?.code === 'INVALID_TOKEN') {
        onLockSession(data?.error || 'Phiên đăng nhập Host đã hết hạn, vui lòng mở khóa lại.')
        return
      }

      if (!res.ok && data?.code !== 'NOT_FOUND') {
        setNotesError(data?.error || 'Không thể xóa tờ note lúc này, vui lòng thử lại.')
        return
      }

      const isShared = data?.shared !== false
      removeNoteFromLocalCaches(targetId, { trackLocalDelete: !isShared })

      let nextNotes
      if (Array.isArray(data?.notes)) {
        nextNotes =
          isShared ? data.notes : mergeServerNotes({ notes: data.notes, shared: false })
      } else {
        nextNotes = notesList.filter((item) => String(item?.id || '') !== targetId)
      }

      setNotesList(nextNotes)
      setNotesSyncMeta((prev) => ({
        shared: data?.shared ?? prev.shared,
        backend: data?.backend || prev.backend,
      }))
      setConfirmDeleteId(null)
      setNotesNotice(
        isShared
          ? `Đã xóa note của "${entry.name}" và đồng bộ tường lời chúc.`
          : `Đã ẩn note của "${entry.name}" trên trình duyệt này (máy chủ đang ở chế độ tĩnh).`
      )
      dispatchNotesSync({ notes: nextNotes, deletedId: targetId, shared: isShared })
    } catch {
      setNotesError('Không thể kết nối máy chủ khi xóa tờ note. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredNotes = useMemo(() => {
    const q = notesQuery.trim().toLowerCase()
    if (!q) return notesList
    return notesList.filter((item) => {
      const haystack = `${item.name || ''} ${item.role || ''} ${item.message || ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [notesList, notesQuery])

  const cleanOverrides = useMemo(() => sanitizeOverrides(overrides), [overrides])

  const draftCopy = useMemo(
    () => buildPersonalizedCopy({ preset, name, note, overrides: cleanOverrides }),
    [preset, name, note, cleanOverrides]
  )

  const token = useMemo(
    () => encodeInviteToken({ preset, name, note, overrides: cleanOverrides }),
    [preset, name, note, cleanOverrides]
  )

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://example.com/'
    return `${window.location.origin}${window.location.pathname}`
  }, [])

  const shareUrl = `${baseUrl}?i=${token}`
  const activeSms = customSms !== null ? customSms : draftCopy.inviteSms
  const hasAnyOverride = Object.keys(cleanOverrides).length > 0

  const saveHistoryItem = (itemPreset, itemName, itemNote, itemOverrides, itemUrl) => {
    const cleanOv = sanitizeOverrides(itemOverrides)
    const label = buildPersonalizedCopy({
      preset: itemPreset,
      name: itemName,
      note: itemNote,
      overrides: cleanOv,
    }).callName
    const entry = {
      id: `${itemPreset}:${label}:${itemNote}:${JSON.stringify(cleanOv)}`.toLowerCase(),
      preset: itemPreset,
      name: itemName.trim(),
      note: itemNote.trim(),
      overrides: cleanOv,
      callName: label,
      presetLabel: INVITE_PRESETS.find((p) => p.id === itemPreset)?.label || itemPreset,
      url: itemUrl,
    }
    setHistory((prev) => {
      const next = [entry, ...prev.filter((it) => it.id !== entry.id)].slice(0, 12)
      try {
        window.localStorage.setItem(HOST_HISTORY_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const removeHistoryItem = (id) => {
    setHistory((prev) => {
      const next = prev.filter((it) => it.id !== id)
      try {
        window.localStorage.setItem(HOST_HISTORY_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleNameChange = (e) => {
    const val = e.target.value
    setName(val)
    const detected = detectPresetFromName(val)
    const prevDetected = autoDetectedPreset
    setAutoDetectedPreset(detected)

    if (!val.trim()) {
      setManualPreset(false)
      setPreset('ban')
      return
    }

    if (detected && detected !== prevDetected) {
      // Người dùng vừa nhập danh xưng mới (vd: Chị..., Thầy..., Bố Mẹ...) -> tự chọn lại đúng vai vế
      setManualPreset(false)
      setPreset(detected)
      return
    }

    if (!manualPreset) {
      setPreset(detected || 'ban')
    }
  }

  const handleClearDraft = () => {
    setName('')
    setNote('')
    setPreset('ban')
    setManualPreset(false)
    setAutoDetectedPreset(null)
    setOverrides({})
    setEditingField(null)
    setCustomSms(null)
    setCopiedType('')
    requestAnimationFrame(() => {
      document.getElementById('host-guest-name')?.focus()
    })
  }

  const getFieldValue = (key, renderedValue) => {
    if (editingField?.key === key) return editingField.value
    return renderedValue
  }

  const handleInlineFocus = (key, renderedValue) => {
    setEditingField({ key, value: renderedValue })
  }

  const handleInlineChange = (key, nextVal, defaultVal) => {
    setEditingField({ key, value: nextVal })
    const normalized = nextVal.trim()
    setOverrides((prev) => {
      const next = { ...prev }
      if (!normalized || normalized === defaultVal.trim()) {
        delete next[key]
      } else {
        next[key] = nextVal
      }
      return next
    })
  }

  const handleInlineBlur = (key) => {
    setEditingField((prev) => (prev?.key === key ? null : prev))
  }

  const resetOverrideKeys = (keys) => {
    setOverrides((prev) => {
      const next = { ...prev }
      for (const k of keys) {
        delete next[k]
      }
      return next
    })
    setEditingField((prev) => (prev && keys.includes(prev.key) ? null : prev))
  }

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      saveHistoryItem(preset, name, note, cleanOverrides, shareUrl)
      setCopiedType('link')
    }
  }

  const handleCopySms = async () => {
    const smsText = activeSms.trim() || draftCopy.inviteSms
    const fullText = `${smsText}\n${shareUrl}`
    const ok = await copyToClipboard(fullText)
    if (ok) {
      saveHistoryItem(preset, name, note, cleanOverrides, shareUrl)
      setCopiedType('sms')
    }
  }

  const handlePreview = () => {
    saveHistoryItem(preset, name, note, cleanOverrides, shareUrl)
    startGuestPreview({ preset, name, note, overrides: cleanOverrides })
  }

  const handleViewDefault = () => {
    resetPreview()
    startGuestPreview({ preset: 'chung', name: '', note: '', overrides: {} })
  }

  if (!hostPanelOpen) {
    return (
      <div className="host-preview-bar" role="region" aria-label="Thanh xem thử của chủ thiệp">
        <span className="host-preview-bar__tag">
          Xem thử: <strong>{copy.callName}</strong> ({copy.preset.label})
        </span>
        <button
          type="button"
          className="host-preview-bar__btn"
          onClick={reopenHostPanel}
        >
          <ArrowLeftIcon size={14} />
          <span>Quay lại tạo link</span>
        </button>
      </div>
    )
  }

  const coverEdited = Boolean(cleanOverrides.coverText)
  const heroEdited = Boolean(cleanOverrides.heroTitle || cleanOverrides.heroDesc)
  const aboutEdited = Boolean(cleanOverrides.aboutTitle || cleanOverrides.aboutPara)

  return (
    <div
      className="host-studio"
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-studio-title"
      data-lenis-prevent
    >
      <div className="host-studio__dialog">
        <div className="host-studio__head">
          <div>
            <p className="host-studio__script">công cụ riêng của Xuân Mai</p>
            <h2 className="host-studio__title" id="host-studio-title">
              Tạo Link Thiệp Cá Nhân Hóa
            </h2>
            <p className="host-studio__sub">
              Mỗi link dùng mã gọn <code>?i=...</code> để không lộ tên hay phân loại vai vế trên
              đường dẫn; khi khách mở thiệp, địa chỉ trình duyệt sẽ tự làm sạch về trang gốc.
            </p>
          </div>

          <div className="host-studio__head-actions">
            <button
              type="button"
              className="host-studio__lock"
              onClick={() => onLockSession('')}
              aria-label="Khóa trang Host"
              title="Khóa trang Host"
            >
              <LockIcon size={16} />
            </button>

            <button
              type="button"
              className="host-studio__close"
              onClick={handleViewDefault}
              aria-label="Đóng công cụ và xem bản thiệp mặc định"
              title="Xem thiệp mặc định"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        <div className="host-studio__tabs" role="tablist" aria-label="Chức năng trang Host">
          <button
            type="button"
            role="tab"
            id="host-tab-links"
            aria-selected={activeTab === 'links'}
            className={`host-studio__tab${activeTab === 'links' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            <span>Tạo Link Cá Nhân Hóa</span>
          </button>

          <button
            type="button"
            role="tab"
            id="host-tab-notes"
            aria-selected={activeTab === 'notes'}
            className={`host-studio__tab${activeTab === 'notes' ? ' is-active' : ''}`}
            onClick={() => {
              setActiveTab('notes')
              loadManagedNotes({ silent: false })
            }}
          >
            <span>Quản Lý Tờ Note</span>
            <span className="host-studio__tab-count">{notesList.length}</span>
          </button>
        </div>

        {activeTab === 'links' ? (
          <div
            className="host-studio__grid"
            role="tabpanel"
            aria-labelledby="host-tab-links"
          >
          {/* Cột trái: Nhập thông tin khách & chọn xưng hô */}
          <div className="host-studio__col host-studio__col--form">
            <div className="host-field">
              <div className="host-field__top">
                <label className="minimal-label" htmlFor="host-guest-name">
                  Tên hoặc danh xưng người nhận
                </label>
                <div className="host-field__badges">
                  {autoDetectedPreset && (
                    <span className="host-detect-pill">
                      Nhận diện: {INVITE_PRESETS.find((p) => p.id === autoDetectedPreset)?.label}
                    </span>
                  )}
                  {(name || note || manualPreset || hasAnyOverride || customSms !== null) && (
                    <button
                      type="button"
                      className="host-reset-auto"
                      onClick={handleClearDraft}
                    >
                      Khách mới
                    </button>
                  )}
                </div>
              </div>
              <input
                id="host-guest-name"
                className="minimal-input host-input"
                type="text"
                maxLength={60}
                placeholder="Ví dụ: Chị Thảo, Minh Anh, Thầy Hùng, Bố Mẹ..."
                value={name}
                onChange={handleNameChange}
                autoFocus
              />
              <p className="host-field__hint">
                Nếu chỉ ghi tên riêng (vd: <em>Thảo</em>) và chọn nhóm <em>Chị</em>, thiệp tự ghép thành{' '}
                <strong>Chị Thảo</strong>.
              </p>
            </div>

            <div className="host-field">
              <div className="host-field__top">
                <span className="minimal-label" id="host-preset-label">
                  Chọn cách xưng hô đồng bộ toàn trang
                </span>
                {manualPreset && (
                  <button
                    type="button"
                    className="host-reset-auto"
                    onClick={() => {
                      setManualPreset(false)
                      setPreset(autoDetectedPreset || 'ban')
                    }}
                  >
                    Tự gợi ý lại
                  </button>
                )}
              </div>

              <div
                className="host-preset-grid"
                role="radiogroup"
                aria-labelledby="host-preset-label"
              >
                {SELECTABLE_PRESETS.map((item) => {
                  const active = preset === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`host-preset-btn${active ? ' is-active' : ''}`}
                      onClick={() => {
                        setPreset(item.id)
                        setManualPreset(true)
                      }}
                    >
                      <span className="host-preset-btn__label">{item.label}</span>
                      <span className="host-preset-btn__desc">{item.shortDesc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="host-field">
              <label className="minimal-label" htmlFor="host-custom-note">
                Lời nhắn riêng thêm (không bắt buộc)
              </label>
              <input
                id="host-custom-note"
                className="minimal-input host-input"
                type="text"
                maxLength={120}
                placeholder="VD: Chiều 27/11 ghé UIT chụp ảnh nha!"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Cột phải: Xem trước & chỉnh sửa câu chữ trực tiếp + xuất link */}
          <div className="host-studio__col host-studio__col--preview">
            <div className="host-preview-card">
              <div className="host-preview-card__head">
                <p className="host-preview-card__eyebrow">Xem trước câu chữ thực tế</p>
                {hasAnyOverride ? (
                  <button
                    type="button"
                    className="host-preview-reset"
                    onClick={() => {
                      setOverrides({})
                      setEditingField(null)
                    }}
                  >
                    Khôi phục mặc định
                  </button>
                ) : (
                  <span className="host-preview-card__tip">
                    <EditPenIcon size={12} />
                    <span>Bấm để sửa trực tiếp</span>
                  </span>
                )}
              </div>

              <div className="host-preview-line">
                <div className="host-preview-line__head">
                  <span className="host-preview-line__tag">Trên bìa thiệp</span>
                  {coverEdited && (
                    <button
                      type="button"
                      className="host-preview-line__reset"
                      onClick={() => resetOverrideKeys(['coverText'])}
                    >
                      Đặt lại
                    </button>
                  )}
                </div>
                <AutoTextarea
                  id="host-edit-cover"
                  aria-label="Chỉnh sửa lời mời trên bìa thiệp"
                  className={`host-inline-editor host-inline-editor--body${coverEdited ? ' is-edited' : ''}`}
                  maxLength={180}
                  value={getFieldValue('coverText', draftCopy.cover.text)}
                  placeholder={draftCopy.defaults.coverText}
                  onFocus={() => handleInlineFocus('coverText', draftCopy.cover.text)}
                  onChange={(e) =>
                    handleInlineChange('coverText', e.target.value, draftCopy.defaults.coverText)
                  }
                  onBlur={() => handleInlineBlur('coverText')}
                />
                {Boolean(note) && (
                  <AutoTextarea
                    id="host-edit-cover-note"
                    aria-label="Chỉnh sửa lời nhắn riêng trên bìa thiệp"
                    className="host-inline-editor host-inline-editor--note"
                    maxLength={120}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                )}
              </div>

              <div className="host-preview-line">
                <div className="host-preview-line__head">
                  <span className="host-preview-line__tag">Màn hình đầu (Hero)</span>
                  {heroEdited && (
                    <button
                      type="button"
                      className="host-preview-line__reset"
                      onClick={() => resetOverrideKeys(['heroTitle', 'heroDesc'])}
                    >
                      Đặt lại
                    </button>
                  )}
                </div>
                <input
                  id="host-edit-hero-title"
                  type="text"
                  aria-label="Chỉnh sửa tiêu đề màn hình đầu"
                  className={`host-inline-editor host-inline-editor--hero${cleanOverrides.heroTitle ? ' is-edited' : ''}`}
                  maxLength={80}
                  value={getFieldValue('heroTitle', draftCopy.hero.titleText)}
                  placeholder={draftCopy.defaults.heroTitle}
                  onFocus={() => handleInlineFocus('heroTitle', draftCopy.hero.titleText)}
                  onChange={(e) =>
                    handleInlineChange('heroTitle', e.target.value, draftCopy.defaults.heroTitle)
                  }
                  onBlur={() => handleInlineBlur('heroTitle')}
                />
                <AutoTextarea
                  id="host-edit-hero-desc"
                  aria-label="Chỉnh sửa đoạn mô tả màn hình đầu"
                  className={`host-inline-editor host-inline-editor--body${cleanOverrides.heroDesc ? ' is-edited' : ''}`}
                  maxLength={320}
                  value={getFieldValue('heroDesc', draftCopy.hero.description)}
                  placeholder={draftCopy.defaults.heroDesc}
                  onFocus={() => handleInlineFocus('heroDesc', draftCopy.hero.description)}
                  onChange={(e) =>
                    handleInlineChange('heroDesc', e.target.value, draftCopy.defaults.heroDesc)
                  }
                  onBlur={() => handleInlineBlur('heroDesc')}
                />
              </div>

              <div className="host-preview-line">
                <div className="host-preview-line__head">
                  <span className="host-preview-line__tag">Đoạn tâm sự</span>
                  {aboutEdited && (
                    <button
                      type="button"
                      className="host-preview-line__reset"
                      onClick={() => resetOverrideKeys(['aboutTitle', 'aboutPara'])}
                    >
                      Đặt lại
                    </button>
                  )}
                </div>
                <input
                  id="host-edit-about-title"
                  type="text"
                  aria-label="Chỉnh sửa tiêu đề đoạn tâm sự"
                  className={`host-inline-editor host-inline-editor--heading${cleanOverrides.aboutTitle ? ' is-edited' : ''}`}
                  maxLength={80}
                  value={getFieldValue('aboutTitle', draftCopy.about.title)}
                  placeholder={draftCopy.defaults.aboutTitle}
                  onFocus={() => handleInlineFocus('aboutTitle', draftCopy.about.title)}
                  onChange={(e) =>
                    handleInlineChange('aboutTitle', e.target.value, draftCopy.defaults.aboutTitle)
                  }
                  onBlur={() => handleInlineBlur('aboutTitle')}
                />
                <AutoTextarea
                  id="host-edit-about-para"
                  aria-label="Chỉnh sửa nội dung đoạn tâm sự"
                  className={`host-inline-editor host-inline-editor--body${cleanOverrides.aboutPara ? ' is-edited' : ''}`}
                  maxLength={420}
                  value={getFieldValue('aboutPara', draftCopy.about.paragraphs[1])}
                  placeholder={draftCopy.defaults.aboutPara}
                  onFocus={() => handleInlineFocus('aboutPara', draftCopy.about.paragraphs[1])}
                  onChange={(e) =>
                    handleInlineChange('aboutPara', e.target.value, draftCopy.defaults.aboutPara)
                  }
                  onBlur={() => handleInlineBlur('aboutPara')}
                />
              </div>
            </div>

            <div className="host-output-box">
              <label className="minimal-label" htmlFor="host-generated-link">
                Link mời đã mã hóa (sẵn sàng gửi qua Zalo / Messenger)
              </label>
              <div className="host-link-row">
                <LinkIcon size={15} />
                <input
                  id="host-generated-link"
                  className="host-link-input"
                  type="text"
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                />
              </div>

              <div className="host-actions">
                <button type="button" className="pill pill--rose host-btn" onClick={handleCopyLink}>
                  {copiedType === 'link' ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  <span>{copiedType === 'link' ? 'Đã copy link!' : 'Copy Link Thiệp'}</span>
                </button>

                <button type="button" className="pill pill--light host-btn" onClick={handleCopySms}>
                  {copiedType === 'sms' ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  <span>{copiedType === 'sms' ? 'Đã copy lời mời!' : 'Copy Lời Mời + Link'}</span>
                </button>

                <button type="button" className="host-preview-trigger" onClick={handlePreview}>
                  <EyeIcon size={15} />
                  <span>Xem thử toàn bộ thiệp</span>
                </button>
              </div>

              <div className="host-sms-preview">
                <div className="host-preview-line__head">
                  <label className="host-sms-preview__label" htmlFor="host-edit-sms">
                    Tin nhắn gợi ý kèm theo:
                  </label>
                  {customSms !== null && (
                    <button
                      type="button"
                      className="host-preview-line__reset"
                      onClick={() => setCustomSms(null)}
                    >
                      Đặt lại
                    </button>
                  )}
                </div>
                <AutoTextarea
                  id="host-edit-sms"
                  aria-label="Chỉnh sửa tin nhắn gợi ý kèm theo"
                  className="host-inline-editor host-inline-editor--sms"
                  maxLength={380}
                  value={activeSms}
                  placeholder={draftCopy.inviteSms}
                  onChange={(e) => {
                    const nextVal = e.target.value
                    setCustomSms(nextVal === draftCopy.inviteSms ? null : nextVal)
                  }}
                  onBlur={() => {
                    if (customSms !== null && !customSms.trim()) {
                      setCustomSms(null)
                    }
                  }}
                />
              </div>
            </div>

            {history.length > 0 && (
              <div className="host-history">
                <div className="host-history__head">
                  <span>Link đã tạo gần đây ({history.length})</span>
                </div>
                <ul className="host-history__list">
                  {history.map((item) => (
                    <li key={item.id} className="host-history__item">
                      <div className="host-history__meta">
                        <strong>{item.callName}</strong>
                        <span>{item.presetLabel}</span>
                      </div>
                      <div className="host-history__btns">
                        <button
                          type="button"
                          className="host-history__btn"
                          onClick={async () => {
                            const ok = await copyToClipboard(item.url)
                            if (ok) setCopiedType(item.id)
                          }}
                          title="Copy link"
                        >
                          {copiedType === item.id ? (
                            <CheckIcon size={14} />
                          ) : (
                            <CopyIcon size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="host-history__btn"
                          onClick={() =>
                            startGuestPreview({
                              preset: item.preset,
                              name: item.name,
                              note: item.note,
                              overrides: item.overrides,
                            })
                          }
                          title="Xem thử thiệp này"
                        >
                          <EyeIcon size={14} />
                        </button>
                        <button
                          type="button"
                          className="host-history__btn host-history__btn--del"
                          onClick={() => removeHistoryItem(item.id)}
                          title="Xóa khỏi danh sách"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        ) : (
          <div
            className="host-notes"
            role="tabpanel"
            aria-labelledby="host-tab-notes"
          >
            <div className="host-notes__toolbar">
              <div className="host-notes__status-group">
                <span
                  className={`host-notes__sync-pill${notesSyncMeta.shared ? ' is-synced' : ' is-local'}`}
                >
                  {notesSyncMeta.shared
                    ? 'Đồng bộ trực tiếp với máy chủ'
                    : 'Chế độ tĩnh (tạm lưu trình duyệt)'}
                </span>
                <span className="host-notes__total">
                  Tổng: <strong>{notesList.length}</strong> tờ note
                </span>
              </div>

              <div className="host-notes__controls">
                <input
                  type="search"
                  className="minimal-input host-notes__search"
                  placeholder="Tìm theo tên hoặc lời chúc..."
                  aria-label="Tìm kiếm tờ note"
                  value={notesQuery}
                  onChange={(e) => setNotesQuery(e.target.value)}
                />

                <button
                  type="button"
                  className="pill pill--light host-notes__refresh"
                  onClick={() => loadManagedNotes({ silent: false })}
                  disabled={notesLoading}
                >
                  <RefreshIcon size={14} />
                  <span>{notesLoading ? 'Đang đồng bộ...' : 'Đồng bộ lại'}</span>
                </button>
              </div>
            </div>

            {notesError && (
              <p className="wishes-feedback wishes-feedback--error" role="status">
                {notesError}
              </p>
            )}

            {notesNotice && (
              <div className="wishes-feedback wishes-feedback--success" role="status">
                <CheckIcon size={16} />
                <span>{notesNotice}</span>
              </div>
            )}

            {filteredNotes.length === 0 ? (
              <div className="host-notes__empty" role="status">
                {notesList.length === 0
                  ? 'Hiện chưa có tờ note nào trên tường lời chúc.'
                  : 'Không tìm thấy tờ note nào khớp từ khóa bạn đang tìm.'}
              </div>
            ) : (
              <ul className="host-notes__list">
                {filteredNotes.map((entry, idx) => {
                  const colorInfo =
                    NEWSLETTER.noteColors.find((c) => c.id === entry.noteColor) ||
                    NEWSLETTER.noteColors[idx % NEWSLETTER.noteColors.length]
                  const isConfirming = confirmDeleteId === entry.id
                  const isDeleting = deletingId === entry.id

                  return (
                    <li
                      key={entry.id}
                      className={`host-note-card${isConfirming ? ' is-confirming' : ''}`}
                    >
                      <div className="host-note-card__head">
                        <div className="host-note-card__author">
                          <span
                            className="host-note-card__swatch"
                            style={{ backgroundColor: colorInfo.swatch }}
                            aria-hidden="true"
                          />
                          <div>
                            <strong className="host-note-card__name">{entry.name}</strong>
                            <span className="host-note-card__meta">
                              {entry.role || 'Khách mời'}
                              {entry.time ? ` · ${entry.time}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="host-note-card__actions">
                          {isConfirming ? (
                            <>
                              <button
                                type="button"
                                className="host-note-card__btn host-note-card__btn--confirm"
                                onClick={() => handleDeleteNote(entry)}
                                disabled={isDeleting}
                              >
                                <TrashIcon size={13} />
                                <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                              </button>
                              <button
                                type="button"
                                className="host-note-card__btn host-note-card__btn--cancel"
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeleting}
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="host-note-card__btn host-note-card__btn--del"
                              onClick={() => setConfirmDeleteId(entry.id)}
                              disabled={Boolean(deletingId)}
                              aria-label={`Xóa tờ note của ${entry.name}`}
                            >
                              <TrashIcon size={14} />
                              <span>Xóa note</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="host-note-card__msg">{entry.message}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
