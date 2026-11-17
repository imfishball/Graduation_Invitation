import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { INITIAL_GUESTBOOK, NEWSLETTER } from '../data'
import { useInvitation } from '../invitationContext'
import {
  buildInitialGuestbook,
  dispatchNotesSync,
  LIKES_STORAGE_KEY,
  mergeServerNotes,
  NOTES_SYNC_EVENT,
  readLocalFallbackNotes,
  readOwnedNoteTokens,
  saveLocalFallbackNotes,
  saveOwnedNoteToken,
  updateNoteInLocalFallback,
} from '../notesSync'
import {
  CheckIcon,
  ChevronDownIcon,
  EditPenIcon,
  FeatherPenIcon,
  HeartIcon,
  NoteDoodleIcon,
  OutlineStarIcon,
  PaperclipIcon,
  WavyLineSvg,
  XIcon,
} from './Icons'
import SectionHead from './SectionHead'

// 6 biến thể bất đối xứng hài hòa (trái dẫn nhịp - phải giật cấp nhẹ, góc xoay ±1.3°–2.1° kiểu Polaroid)
const NOTE_LAYOUTS = [
  { tilt: '-1.9deg', x: '-2px', y: '0px' },
  { tilt: '1.5deg', x: '2px', y: '14px' },
  { tilt: '1.3deg', x: '2px', y: '4px' },
  { tilt: '-2.1deg', x: '-2px', y: '12px' },
  { tilt: '-1.5deg', x: '-1px', y: '2px' },
  { tilt: '1.8deg', x: '2px', y: '16px' },
]
const FASTENERS = ['tape-stripe', 'tape-dots', 'pushpin', 'tape-grid']
const DOODLES = ['star', 'heart', 'flower', 'sparkle']

