import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NOTES_FILE_PATH = fileURLToPath(new URL('../data/notes.json', import.meta.url))
const CWD_NOTES_FILE_PATH = path.resolve(process.cwd(), 'data', 'notes.json')
const MAX_BODY_BYTES = 16 * 1024
const MAX_STORED_NOTES = 500
const KV_KEY = 'graduation:guestbook:notes:v1'
const GIST_FILENAME = 'notes.json'

const ALLOWED_COLORS = new Set(['rose', 'butter', 'mint', 'sky', 'cream'])
const FASTENERS = ['tape-stripe', 'tape-dots', 'pushpin', 'tape-grid']
const DOODLES = ['star', 'heart', 'flower', 'sparkle']

let fileWriteQueue = Promise.resolve()

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.end(JSON.stringify(data))
}

async function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body
    }
    if (typeof req.body === 'string') {
      return req.body.trim() ? JSON.parse(req.body) : {}
    }
    if (Buffer.isBuffer(req.body)) {
      const text = req.body.toString('utf8')
      return text.trim() ? JSON.parse(text) : {}
    }
  }

  return await new Promise((resolve, reject) => {
    const chunks = []
    let totalBytes = 0

    req.on('data', (chunk) => {
      totalBytes += chunk.length
      if (totalBytes > MAX_BODY_BYTES) {
        const err = new Error('Payload too large')
        err.code = 'PAYLOAD_TOO_LARGE'
        reject(err)
        req.destroy()
        return
      }
      chunks.push(chunk)
    })

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim()
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        const err = new Error('Invalid JSON')
        err.code = 'INVALID_JSON'
        reject(err)
      }
    })

    req.on('error', reject)
  })
}

function formatVietnamTime(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date)

    const get = (type) => parts.find((p) => p.type === type)?.value || ''
    const day = get('day')
    const month = get('month')
    const hour = get('hour')
    const minute = get('minute')
    if (day && month && hour && minute) {
      return `${day}/${month} lúc ${hour}:${minute}`
    }
  } catch {
    // Fallback below
  }
  return 'Vừa dán'
}

function sanitizeStoredNotes(rawList) {
  if (!Array.isArray(rawList)) return []
  return rawList
    .filter((item) => item && typeof item === 'object' && typeof item.message === 'string')
    .slice(0, MAX_STORED_NOTES)
}

async function readLocalNotesFile() {
  for (const filePath of [NOTES_FILE_PATH, CWD_NOTES_FILE_PATH]) {
    try {
      const raw = (await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, '')
      const parsed = JSON.parse(raw)
      return sanitizeStoredNotes(parsed)
    } catch (err) {
      if (err?.code === 'ENOENT') continue
      throw err
    }
  }
  return []
}

async function writeLocalNotesFile(notes) {
  const dir = path.dirname(NOTES_FILE_PATH)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(NOTES_FILE_PATH, JSON.stringify(notes, null, 2) + '\n', 'utf8')
}

function getKvConfig() {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
  ).replace(/\/+$/, '')
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ''
  return url && token ? { url, token } : null
}

