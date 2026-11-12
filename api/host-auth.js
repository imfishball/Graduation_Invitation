import crypto from 'node:crypto'

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000 // 8 giờ cho mỗi phiên đăng nhập Host
const MAX_BODY_BYTES = 8 * 1024

function sha256Buffer(value) {
  return crypto.createHash('sha256').update(String(value ?? ''), 'utf8').digest()
}

function getSigningKey(configuredPassword) {
  const baseSecret = process.env.HOST_AUTH_SECRET || `host-session-v1:${configuredPassword}`
  return sha256Buffer(baseSecret)
}

function signSessionToken(expiresAt, signingKey) {
  const payload = String(expiresAt)
  const signature = crypto.createHmac('sha256', signingKey).update(payload, 'utf8').digest('hex')
  return `${payload}.${signature}`
}

function verifySessionToken(token, signingKey) {
  if (typeof token !== 'string') return false
  const parts = token.trim().split('.')
  if (parts.length !== 2) return false

  const [payload, signature] = parts
  if (!/^\d+$/.test(payload) || !/^[0-9a-f]{64}$/i.test(signature)) return false

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return false

  const expectedHex = crypto.createHmac('sha256', signingKey).update(payload, 'utf8').digest('hex')
  const actualBuf = Buffer.from(signature.toLowerCase(), 'utf8')
  const expectedBuf = Buffer.from(expectedHex, 'utf8')
  if (actualBuf.length !== expectedBuf.length) return false

  return crypto.timingSafeEqual(actualBuf, expectedBuf)
}

export function verifyHostToken(token) {
  const configuredPassword = process.env.HOST_PASSWORD || ''
  if (!configuredPassword) {
    return {
      ok: false,
      status: 503,
      code: 'NOT_CONFIGURED',
      error: 'Trang Host chưa được cấu hình biến môi trường HOST_PASSWORD trên máy chủ.',
    }
  }

  const signingKey = getSigningKey(configuredPassword)
  if (!verifySessionToken(token, signingKey)) {
    return {
      ok: false,
      status: 401,
      code: 'INVALID_TOKEN',
      error: 'Phiên đăng nhập Host đã hết hạn hoặc không hợp lệ, vui lòng mở khóa lại.',
    }
  }

  return { ok: true }
}

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendJson(res, 405, { ok: false, error: 'Phương thức không hợp lệ.' })
  }

  const configuredPassword = process.env.HOST_PASSWORD || ''
  if (!configuredPassword) {
    return sendJson(res, 503, {
      ok: false,
      code: 'NOT_CONFIGURED',
      error: 'Trang Host chưa được cấu hình biến môi trường HOST_PASSWORD trên máy chủ.',
    })
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (err) {
    const status = err?.code === 'PAYLOAD_TOO_LARGE' ? 413 : 400
    return sendJson(res, status, { ok: false, error: 'Dữ liệu gửi lên không hợp lệ.' })
  }

  const signingKey = getSigningKey(configuredPassword)

  // Kiểm tra token phiên hiện tại trong sessionStorage
  if (body?.action === 'verify') {
    const valid = verifySessionToken(body?.token, signingKey)
    if (!valid) {
      return sendJson(res, 401, {
        ok: false,
        code: 'INVALID_TOKEN',
        error: 'Phiên đăng nhập đã hết hạn, vui lòng nhập lại mật khẩu.',
      })
    }
    return sendJson(res, 200, { ok: true })
  }

  const inputPassword = typeof body?.password === 'string' ? body.password : ''
  if (!inputPassword) {
    return sendJson(res, 400, {
      ok: false,
      code: 'EMPTY_PASSWORD',
      error: 'Vui lòng nhập mật khẩu để mở trang Host.',
    })
  }

  const matches = crypto.timingSafeEqual(
    sha256Buffer(inputPassword),
    sha256Buffer(configuredPassword)
  )

  if (!matches) {
    // Làm chậm nhẹ mỗi lần nhập sai để hạn chế dò mật khẩu tự động
    await new Promise((resolve) => setTimeout(resolve, 260))
    return sendJson(res, 401, {
      ok: false,
      code: 'INVALID_PASSWORD',
      error: 'Mật khẩu chưa chính xác. Vui lòng thử lại.',
    })
  }

  const expiresAt = Date.now() + TOKEN_TTL_MS
  const token = signSessionToken(expiresAt, signingKey)

  return sendJson(res, 200, { ok: true, token, expiresAt })
}
