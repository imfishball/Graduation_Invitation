export const NOTES_SYNC_EVENT = 'graduation:notes-sync'
export const LOCAL_FALLBACK_KEY = 'graduation_guestbook_local_only_v1'
export const DELETED_FALLBACK_KEY = 'graduation_guestbook_deleted_local_v1'
export const LIKES_STORAGE_KEY = 'graduation_guestbook_likes_v1'

export function readLocalFallbackNotes() {
  try {
    const saved = localStorage.getItem(LOCAL_FALLBACK_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalFallbackNotes(notes) {
  try {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(notes))
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
}

export function readLocalDeletedIds() {
  try {
    const saved = localStorage.getItem(DELETED_FALLBACK_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function saveLocalDeletedIds(ids) {
  try {
    localStorage.setItem(DELETED_FALLBACK_KEY, JSON.stringify([...new Set(ids.map(String))]))
  } catch {
    // ignore
  }
}

export function buildInitialGuestbook(defaultNotes) {
  const localOnly = readLocalFallbackNotes()
  const deletedSet = new Set(readLocalDeletedIds())
  const base = (localOnly.length > 0 ? [...localOnly, ...defaultNotes] : defaultNotes).filter(
    (item) => item && !deletedSet.has(String(item.id))
  )
  return base
}

export function mergeServerNotes(data) {
  const serverNotes = Array.isArray(data?.notes) ? data.notes : []
  if (data?.shared === false) {
    const deletedSet = new Set(readLocalDeletedIds())
    const localOnly = readLocalFallbackNotes().filter(
      (item) => item && !deletedSet.has(String(item.id))
    )
    const serverIds = new Set(serverNotes.map((item) => item?.id))
    const extraLocal = localOnly.filter((item) => item && !serverIds.has(item.id))
    const visibleServer = serverNotes.filter((item) => item && !deletedSet.has(String(item.id)))
    return [...extraLocal, ...visibleServer]
  }

  return serverNotes
}

export function removeNoteFromLocalCaches(deletedId, { trackLocalDelete = false } = {}) {
  const idStr = String(deletedId || '')
  if (!idStr) return

  const nextLocal = readLocalFallbackNotes().filter((item) => String(item?.id || '') !== idStr)
  saveLocalFallbackNotes(nextLocal)

  if (trackLocalDelete) {
    saveLocalDeletedIds([...readLocalDeletedIds(), idStr])
  }

  try {
    const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY)
    if (savedLikes) {
      const parsedLikes = JSON.parse(savedLikes)
      if (parsedLikes && typeof parsedLikes === 'object' && idStr in parsedLikes) {
        delete parsedLikes[idStr]
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(parsedLikes))
      }
    }
  } catch {
    // ignore
  }
}

export function dispatchNotesSync(detail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(NOTES_SYNC_EVENT, { detail }))
}