export default function Newsletter() {
  const { copy } = useInvitation()
  const showIdentityFields = !copy.isPersonalized

  const [name, setName] = useState('')
  const [role, setRole] = useState(NEWSLETTER.roles[0])
  const [customRole, setCustomRole] = useState('')
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const roleDropdownRef = useRef(null)
  const [attendance, setAttendance] = useState('attending') // attending | remote
  const [noteColor, setNoteColor] = useState(NEWSLETTER.noteColors[0].id)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [guestbook, setGuestbook] = useState(() => buildInitialGuestbook(INITIAL_GUESTBOOK))
  const [newestId, setNewestId] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [ownedTokens, setOwnedTokens] = useState(() => readOwnedNoteTokens())
  const [editingNote, setEditingNote] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccessMsg, setEditSuccessMsg] = useState('')
  const [likedIds, setLikedIds] = useState(() => {
    try {
      const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY)
      return savedLikes ? JSON.parse(savedLikes) : {}
    } catch {
      return {}
    }
  })

  // Tải bảng giấy note dùng chung từ file JSON / KV / Gist qua /api/notes
  useEffect(() => {
    let active = true

    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!active || !data?.ok || !Array.isArray(data.notes)) return

        setGuestbook(mergeServerNotes(data))
      } catch {
        // Giữ dữ liệu mặc định + local fallback nếu tạm mất kết nối
      }
    }

    fetchNotes()

    const handleNotesSync = (event) => {
      const nextNotes = event?.detail?.notes
      if (Array.isArray(nextNotes)) {
        setGuestbook(nextNotes)
        const deletedId = event?.detail?.deletedId
        if (deletedId) {
          setOwnedTokens(readOwnedNoteTokens())
          setSelectedNote((prev) =>
            prev && String(prev.id) === String(deletedId) ? null : prev
          )
          setEditingNote((prev) =>
            prev && String(prev.id) === String(deletedId) ? null : prev
          )
        }
      } else {
        fetchNotes()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotes()
      }
    }
    window.addEventListener(NOTES_SYNC_EVENT, handleNotesSync)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      active = false
      window.removeEventListener(NOTES_SYNC_EVENT, handleNotesSync)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Xóa thông báo lỗi cũ khi chuyển đổi chế độ xem thử thiệp mặc định / cá nhân hóa
  useEffect(() => {
    setStatus((prev) => (prev === 'error' ? 'idle' : prev))
    setErrorMsg('')
    setRoleDropdownOpen(false)
  }, [showIdentityFields])

  // Đóng dropdown chọn vai vế khi bấm ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!roleDropdownOpen) return undefined
    const handlePointerDown = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRoleDropdownOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [roleDropdownOpen])

  const handleSelectRole = (nextRole) => {
    setRole(nextRole)
    setRoleDropdownOpen(false)
    if (nextRole !== 'Khác') {
      setCustomRole('')
    } else {
      requestAnimationFrame(() => {
        document.getElementById('guest-custom-role')?.focus()
      })
    }
  }

  const closeSelectedNote = () => {
    setSelectedNote(null)
    setEditingNote(null)
    setEditError('')
    setEditSuccessMsg('')
    setEditSaving(false)
  }

  // Khóa cuộn trang & hỗ trợ phím Escape khi mở xem chi tiết tờ note
  useEffect(() => {
    if (!selectedNote) return
    document.body.classList.add('is-locked')
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeSelectedNote()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('is-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNote])

  const triggerConfetti = () => {
    const colors = ['#d68b96', '#f5ede1', '#e8b4b8', '#d3ebd7', '#ffd166', '#d4e5f7']

    confetti({
      particleCount: 65,
      spread: 58,
      origin: { y: 0.65 },
      colors,
    })

    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
    }, 220)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanName = name.trim()
    const cleanMsg = message.trim()

    if (showIdentityFields && !cleanName) {
      setStatus('error')
      setErrorMsg(
        copy.newsletter.errorName || 'Đừng quên ghi tên để Mai biết lời chúc từ bạn nhé!'
      )
      return
    }

    if (!cleanMsg) {
      setStatus('error')
      setErrorMsg(copy.newsletter.errorMessage)
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    let authorName
    let displayRole

    if (showIdentityFields) {
      authorName = cleanName
      const resolvedRole = role === 'Khác' ? customRole.trim() || 'Khác' : role
      displayRole = attendance === 'remote' ? `${resolvedRole} · Gửi từ xa` : resolvedRole
    } else {
      authorName = copy.rawName ? copy.callName : copy.newsletter.defaultAuthor || 'Khách mời'
      displayRole = copy.newsletter.noteTag
        ? `${copy.newsletter.noteTag} · ${attendance === 'remote' ? 'Gửi từ xa' : 'Tham dự'}`
        : attendance === 'remote'
          ? 'Gửi lời chúc từ xa'
          : 'Tham dự buổi lễ'
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authorName,
          role: displayRole,
          attendance,
          noteColor,
          message: cleanMsg,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok || !data.note) {
        setStatus('error')
        setErrorMsg(data?.error || 'Không thể dán note lúc này, bạn thử lại giúp Mai nhé.')
        return
      }

      if (data.editToken) {
        setOwnedTokens(saveOwnedNoteToken(data.note.id, data.editToken))
      }

      if (data.shared === false) {
        const nextLocalOnly = [data.note, ...readLocalFallbackNotes()]
        saveLocalFallbackNotes(nextLocalOnly)
      }

      const nextList =
        data.shared === false
          ? mergeServerNotes(data)
          : Array.isArray(data.notes)
            ? data.notes
            : [data.note, ...guestbook]
      setGuestbook(nextList)
      dispatchNotesSync({ notes: nextList, shared: data.shared })
      setNewestId(data.note.id)

      triggerConfetti()
      setStatus('success')
      setMessage('')
      if (showIdentityFields) {
        setName('')
        setRole(NEWSLETTER.roles[0])
        setCustomRole('')
      }
    } catch {
      const id = 'msg-' + Date.now()
      const localToken = `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      const fallbackEntry = {
        id,
        name: authorName,
        role: displayRole,
        attendance,
        noteColor,
        fastener: FASTENERS[(guestbook.length + 2) % FASTENERS.length],
        doodle: DOODLES[(guestbook.length + 2) % DOODLES.length],
        message: cleanMsg,
        time: 'Vừa dán',
      }
      setOwnedTokens(saveOwnedNoteToken(id, localToken))
      const nextLocalOnly = [fallbackEntry, ...readLocalFallbackNotes()]
      saveLocalFallbackNotes(nextLocalOnly)
      const nextList = [fallbackEntry, ...guestbook]
      setGuestbook(nextList)
      dispatchNotesSync({ notes: nextList, shared: false })
      setNewestId(id)

      triggerConfetti()
      setStatus('success')
      setMessage('')
      if (showIdentityFields) {
        setName('')
        setRole(NEWSLETTER.roles[0])
        setCustomRole('')
      }
    }
  }

  const openEditMode = (noteItem) => {
    if (!noteItem || !ownedTokens[noteItem.id]) return
    setSelectedNote(noteItem)
    setEditError('')
    setEditSuccessMsg('')
    setEditingNote({
      id: noteItem.id,
      name: noteItem.name || '',
      role: noteItem.role || '',
      attendance: noteItem.attendance === 'remote' ? 'remote' : 'attending',
      noteColor: noteItem.colorId || noteItem.noteColor || NEWSLETTER.noteColors[0].id,
      message: noteItem.message || '',
    })
  }

  const computeUpdatedRoleLabel = (existingRole, nextAttendance) => {
    const raw = String(existingRole || '').trim()
    if (!raw || raw === 'Tham dự buổi lễ' || raw === 'Gửi lời chúc từ xa') {
      return nextAttendance === 'remote' ? 'Gửi lời chúc từ xa' : 'Tham dự buổi lễ'
    }
    const baseRole = raw.replace(/\s*·\s*(Gửi từ xa|Tham dự)\s*$/i, '').trim()
    if (!baseRole) {
      return nextAttendance === 'remote' ? 'Gửi lời chúc từ xa' : 'Tham dự buổi lễ'
    }
    return nextAttendance === 'remote' ? `${baseRole} · Gửi từ xa` : baseRole
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingNote) return

    const editToken = ownedTokens[editingNote.id]
    if (!editToken) {
      setEditError('Bạn chỉ có thể chỉnh sửa tờ note của chính mình.')
      return
    }

    const cleanName = editingNote.name.trim()
    const cleanMsg = editingNote.message.trim()

    if (showIdentityFields && !cleanName) {
      setEditError('Đừng quên ghi tên để Mai biết lời chúc từ bạn nhé!')
      return
    }
    if (!cleanMsg) {
      setEditError('Nội dung lời chúc không được để trống.')
      return
    }

    setEditSaving(true)
    setEditError('')

    const updatedRole = computeUpdatedRoleLabel(editingNote.role, editingNote.attendance)
    const payload = {
      id: editingNote.id,
      editToken,
      name: cleanName || selectedNote?.name || '',
      role: updatedRole,
      attendance: editingNote.attendance,
      noteColor: editingNote.noteColor,
      message: cleanMsg,
    }

    const applyLocalUpdate = (updatedFields) => {
      const updatedObj = {
        ...(selectedNote || {}),
        ...updatedFields,
        colorId: updatedFields.noteColor || selectedNote?.colorId || 'rose',
        editedAt: updatedFields.editedAt || new Date().toISOString(),
      }
      updateNoteInLocalFallback(updatedObj)
      setGuestbook((prev) => {
        const nextList = prev.map((item) =>
          String(item.id) === String(editingNote.id) ? { ...item, ...updatedFields, editedAt: updatedObj.editedAt } : item
        )
        dispatchNotesSync({ notes: nextList, shared: false })
        return nextList
      })
      setSelectedNote(updatedObj)
      setEditingNote(null)
      setEditSuccessMsg('Đã cập nhật tờ note của bạn!')
    }

    if (editToken.startsWith('local-')) {
      applyLocalUpdate({
        name: payload.name,
        role: payload.role,
        attendance: payload.attendance,
        noteColor: payload.noteColor,
        message: payload.message,
      })
      setEditSaving(false)
      return
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.ok || !data.note) {
        setEditError(data?.error || 'Không thể lưu chỉnh sửa lúc này. Vui lòng thử lại.')
        return
      }

      if (data.shared === false) {
        updateNoteInLocalFallback(data.note)
      }

      const nextList =
        data.shared === false
          ? mergeServerNotes(data)
          : Array.isArray(data.notes)
            ? data.notes
            : guestbook.map((item) =>
                String(item.id) === String(data.note.id) ? data.note : item
              )

      setGuestbook(nextList)
      dispatchNotesSync({ notes: nextList, shared: data.shared })
      setSelectedNote((prev) =>
        prev
          ? {
              ...prev,
              ...data.note,
              colorId: data.note.noteColor || prev.colorId,
            }
          : null
      )
      setEditingNote(null)
      setEditSuccessMsg('Đã cập nhật tờ note của bạn!')
    } catch {
      setEditError('Không thể kết nối máy chủ để lưu thay đổi. Vui lòng thử lại.')
    } finally {
      setEditSaving(false)
    }
  }

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <section className="section wishes" id="contact" aria-labelledby="wishes-title">
      <div className="container wishes__container">
        <div className="wishes__header reveal-group">
          <SectionHead
            tagline={NEWSLETTER.script}
            title={NEWSLETTER.title}
            id="wishes-title"
          />
          <p className="wishes__subtitle reveal-item" style={{ '--stagger': 2 }}>
            {copy.isPersonalized ? (
              copy.newsletter.subtitle
            ) : (
              <>
                <span className="text-desktop">{copy.newsletter.subtitle}</span>
                <span className="text-mobile">
                  Viết đôi dòng gửi Mai và dán note lên bảng kỷ niệm 27/11 nhé.
                </span>
              </>
            )}
          </p>
        </div>

        {/* Bảng lưu bút Bullet Journal tối giản */}
        <div className="minimal-journal minimal-journal--pinboard reveal">
          <div className="minimal-stamp" aria-hidden="true">
            <span className="minimal-stamp__ring">
              <span className="minimal-stamp__top">UIT • K17</span>
              <span className="minimal-stamp__date">27 · 11 · 2026</span>
            </span>
          </div>

          <div className="minimal-journal__grid minimal-journal__grid--notes">
            {/* CỘT TRÁI: Form viết tờ giấy note */}
            <div className="minimal-journal__col minimal-journal__col--form">
              <form
                className={`minimal-form${showIdentityFields ? ' minimal-form--with-identity' : ''}`}
                onSubmit={handleSubmit}
                noValidate
              >
                {showIdentityFields && (
                  <>
                    <div className="minimal-field">
                      <label className="minimal-label" htmlFor="guest-name">
                        Họ và tên <span className="req">*</span>
                      </label>
                      <input
                        id="guest-name"
                        className="minimal-input"
                        type="text"
                        maxLength={60}
                        placeholder={copy.newsletter.placeholderName || NEWSLETTER.placeholderName}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          if (status === 'error') setStatus('idle')
                        }}
                        disabled={status === 'submitting'}
                      />
                    </div>

                    <div className="minimal-field">
                      <label className="minimal-label" id="guest-role-label" htmlFor="guest-role">
                        {copy.newsletter.roleLabel || 'Bạn đến với Mai là'}
                      </label>
                      <div
                        className={`minimal-select-wrap${roleDropdownOpen ? ' is-open' : ''}`}
                        ref={roleDropdownRef}
                      >
                        <button
                          id="guest-role"
                          type="button"
                          className="minimal-input minimal-select minimal-select--trigger"
                          role="combobox"
                          aria-haspopup="listbox"
                          aria-expanded={roleDropdownOpen}
                          aria-controls="guest-role-listbox"
                          aria-labelledby="guest-role-label"
                          disabled={status === 'submitting'}
                          onClick={() => setRoleDropdownOpen((prev) => !prev)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                              e.preventDefault()
                              if (!roleDropdownOpen) {
                                setRoleDropdownOpen(true)
                                return
                              }
                              const idx = NEWSLETTER.roles.indexOf(role)
                              const delta = e.key === 'ArrowDown' ? 1 : -1
                              const next =
                                NEWSLETTER.roles[
                                  (idx + delta + NEWSLETTER.roles.length) % NEWSLETTER.roles.length
                                ]
                              handleSelectRole(next)
                            }
                          }}
                        >
                          <span className="minimal-select__value">{role}</span>
                          <span className="minimal-select-icon" aria-hidden="true">
                            <ChevronDownIcon size={16} />
                          </span>
                        </button>

                        {roleDropdownOpen && (
                          <ul
                            id="guest-role-listbox"
                            className="minimal-select-menu"
                            role="listbox"
                            aria-labelledby="guest-role-label"
                          >
                            {NEWSLETTER.roles.map((r) => {
                              const isSelected = r === role
                              return (
                                <li key={r} role="presentation">
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`minimal-select-option${isSelected ? ' is-selected' : ''}`}
                                    onClick={() => handleSelectRole(r)}
                                  >
                                    <span>{r}</span>
                                    {isSelected && (
                                      <span
                                        className="minimal-select-option__check"
                                        aria-hidden="true"
                                      >
                                        <CheckIcon size={14} />
                                      </span>
                                    )}
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>

                      {role === 'Khác' && (
                        <input
                          id="guest-custom-role"
                          className="minimal-input minimal-input--custom-role"
                          type="text"
                          maxLength={50}
                          placeholder="Đồng nghiệp, Ăm chã húi, ..."
                          aria-label="Nhập mối quan hệ của bạn với Mai"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          disabled={status === 'submitting'}
                        />
                      )}
                    </div>
                  </>
                )}

                <div className="minimal-field">
                  <span className="minimal-label" id="attendance-label">
                    {copy.newsletter.attendanceLabel}
                  </span>
                  <div
                    className="minimal-choices"
                    role="radiogroup"
                    aria-labelledby="attendance-label"
                  >
                    <label
                      className={`minimal-choice ${attendance === 'attending' ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="attendance"
                        value="attending"
                        checked={attendance === 'attending'}
                        onChange={() => setAttendance('attending')}
                      />
                      <span>{copy.newsletter.attendingChoice}</span>
                    </label>

                    <label
                      className={`minimal-choice ${attendance === 'remote' ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="attendance"
                        value="remote"
                        checked={attendance === 'remote'}
                        onChange={() => setAttendance('remote')}
                      />
                      <span>{copy.newsletter.remoteChoice}</span>
                    </label>
                  </div>
                </div>

                <div className="minimal-field minimal-field--grow">
                  <div className="note-msg-head">
                    <label className="minimal-label" htmlFor="guest-message">
                      Lời chúc trên tờ note <span className="req">*</span>
                    </label>

                    <div
                      className="note-swatches"
                      role="radiogroup"
                      aria-label="Chọn màu giấy note"
                    >
                      {NEWSLETTER.noteColors.map((item) => {
                        const active = noteColor === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={`Giấy note màu ${item.label}`}
                            title={item.label}
                            className={`note-swatch ${active ? 'is-active' : ''}`}
                            style={{ '--swatch-bg': item.swatch }}
                            onClick={() => setNoteColor(item.id)}
                          />
                        )
                      })}
                    </div>
                  </div>

                  <textarea
                    id="guest-message"
                    className={`minimal-input minimal-textarea note-pad-input note-pad-input--${noteColor}`}
                    rows={showIdentityFields ? 4 : 6}
                    placeholder={copy.newsletter.placeholderMessage}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    disabled={status === 'submitting'}
                  />
                </div>

                {status === 'error' && (
                  <p className="wishes-feedback wishes-feedback--error" role="status">
                    {errorMsg}
                  </p>
                )}

                {status === 'success' && (
                  <div className="wishes-feedback wishes-feedback--success" role="status">
                    <CheckIcon size={17} />
                    <span>{copy.newsletter.successMessage}</span>
                  </div>
                )}

                <button
                  className="pill pill--rose minimal-submit"
                  type="submit"
                  disabled={status === 'submitting'}
                >
                  <FeatherPenIcon size={16} />
                  <span>{status === 'submitting' ? 'Đang dán note...' : NEWSLETTER.cta}</span>
                </button>
              </form>
            </div>

            {/* CỘT PHẢI: Bảng dot-grid Bullet Journal & Các tờ note */}
            <div className="minimal-journal__col minimal-journal__col--wall notes-board">
              <div className="minimal-wall__head bujo-wall__head">
                <div className="bujo-heading-group">
                  <span className="minimal-wall__eyebrow">TƯỜNG LỜI CHÚC</span>
                  <div className="bujo-title-wrap">
                    <h3 className="minimal-wall__title bujo-title">
                      <span className="bujo-title__star" aria-hidden="true">
                        <OutlineStarIcon size={16} />
                      </span>
                      <span>Những lời chúc yêu thương</span>
                    </h3>
                    <span className="bujo-title__wave" aria-hidden="true">
                      <WavyLineSvg />
                    </span>
                  </div>
                </div>
              </div>

              <div className="notes-board__frame">
                <div className="notes-board__scroll" data-lenis-prevent>
                  {guestbook.length === 0 ? (
                    <div className="notes-board__empty" role="status">
                      Chưa có tờ note nào trên bảng. Hãy là người đầu tiên gửi lời chúc cho Mai nhé!
                    </div>
                  ) : (
                    <div className="notes-grid">
                      {guestbook.map((entry, idx) => {
                      const isLiked = !!likedIds[entry.id]
                      const isFresh = entry.id === newestId
                      const isMine = Boolean(ownedTokens[entry.id])
                      const colorId =
                        entry.noteColor ||
                        NEWSLETTER.noteColors[idx % NEWSLETTER.noteColors.length].id
                      const fastener = entry.fastener || FASTENERS[idx % FASTENERS.length]
                      const doodle = entry.doodle || DOODLES[idx % DOODLES.length]
                      const layout = NOTE_LAYOUTS[idx % NOTE_LAYOUTS.length]
                      const hasPaperclip = fastener === 'tape-grid'
                      const noteSnapshot = { ...entry, colorId, fastener, doodle, idx }

                      return (
                        <article
                          className={`sticky-note sticky-note--${colorId} ${isFresh ? 'is-fresh' : ''} ${isMine ? 'is-mine' : ''}`}
                          key={entry.id}
                          style={{
                            '--note-tilt': layout.tilt,
                            '--note-x': layout.x,
                            '--note-y': layout.y,
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Xem trọn vẹn lời chúc của ${entry.name}`}
                          onClick={() => {
                            setEditError('')
                            setEditSuccessMsg('')
                            setEditingNote(null)
                            setSelectedNote(noteSnapshot)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setEditError('')
                              setEditSuccessMsg('')
                              setEditingNote(null)
                              setSelectedNote(noteSnapshot)
                            }
                          }}
                        >
                          {fastener === 'pushpin' ? (
                            <span className="sticky-note__pin" aria-hidden="true" />
                          ) : (
                            <span
                              className={`sticky-note__tape sticky-note__tape--${fastener}`}
                              aria-hidden="true"
                            />
                          )}

                          {hasPaperclip && (
                            <span className="sticky-note__clip" aria-hidden="true">
                              <PaperclipIcon size={24} />
                            </span>
                          )}

                          <span className="sticky-note__doodle" aria-hidden="true">
                            <NoteDoodleIcon variant={doodle} size={14} />
                          </span>

                          <p className="sticky-note__msg">{entry.message}</p>

                          <footer className="sticky-note__foot">
                            <div className="minimal-wish__author">
                              <div className="sticky-note__name-row">
                                <strong className="minimal-wish__name">{entry.name}</strong>
                                {isFresh ? (
                                  <span className="minimal-wish__new">Mới dán</span>
                                ) : isMine ? (
                                  <span className="minimal-wish__mine">Của bạn</span>
                                ) : null}
                              </div>
                              <span className="minimal-wish__role">{entry.role}</span>
                            </div>

                            <div className="sticky-note__actions">
                              {isMine && (
                                <button
                                  type="button"
                                  className="minimal-wish__edit"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditMode(noteSnapshot)
                                  }}
                                  aria-label={`Chỉnh sửa tờ note của bạn`}
                                  title="Sửa tờ note của bạn"
                                >
                                  <EditPenIcon size={12} />
                                  <span>Sửa</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className={`minimal-wish__like ${isLiked ? 'is-liked' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleLike(entry.id)
                                }}
                                aria-label={
                                  isLiked
                                    ? `Bỏ thả tim tờ note của ${entry.name}`
                                    : `Thả tim tờ note của ${entry.name}`
                                }
                                aria-pressed={isLiked}
                              >
                                <HeartIcon size={13} />
                                {!isLiked && !isMine && <span>Thả tim</span>}
                              </button>
                            </div>
                          </footer>
                        </article>
                      )
                    })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal phóng to xem trọn vẹn & chỉnh sửa tờ note của chính mình */}
      {selectedNote && (() => {
        const isSelectedMine = Boolean(ownedTokens[selectedNote.id])
        const isEditingThis = Boolean(
          editingNote && isSelectedMine && String(editingNote.id) === String(selectedNote.id)
        )
        const modalColor = isEditingThis ? editingNote.noteColor : selectedNote.colorId

        return (
          <div
            className="note-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-modal-author"
            onClick={closeSelectedNote}
          >
            <div className="note-modal__backdrop" />
            <div
              className={`note-modal__card sticky-note--${modalColor}${isEditingThis ? ' is-editing' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedNote.fastener === 'pushpin' ? (
                <span className="sticky-note__pin" aria-hidden="true" />
              ) : (
                <span
                  className={`sticky-note__tape sticky-note__tape--${selectedNote.fastener}`}
                  aria-hidden="true"
                />
              )}

              {selectedNote.fastener === 'tape-grid' && (
                <span className="sticky-note__clip" aria-hidden="true">
                  <PaperclipIcon size={24} />
                </span>
              )}

              <button
                type="button"
                className="note-modal__close"
                onClick={closeSelectedNote}
                aria-label="Đóng tờ note"
              >
                <XIcon size={18} />
              </button>

              {isEditingThis ? (
                <form className="note-modal__edit-form" onSubmit={handleSaveEdit} noValidate>
                  <div className="note-modal__edit-head">
                    <h4 className="note-modal__edit-title" id="note-modal-author">
                      <EditPenIcon size={15} />
                      <span>Chỉnh sửa tờ note của bạn</span>
                    </h4>
                    <div
                      className="note-swatches"
                      role="radiogroup"
                      aria-label="Đổi màu giấy note"
                    >
                      {NEWSLETTER.noteColors.map((item) => {
                        const active = editingNote.noteColor === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={`Giấy note màu ${item.label}`}
                            title={item.label}
                            className={`note-swatch ${active ? 'is-active' : ''}`}
                            style={{ '--swatch-bg': item.swatch }}
                            onClick={() =>
                              setEditingNote((prev) => ({ ...prev, noteColor: item.id }))
                            }
                          />
                        )
                      })}
                    </div>
                  </div>

                  {showIdentityFields && (
                    <div className="note-modal__edit-field">
                      <label className="minimal-label" htmlFor="edit-note-name">
                        Họ và tên <span className="req">*</span>
                      </label>
                      <input
                        id="edit-note-name"
                        type="text"
                        className="minimal-input note-modal__edit-input"
                        maxLength={60}
                        value={editingNote.name}
                        onChange={(e) => {
                          setEditingNote((prev) => ({ ...prev, name: e.target.value }))
                          if (editError) setEditError('')
                        }}
                        disabled={editSaving}
                      />
                    </div>
                  )}

                  <div className="note-modal__edit-field">
                    <span className="minimal-label">Trạng thái tham dự</span>
                    <div className="minimal-choices note-modal__edit-choices">
                      <label
                        className={`minimal-choice ${editingNote.attendance === 'attending' ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="edit-attendance"
                          value="attending"
                          checked={editingNote.attendance === 'attending'}
                          onChange={() =>
                            setEditingNote((prev) => ({ ...prev, attendance: 'attending' }))
                          }
                          disabled={editSaving}
                        />
                        <span>{copy.newsletter.attendingChoice}</span>
                      </label>
                      <label
                        className={`minimal-choice ${editingNote.attendance === 'remote' ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="edit-attendance"
                          value="remote"
                          checked={editingNote.attendance === 'remote'}
                          onChange={() =>
                            setEditingNote((prev) => ({ ...prev, attendance: 'remote' }))
                          }
                          disabled={editSaving}
                        />
                        <span>{copy.newsletter.remoteChoice}</span>
                      </label>
                    </div>
                  </div>

                  <div className="note-modal__edit-field">
                    <label className="minimal-label" htmlFor="edit-note-message">
                      Lời chúc trên tờ note <span className="req">*</span>
                    </label>
                    <textarea
                      id="edit-note-message"
                      className="minimal-input note-modal__edit-textarea"
                      rows={4}
                      maxLength={1200}
                      value={editingNote.message}
                      onChange={(e) => {
                        setEditingNote((prev) => ({ ...prev, message: e.target.value }))
                        if (editError) setEditError('')
                      }}
                      disabled={editSaving}
                      autoFocus
                    />
                  </div>

                  {editError && (
                    <p className="wishes-feedback wishes-feedback--error" role="status">
                      {editError}
                    </p>
                  )}

                  <div className="note-modal__edit-actions">
                    <button
                      type="button"
                      className="pill pill--light note-modal__edit-cancel"
                      onClick={() => {
                        setEditingNote(null)
                        setEditError('')
                      }}
                      disabled={editSaving}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="pill pill--rose note-modal__edit-save"
                      disabled={editSaving}
                    >
                      <CheckIcon size={15} />
                      <span>{editSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {editSuccessMsg && (
                    <div className="note-modal__notice" role="status">
                      <CheckIcon size={14} />
                      <span>{editSuccessMsg}</span>
                    </div>
                  )}

                  <div className="note-modal__body" data-lenis-prevent>
                    <p className="note-modal__msg">{selectedNote.message}</p>
                  </div>

                  <footer className="note-modal__foot">
                    <div className="minimal-wish__author">
                      <div className="sticky-note__name-row">
                        <strong className="note-modal__name" id="note-modal-author">
                          {selectedNote.name}
                        </strong>
                        {selectedNote.id === newestId ? (
                          <span className="minimal-wish__new">Mới dán</span>
                        ) : isSelectedMine ? (
                          <span className="minimal-wish__mine">Của bạn</span>
                        ) : null}
                      </div>
                      <span className="note-modal__meta">
                        {selectedNote.role}
                        {selectedNote.time ? ` · ${selectedNote.time}` : ''}
                        {selectedNote.editedAt ? ' · Đã chỉnh sửa' : ''}
                      </span>
                    </div>

                    <div className="note-modal__foot-actions">
                      {isSelectedMine && (
                        <button
                          type="button"
                          className="minimal-wish__edit minimal-wish__edit--modal"
                          onClick={() => openEditMode(selectedNote)}
                          aria-label="Chỉnh sửa tờ note của bạn"
                        >
                          <EditPenIcon size={13} />
                          <span>Sửa note</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className={`minimal-wish__like ${likedIds[selectedNote.id] ? 'is-liked' : ''}`}
                        onClick={() => toggleLike(selectedNote.id)}
                        aria-label={
                          likedIds[selectedNote.id]
                            ? `Bỏ thả tim tờ note của ${selectedNote.name}`
                            : `Thả tim tờ note của ${selectedNote.name}`
                        }
                        aria-pressed={!!likedIds[selectedNote.id]}
                      >
                        <HeartIcon size={15} />
                        {!likedIds[selectedNote.id] && <span>Thả tim</span>}
                      </button>
                    </div>
                  </footer>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </section>
  )
}
