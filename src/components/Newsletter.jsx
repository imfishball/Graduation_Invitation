import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { INITIAL_GUESTBOOK, NEWSLETTER } from '../data'
import { useInvitation } from '../invitationContext'
import {
  CheckIcon,
  ChevronDownIcon,
  FeatherPenIcon,
  HeartIcon,
  NoteDoodleIcon,
  OutlineStarIcon,
  PaperclipIcon,
  WavyLineSvg,
  XIcon,
} from './Icons'
import SectionHead from './SectionHead'

const STORAGE_KEY = 'graduation_guestbook_messages_v6'
const LIKES_STORAGE_KEY = 'graduation_guestbook_likes_v1'
const NOTE_TILTS = ['-1.1deg', '0.9deg', '-0.7deg', '1deg']
const FASTENERS = ['tape-stripe', 'tape-dots', 'pushpin', 'tape-grid']
const DOODLES = ['star', 'heart', 'flower', 'sparkle']

export default function Newsletter() {
  const { copy } = useInvitation()
  const showIdentityFields = !copy.isPersonalized

  const [name, setName] = useState('')
  const [role, setRole] = useState(NEWSLETTER.roles[0])
  const [customRole, setCustomRole] = useState('')
  const [attendance, setAttendance] = useState('attending') // attending | remote
  const [noteColor, setNoteColor] = useState(NEWSLETTER.noteColors[0].id)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [guestbook, setGuestbook] = useState(INITIAL_GUESTBOOK)
  const [newestId, setNewestId] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [likedIds, setLikedIds] = useState(() => {
    try {
      const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY)
      return savedLikes ? JSON.parse(savedLikes) : {}
    } catch {
      return {}
    }
  })

  // Tải bảng giấy note từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGuestbook(parsed)
          return
        }
      }
      setGuestbook(INITIAL_GUESTBOOK)
    } catch {
      setGuestbook(INITIAL_GUESTBOOK)
    }
  }, [])

  // Xóa thông báo lỗi cũ khi chuyển đổi chế độ xem thử thiệp mặc định / cá nhân hóa
  useEffect(() => {
    setStatus((prev) => (prev === 'error' ? 'idle' : prev))
    setErrorMsg('')
  }, [showIdentityFields])

  // Khóa cuộn trang & hỗ trợ phím Escape khi mở xem chi tiết tờ note
  useEffect(() => {
    if (!selectedNote) return
    document.body.classList.add('is-locked')
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNote(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('is-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNote])

  const saveGuestbook = (list) => {
    setGuestbook(list)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }

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

  const handleSubmit = (e) => {
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

    setTimeout(() => {
      const id = 'msg-' + Date.now()
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

      const newEntry = {
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

      const updated = [newEntry, ...guestbook]
      saveGuestbook(updated)
      setNewestId(id)

      triggerConfetti()
      setStatus('success')
      setMessage('')
      if (showIdentityFields) {
        setName('')
        setRole(NEWSLETTER.roles[0])
        setCustomRole('')
      }
    }, 320)
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
        <div className="wishes__header reveal">
          <SectionHead
            tagline={NEWSLETTER.script}
            title={NEWSLETTER.title}
            id="wishes-title"
          />
          <p className="wishes__subtitle">
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
                      <label className="minimal-label" htmlFor="guest-role">
                        {copy.newsletter.roleLabel || 'Bạn đến với Mai là'}
                      </label>
                      <div className="minimal-select-wrap">
                        <select
                          id="guest-role"
                          className="minimal-input minimal-select"
                          value={role}
                          onChange={(e) => {
                            const nextRole = e.target.value
                            setRole(nextRole)
                            if (nextRole !== 'Khác') {
                              setCustomRole('')
                            } else {
                              requestAnimationFrame(() => {
                                document.getElementById('guest-custom-role')?.focus()
                              })
                            }
                          }}
                          disabled={status === 'submitting'}
                        >
                          {NEWSLETTER.roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <span className="minimal-select-icon">
                          <ChevronDownIcon size={16} />
                        </span>
                      </div>

                      {role === 'Khác' && (
                        <input
                          id="guest-custom-role"
                          className="minimal-input minimal-input--custom-role"
                          type="text"
                          maxLength={50}
                          placeholder="Ví dụ: Đồng nghiệp, Bạn cấp 3..."
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
                  <div className="notes-grid">
                    {guestbook.map((entry, idx) => {
                      const isLiked = !!likedIds[entry.id]
                      const isFresh = entry.id === newestId
                      const colorId =
                        entry.noteColor ||
                        NEWSLETTER.noteColors[idx % NEWSLETTER.noteColors.length].id
                      const fastener = entry.fastener || FASTENERS[idx % FASTENERS.length]
                      const doodle = entry.doodle || DOODLES[idx % DOODLES.length]
                      const tilt = NOTE_TILTS[idx % NOTE_TILTS.length]
                      const hasPaperclip = fastener === 'tape-grid'

                      return (
                        <article
                          className={`sticky-note sticky-note--${colorId} ${isFresh ? 'is-fresh' : ''}`}
                          key={entry.id}
                          style={{ '--note-tilt': tilt }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Xem trọn vẹn lời chúc của ${entry.name}`}
                          onClick={() => setSelectedNote({ ...entry, colorId, fastener, doodle, idx })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedNote({ ...entry, colorId, fastener, doodle, idx })
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
                                {isFresh && <span className="minimal-wish__new">Mới dán</span>}
                              </div>
                              <span className="minimal-wish__role">{entry.role}</span>
                            </div>

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
                              {!isLiked && <span>Thả tim</span>}
                            </button>
                          </footer>
                        </article>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal phóng to xem trọn vẹn nội dung tờ note */}
      {selectedNote && (
        <div
          className="note-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-modal-author"
          onClick={() => setSelectedNote(null)}
        >
          <div className="note-modal__backdrop" />
          <div
            className={`note-modal__card sticky-note--${selectedNote.colorId}`}
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
              onClick={() => setSelectedNote(null)}
              aria-label="Đóng tờ note"
            >
              <XIcon size={18} />
            </button>

            <div className="note-modal__body" data-lenis-prevent>
              <p className="note-modal__msg">{selectedNote.message}</p>
            </div>

            <footer className="note-modal__foot">
              <div className="minimal-wish__author">
                <div className="sticky-note__name-row">
                  <strong className="note-modal__name" id="note-modal-author">
                    {selectedNote.name}
                  </strong>
                  {selectedNote.id === newestId && (
                    <span className="minimal-wish__new">Mới dán</span>
                  )}
                </div>
                <span className="note-modal__meta">
                  {selectedNote.role}
                  {selectedNote.time ? ` · ${selectedNote.time}` : ''}
                </span>
              </div>

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
            </footer>
          </div>
        </div>
      )}
    </section>
  )
}