async function kvReadNotes(kv) {
  const res = await fetch(`${kv.url}/get/${encodeURIComponent(KV_KEY)}`, {
    headers: {
      Authorization: `Bearer ${kv.token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`KV read failed (${res.status})`)
  }

  const data = await res.json()
  if (typeof data?.result === 'string' && data.result.trim()) {
    const parsed = JSON.parse(data.result)
    const sanitized = sanitizeStoredNotes(parsed)
    if (sanitized.length > 0) return sanitized
  }

  const seed = await readLocalNotesFile()
  if (seed.length > 0) {
    await kvWriteNotes(kv, seed)
  }
  return seed
}

async function kvWriteNotes(kv, notes) {
  const res = await fetch(`${kv.url}/set/${encodeURIComponent(KV_KEY)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kv.token}`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: JSON.stringify(notes),
  })

  if (!res.ok) {
    throw new Error(`KV write failed (${res.status})`)
  }
}

function getGistConfig() {
  const gistId = (process.env.NOTES_GIST_ID || '').trim()
  const token = (process.env.GITHUB_TOKEN || '').trim()
  return gistId && token ? { gistId, token } : null
}

async function gistReadNotes(gist) {
  const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gist.gistId)}`, {
    headers: {
      Authorization: `Bearer ${gist.token}`,
      Accept: 'application/vnd.github+json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Gist read failed (${res.status})`)
  }

  const data = await res.json()
  const file = data?.files?.[GIST_FILENAME]
  if (file?.content) {
    const parsed = JSON.parse(file.content)
    const sanitized = sanitizeStoredNotes(parsed)
    if (sanitized.length > 0) return sanitized
  }

  const seed = await readLocalNotesFile()
  if (seed.length > 0) {
    await gistWriteNotes(gist, seed)
  }
  return seed
}

async function gistWriteNotes(gist, notes) {
  const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gist.gistId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${gist.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(notes, null, 2) + '\n',
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Gist write failed (${res.status})`)
  }
}

function buildNewNote(body, existingCount) {
  const cleanName = typeof body?.name === 'string' ? body.name.trim().slice(0, 60) : ''
  const cleanRole = typeof body?.role === 'string' ? body.role.trim().slice(0, 80) : ''
  const cleanMsg = typeof body?.message === 'string' ? body.message.trim().slice(0, 1200) : ''
  const attendance = body?.attendance === 'remote' ? 'remote' : 'attending'
  const noteColor = ALLOWED_COLORS.has(body?.noteColor) ? body.noteColor : 'rose'

  if (!cleanName) {
    return { error: 'Vui lòng nhập tên người gửi lời chúc.' }
  }
  if (!cleanMsg) {
    return { error: 'Vui lòng nhập lời chúc trước khi dán note lên bảng.' }
  }

  const id = `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
  const offset = (existingCount + 2) % FASTENERS.length

  return {
    note: {
      id,
      name: cleanName,
      role: cleanRole || 'Khách mời',
      attendance,
      noteColor,
      fastener: FASTENERS[offset],
      doodle: DOODLES[offset],
      message: cleanMsg,
      time: formatVietnamTime(),
      createdAt: new Date().toISOString(),
    },
  }
}

async function loadNotesWithMeta() {
  const kv = getKvConfig()
  if (kv) {
    const notes = await kvReadNotes(kv)
    return { notes, backend: 'kv', shared: true }
  }

  const gist = getGistConfig()
  if (gist) {
    const notes = await gistReadNotes(gist)
    return { notes, backend: 'gist', shared: true }
  }

  const notes = await readLocalNotesFile()
  if (process.env.VERCEL) {
    return { notes, backend: 'readonly', shared: false }
  }

  return { notes, backend: 'file', shared: true }
}

async function appendNoteWithMeta(body) {
  const kv = getKvConfig()
  if (kv) {
    const current = await kvReadNotes(kv)
    const built = buildNewNote(body, current.length)
    if (built.error) return { validationError: built.error }
    const updated = [built.note, ...current].slice(0, MAX_STORED_NOTES)
    await kvWriteNotes(kv, updated)
    return { note: built.note, notes: updated, backend: 'kv', shared: true }
  }

  const gist = getGistConfig()
  if (gist) {
    const current = await gistReadNotes(gist)
    const built = buildNewNote(body, current.length)
    if (built.error) return { validationError: built.error }
    const updated = [built.note, ...current].slice(0, MAX_STORED_NOTES)
    await gistWriteNotes(gist, updated)
    return { note: built.note, notes: updated, backend: 'gist', shared: true }
  }

  if (process.env.VERCEL) {
    const current = await readLocalNotesFile()
    const built = buildNewNote(body, current.length)
    if (built.error) return { validationError: built.error }
    const updated = [built.note, ...current].slice(0, MAX_STORED_NOTES)
    return { note: built.note, notes: updated, backend: 'readonly', shared: false }
  }

  let outcome
  const task = fileWriteQueue.then(async () => {
    const current = await readLocalNotesFile()
    const built = buildNewNote(body, current.length)
    if (built.error) {
      outcome = { validationError: built.error }
      return
    }
    const updated = [built.note, ...current].slice(0, MAX_STORED_NOTES)
    await writeLocalNotesFile(updated)
    outcome = { note: built.note, notes: updated, backend: 'file', shared: true }
  })

  fileWriteQueue = task.catch(() => {})
  await task
  return outcome
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await loadNotesWithMeta()
      return sendJson(res, 200, { ok: true, ...result })
    } catch (err) {
      return sendJson(res, 500, {
        ok: false,
        error: 'Không thể tải danh sách lời chúc từ máy chủ.',
      })
    }
  }

  if (req.method === 'POST') {
    let body
    try {
      body = await readJsonBody(req)
    } catch (err) {
      const status = err?.code === 'PAYLOAD_TOO_LARGE' ? 413 : 400
      return sendJson(res, status, { ok: false, error: 'Dữ liệu lời chúc không hợp lệ.' })
    }

    try {
      const result = await appendNoteWithMeta(body)
      if (result.validationError) {
        return sendJson(res, 400, { ok: false, error: result.validationError })
      }
      return sendJson(res, 200, { ok: true, ...result })
    } catch (err) {
      return sendJson(res, 500, {
        ok: false,
        error: 'Không thể lưu lời chúc vào lúc này. Vui lòng thử lại.',
      })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return sendJson(res, 405, { ok: false, error: 'Phương thức không hợp lệ.' })
}
