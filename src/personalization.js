/**
 * Hệ thống cá nhân hóa xưng hô & mã hóa link thiệp (?i=...)
 * Hoàn toàn client-side, không lộ tên khách hay phân loại vai vế plaintext trên URL.
 */

export const INVITE_PRESETS = [
  {
    id: 'chung',
    code: '0',
    label: 'Chung (mọi người)',
    shortDesc: 'Mình – mọi người',
    heroLead: 'Mình',
    defaultName: 'mọi người',
  },
  {
    id: 'ban',
    code: '1',
    label: 'Bạn bè',
    shortDesc: 'Mình / Mai – bạn',
    heroLead: 'Mình',
    defaultName: 'bạn',
  },
  {
    id: 'ban_than',
    code: '2',
    label: 'Bạn thân',
    shortDesc: 'Mình / Mai – thân mật',
    heroLead: 'Mình',
    defaultName: 'bạn hiền',
  },
  {
    id: 'anh',
    code: '3',
    label: 'Anh',
    shortDesc: 'Em / Xuân Mai – Anh',
    heroLead: 'Em',
    defaultName: 'Anh',
    prefixTitle: 'Anh',
  },
  {
    id: 'chi',
    code: '4',
    label: 'Chị',
    shortDesc: 'Em / Xuân Mai – Chị',
    heroLead: 'Em',
    defaultName: 'Chị',
    prefixTitle: 'Chị',
  },
  {
    id: 'em',
    code: '5',
    label: 'Em (khóa dưới / em)',
    shortDesc: 'Chị / Mai – Em',
    heroLead: 'Chị',
    defaultName: 'Em',
    prefixTitle: 'Em',
  },
  {
    id: 'thay',
    code: '6',
    label: 'Thầy',
    shortDesc: 'Em / Xuân Mai – Thầy',
    heroLead: 'Em',
    defaultName: 'Thầy',
    prefixTitle: 'Thầy',
  },
  {
    id: 'co',
    code: '7',
    label: 'Cô',
    shortDesc: 'Em / Xuân Mai – Cô',
    heroLead: 'Em',
    defaultName: 'Cô',
    prefixTitle: 'Cô',
  },
  {
    id: 'bome',
    code: '8',
    label: 'Bố Mẹ / Gia đình',
    shortDesc: 'Con – Bố Mẹ',
    heroLead: 'Con',
    defaultName: 'Bố Mẹ',
  },
  {
    id: 'nguoi_than',
    code: '9',
    label: 'Cô Chú / Ông Bà',
    shortDesc: 'Cháu – Cô Chú / Ông Bà',
    heroLead: 'Cháu',
    defaultName: 'Gia đình mình',
  },
]

const PRESET_BY_ID = Object.fromEntries(INVITE_PRESETS.map((p) => [p.id, p]))
const CODE_TO_PRESET = Object.fromEntries(INVITE_PRESETS.map((p) => [p.code, p.id]))

const TITLE_PREFIXES = [
  'thầy',
  'cô',
  'anh',
  'chị',
  'em',
  'bé',
  'bố',
  'mẹ',
  'ba',
  'má',
  'baba',
  'mama',
  'ông',
  'bà',
  'chú',
  'bác',
  'dì',
  'cậu',
  'mợ',
  'thím',
]

const FAMILY_CO_SECONDS = [
  'út',
  'cả',
  'hai',
  'ba',
  'tư',
  'năm',
  'sáu',
  'bảy',
  'bẩy',
  'tám',
  'chín',
  'mười',
  'ruột',
  'họ',
  'chú',
  'bác',
  'dì',
  'dượng',
]

function getWords(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

function hasHonorificPrefix(name) {
  const [head = ''] = getWords(name)
  return TITLE_PREFIXES.includes(head)
}

/** Gợi ý preset xưng hô tự động dựa trên danh xưng mở đầu trong tên */
export function detectPresetFromName(rawName) {
  const [head = '', second = ''] = getWords(rawName)
  if (!head) return null
  if (head === 'thầy') return 'thay'
  if (head === 'cô') {
    return FAMILY_CO_SECONDS.includes(second) ? 'nguoi_than' : 'co'
  }
  if (head === 'anh') return 'anh'
  if (head === 'chị') return 'chi'
  if (head === 'em' || head === 'bé') return 'em'
  if (['bố', 'mẹ', 'ba', 'má', 'baba', 'mama'].includes(head)) return 'bome'
  if (
    ['ông', 'bà', 'chú', 'bác', 'dì', 'cậu', 'mợ', 'thím'].includes(head) ||
    (head === 'gia' && second === 'đình')
  ) {
    return 'nguoi_than'
  }
  return null
}

/** Chuẩn hóa tên hiển thị ghép danh xưng tự nhiên nếu người dùng chỉ nhập tên riêng */
export function formatCallName(rawName, presetId = 'chung') {
  const preset = PRESET_BY_ID[presetId] || PRESET_BY_ID.chung
  const clean = String(rawName || '').trim()
  if (!clean) return preset.defaultName
  if (preset.prefixTitle && !hasHonorificPrefix(clean)) {
    return `${preset.prefixTitle} ${clean}`
  }
  return clean
}

/* ---------- Mã hóa / giải mã token ?i=... (UTF-8 Base64URL + XOR + Checksum) ---------- */
const TOKEN_KEY = [0x6d, 0x3a, 0xc4, 0x91, 0x5f, 0x82, 0x17, 0xb5]
const SALT_MASK = 0x5d

function toBase64Url(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i])
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const bin = atob(b64 + pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i)
  }
  return out
}

function calcChecksum(bytes) {
  let acc = 7
  for (let i = 0; i < bytes.length; i += 1) {
    acc = (acc * 31 + bytes[i]) & 0xff
  }
  return acc
}

function sanitizeField(text, maxLen) {
  return String(text || '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

function sanitizeMultiline(text, maxLen) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLen)
}

export function sanitizeOverrides(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  const coverText = sanitizeMultiline(raw.coverText, 180)
  const heroTitle = sanitizeField(raw.heroTitle, 80)
  const heroDesc = sanitizeField(raw.heroDesc, 320)
  const aboutTitle = sanitizeField(raw.aboutTitle, 80)
  const aboutPara = sanitizeField(raw.aboutPara, 420)

  if (coverText) out.coverText = coverText
  if (heroTitle) out.heroTitle = heroTitle
  if (heroDesc) out.heroDesc = heroDesc
  if (aboutTitle) out.aboutTitle = aboutTitle
  if (aboutPara) out.aboutPara = aboutPara
  return out
}

export function splitHeroHeadline(headline) {
  const clean = sanitizeField(headline, 80)
  if (!clean) return { lead: '', rest: 'tốt nghiệp rồi!' }
  const match = clean.match(/^(.*?)\s+(tốt nghiệp rồi!?)$/i)
  if (match && match[1]) {
    return { lead: match[1].trim(), rest: match[2] }
  }
  return { lead: '', rest: clean }
}

export function encodeInviteToken({
  name = '',
  preset = 'ban',
  note = '',
  overrides = {},
} = {}) {
  const presetMeta = PRESET_BY_ID[preset] || PRESET_BY_ID.ban
  const cleanName = sanitizeField(name, 60)
  const cleanNote = sanitizeField(note, 120)
  const cleanOverrides = sanitizeOverrides(overrides)

  const compactOverrides = {}
  if (cleanOverrides.coverText) compactOverrides.c = cleanOverrides.coverText
  if (cleanOverrides.heroTitle) compactOverrides.h = cleanOverrides.heroTitle
  if (cleanOverrides.heroDesc) compactOverrides.d = cleanOverrides.heroDesc
  if (cleanOverrides.aboutTitle) compactOverrides.a = cleanOverrides.aboutTitle
  if (cleanOverrides.aboutPara) compactOverrides.p = cleanOverrides.aboutPara

  const hasOverrides = Object.keys(compactOverrides).length > 0
  const payload = hasOverrides
    ? `2:${JSON.stringify([presetMeta.code, cleanName, cleanNote, compactOverrides])}`
    : cleanNote
      ? `${presetMeta.code}|${cleanName}|${cleanNote}`
      : `${presetMeta.code}|${cleanName}`

  const rawBytes = new TextEncoder().encode(payload)
  const salt = rawBytes.reduce((sum, b, idx) => (sum + b * (idx + 3)) & 0xff, 0x3b) ^ 0xa7
  const checksum = calcChecksum(rawBytes) ^ salt

  const out = new Uint8Array(rawBytes.length + 2)
  out[0] = salt ^ SALT_MASK
  out[1] = checksum
  for (let i = 0; i < rawBytes.length; i += 1) {
    out[i + 2] = rawBytes[i] ^ salt ^ TOKEN_KEY[i % TOKEN_KEY.length]
  }
  return toBase64Url(out)
}

export function decodeInviteToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const bytes = fromBase64Url(token.trim())
    if (bytes.length < 4) return null

    const salt = bytes[0] ^ SALT_MASK
    const expectedChk = bytes[1]
    const dec = new Uint8Array(bytes.length - 2)

    for (let i = 0; i < dec.length; i += 1) {
      dec[i] = bytes[i + 2] ^ salt ^ TOKEN_KEY[i % TOKEN_KEY.length]
    }

    if ((calcChecksum(dec) ^ salt) !== expectedChk) {
      return null
    }

    const decoded = new TextDecoder().decode(dec)

    // Định dạng v2 (khi có chỉnh sửa câu chữ trực tiếp)
    if (decoded.startsWith('2:')) {
      const parsed = JSON.parse(decoded.slice(2))
      if (!Array.isArray(parsed) || parsed.length < 2) return null
      const preset = CODE_TO_PRESET[parsed[0]]
      if (!preset) return null
      const rawMap = parsed[3] && typeof parsed[3] === 'object' ? parsed[3] : {}
      const overrides = sanitizeOverrides({
        coverText: rawMap.c,
        heroTitle: rawMap.h,
        heroDesc: rawMap.d,
        aboutTitle: rawMap.a,
        aboutPara: rawMap.p,
      })
      return {
        preset,
        name: sanitizeField(parsed[1], 60),
        note: parsed[2] ? sanitizeField(parsed[2], 120) : '',
        overrides,
      }
    }

    // Định dạng v1 chuẩn gọn
    const parts = decoded.split('|')
    if (parts.length < 2 || parts.length > 3) return null

    const preset = CODE_TO_PRESET[parts[0]]
    if (!preset) return null

    return {
      preset,
      name: sanitizeField(parts[1], 60),
      note: parts[2] ? sanitizeField(parts[2], 120) : '',
      overrides: {},
    }
  } catch {
    return null
  }
}

/** Xây dựng toàn bộ câu chữ đồng bộ xưng hô cho toàn website */
export function buildPersonalizedCopy(invite) {
  const rawName = sanitizeField(invite?.name, 60)
  const customNote = sanitizeField(invite?.note, 120)
  const presetId = PRESET_BY_ID[invite?.preset] ? invite.preset : 'chung'
  const presetMeta = PRESET_BY_ID[presetId]
  const cleanOverrides = sanitizeOverrides(invite?.overrides)
  const hasOverrides = Object.keys(cleanOverrides).length > 0
  const isPersonalized =
    presetId !== 'chung' || Boolean(rawName) || Boolean(customNote) || hasOverrides
  const callName = formatCallName(rawName, presetId)
  const hasExplicitName = Boolean(rawName)

  const base = buildBaseCopy({
    presetId,
    presetMeta,
    isPersonalized,
    rawName,
    callName,
    customNote,
    hasExplicitName,
  })

  const defaultCoverText = `${base.cover.prefix} ${base.callName}\n${base.cover.suffix}`
  const defaultHeroTitle = `${base.hero.lead} tốt nghiệp rồi!`
  const defaultHeroDesc = base.hero.description
  const defaultAboutTitle = base.about.title
  const defaultAboutPara = base.about.paragraphs[1]

  const finalCoverText = cleanOverrides.coverText || defaultCoverText
  const finalHeroTitle = cleanOverrides.heroTitle || defaultHeroTitle
  const heroSplit = cleanOverrides.heroTitle
    ? splitHeroHeadline(finalHeroTitle)
    : { lead: base.hero.lead, rest: 'tốt nghiệp rồi!' }
  const finalHeroDesc = cleanOverrides.heroDesc || defaultHeroDesc
  const finalAboutTitle = cleanOverrides.aboutTitle || defaultAboutTitle
  const finalAboutPara = cleanOverrides.aboutPara || defaultAboutPara

  return {
    ...base,
    isPersonalized,
    overrides: cleanOverrides,
    defaults: {
      coverText: defaultCoverText,
      heroTitle: defaultHeroTitle,
      heroDesc: defaultHeroDesc,
      aboutTitle: defaultAboutTitle,
      aboutPara: defaultAboutPara,
    },
    cover: {
      ...base.cover,
      text: finalCoverText,
      isCustom: Boolean(cleanOverrides.coverText),
      customLines: cleanOverrides.coverText
        ? finalCoverText
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
        : null,
    },
    hero: {
      ...base.hero,
      lead: heroSplit.lead,
      rest: heroSplit.rest,
      titleText: finalHeroTitle,
      isCustomTitle: Boolean(cleanOverrides.heroTitle),
      description: finalHeroDesc,
    },
    about: {
      ...base.about,
      title: finalAboutTitle,
      paragraphs: [base.about.paragraphs[0], finalAboutPara],
    },
  }
}

function buildBaseCopy({
  presetId,
  presetMeta,
  isPersonalized,
  rawName,
  callName,
  customNote,
  hasExplicitName,
}) {

  if (presetId === 'anh') {
    const midCall = hasExplicitName ? callName : 'anh'
    const midLower = 'anh'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Trân trọng kính mời',
        suffix: 'đến chung vui cùng em trong ngày trọng đại này',
      },
      hero: {
        lead: 'Em',
        description: `Thanh xuân tại UIT sắp khép lại, mở ra một hành trình mới. Mong được đón ${midCall} đến chung vui và lưu giữ khoảnh khắc đáng nhớ này cùng em.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: {
        title: hasExplicitName ? `Đôi dòng gửi ${callName}` : 'Đôi dòng gửi anh',
        paragraphs: [
          'Bốn năm đại học tại UIT đã chính thức khép lại. Để có được cột mốc hôm nay là nhờ sự hy sinh thầm lặng của Bố Mẹ, sự dìu dắt tận tâm của Thầy Cô và sự nâng đỡ ấm áp của những người anh đi trước, bạn bè xung quanh.',
          `Sự hiện diện hay dù chỉ là một lời chúc từ ${midCall} đều là món quà vô giá đối với em. Cảm ơn ${midLower} đã luôn động viên và dõi theo hành trình trưởng thành của em Mai!`,
        ],
      },
      newsletter: {
        subtitle: `Hãy viết đôi dòng lên tờ giấy note gửi em Mai — sự hiện diện hay lời chúc của ${midCall} đều là kỷ niệm Mai sẽ trân trọng giữ mãi.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Anh'} có tham dự buổi lễ cùng em không?`,
        attendingChoice: 'Anh sẽ tham dự',
        remoteChoice: 'Anh gửi chúc từ xa',
        defaultAuthor: 'Anh thân mến',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc gửi em Mai lên tờ note tại đây...',
        errorMessage: 'Hãy viết đôi dòng lên tờ giấy note gửi đến em Mai trước khi dán nha!',
        successMessage: `Tờ note mới đã được dán lên bảng kỷ niệm! Em Mai cảm ơn tình cảm của ${midCall} nhiều ạ.`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Em xin gửi lời cảm ơn chân thành nhất đến gia đình, thầy cô, bạn bè và đặc biệt cảm ơn ${midCall} đã dành thời gian đến chung vui, để ngày tốt nghiệp của em trở nên trọn vẹn và đáng nhớ hơn bao giờ hết.`,
      },
      inviteSms: `Em chào ${midCall}, sắp tới chiều thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của em tại trường UIT ạ. Em trân trọng gửi ${midLower} tấm thiệp mời online này, rất mong được đón ${midLower} đến chung vui và chụp cùng em tấm ảnh kỷ niệm nhé!`,
    }
  }

  if (presetId === 'chi') {
    const midCall = hasExplicitName ? callName : 'chị'
    const midLower = 'chị'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Trân trọng kính mời',
        suffix: 'đến chung vui cùng em trong ngày trọng đại này',
      },
      hero: {
        lead: 'Em',
        description: `Thanh xuân tại UIT sắp khép lại, mở ra một hành trình mới. Mong được đón ${midCall} đến chung vui và lưu giữ khoảnh khắc đáng nhớ này cùng em.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: {
        title: hasExplicitName ? `Đôi dòng gửi ${callName}` : 'Đôi dòng gửi chị',
        paragraphs: [
          'Bốn năm đại học tại UIT đã chính thức khép lại. Để có được cột mốc hôm nay là nhờ sự hy sinh thầm lặng của Bố Mẹ, sự dìu dắt tận tâm của Thầy Cô và tình cảm quý mến từ những người chị đi trước, bạn bè xung quanh.',
          `Sự hiện diện hay dù chỉ là một lời chúc từ ${midCall} đều là món quà vô giá đối với em. Cảm ơn ${midLower} đã luôn động viên và là một phần thanh xuân thật đẹp của em Mai!`,
        ],
      },
      newsletter: {
        subtitle: `Hãy viết đôi dòng lên tờ giấy note gửi em Mai — sự hiện diện hay lời chúc của ${midCall} đều là kỷ niệm Mai sẽ trân trọng giữ mãi.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Chị'} có tham dự buổi lễ cùng em không?`,
        attendingChoice: 'Chị sẽ tham dự',
        remoteChoice: 'Chị gửi chúc từ xa',
        defaultAuthor: 'Chị thân mến',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc gửi em Mai lên tờ note tại đây...',
        errorMessage: 'Hãy viết đôi dòng lên tờ giấy note gửi đến em Mai trước khi dán nha!',
        successMessage: `Tờ note mới đã được dán lên bảng kỷ niệm! Em Mai cảm ơn tình cảm của ${midCall} nhiều ạ.`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Em xin gửi lời cảm ơn chân thành nhất đến gia đình, thầy cô, bạn bè và đặc biệt cảm ơn ${midCall} đã dành thời gian đến chung vui, để ngày tốt nghiệp của em trở nên trọn vẹn và đáng nhớ hơn bao giờ hết.`,
      },
      inviteSms: `Em chào ${midCall}, sắp tới chiều thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của em tại trường UIT ạ. Em trân trọng gửi ${midLower} tấm thiệp mời online này, rất mong được đón ${midLower} đến chung vui và chụp cùng em tấm ảnh kỷ niệm nhé!`,
    }
  }

  if (presetId === 'em') {
    const midCall = hasExplicitName ? callName : 'em'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Trân trọng kính mời',
        suffix: 'đến chung vui cùng chị trong ngày trọng đại này',
      },
      hero: {
        lead: 'Chị',
        description: `Thanh xuân tại UIT sắp khép lại, mở ra một hành trình mới. Mong được cùng ${midCall} lưu giữ khoảnh khắc thật đáng nhớ này nhé.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: {
        title: hasExplicitName ? `Đôi dòng gửi ${callName}` : 'Đôi dòng gửi em',
        paragraphs: [
          'Bốn năm đại học tại UIT của chị đã chính thức khép lại. Để có được cột mốc hôm nay là nhờ sự hy sinh thầm lặng của Bố Mẹ, sự dìu dắt tận tâm của Thầy Cô và niềm vui bên cạnh gia đình, bạn bè, các em thân thương.',
          `Chiều 27/11 nếu rảnh thì qua UIT chụp ảnh với chị nha! Sự hiện diện hay lời chúc từ ${midCall} đều là món quà rất ý nghĩa đối với chị Mai.`,
        ],
      },
      newsletter: {
        subtitle: `Viết đôi dòng lên một tờ giấy note gửi chị Mai nhé — từng lời chúc hay cái hẹn chiều 27/11 của ${midCall} chị đều trân quý giữ mãi.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Em'} có tham dự buổi lễ cùng chị không?`,
        attendingChoice: 'Em sẽ tham dự',
        remoteChoice: 'Em gửi chúc từ xa',
        defaultAuthor: 'Em thân mến',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc gửi chị Mai lên tờ note tại đây...',
        errorMessage: 'Hãy viết đôi dòng lên tờ giấy note gửi đến chị Mai trước khi dán nha!',
        successMessage: `Tờ note mới đã được dán lên bảng kỷ niệm! Chị Mai cảm ơn ${midCall} nhiều nha.`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Chị xin gửi lời cảm ơn chân thành nhất đến gia đình, thầy cô, bạn bè và cảm ơn ${midCall} đã dành thời gian đến chung vui, để ngày tốt nghiệp của chị trở nên trọn vẹn và đáng nhớ hơn bao giờ hết.`,
      },
      inviteSms: `${hasExplicitName ? callName : 'Em'} ơi, chiều thứ Sáu 27/11 (15:00 – 17:00) chị làm lễ tốt nghiệp tại UIT nè. Chị gửi tấm thiệp nhỏ này mời ${midCall} qua trường chung vui và chụp ảnh kỷ niệm với chị nha!`,
    }
  }

  if (presetId === 'thay' || presetId === 'co') {
    const titleWord = presetId === 'thay' ? 'Thầy' : 'Cô'
    const midCall = hasExplicitName ? callName : titleWord
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Trân trọng kính mời',
        suffix: 'đến chung vui trong ngày lễ tốt nghiệp của em',
      },
      hero: {
        lead: 'Em',
        description: `Bốn năm dưới mái trường UIT sắp khép lại, mở ra một hành trình mới. Em rất mong được đón ${midCall} đến chung vui và lưu giữ cùng em khoảnh khắc đáng nhớ này.`,
      },
      countdownPillPrefix: 'Kính mời',
      about: {
        title: hasExplicitName ? `Đôi dòng kính gửi ${callName}` : `Đôi dòng kính gửi ${titleWord}`,
        paragraphs: [
          `Bốn năm học tập và trưởng thành tại UIT đã chính thức khép lại. Để có được cột mốc tốt nghiệp hôm nay, em luôn khắc ghi công ơn dạy dỗ, sự dìu dắt tận tâm và những bài học quý giá từ ${midCall} cũng như quý Thầy Cô trong suốt thời gian qua.`,
          `Sự hiện diện hay dù chỉ là một lời chúc từ ${midCall} đều là niềm vinh dự và món quà tinh thần vô giá đối với em. Em kính chúc ${titleWord} luôn thật nhiều sức khỏe và niềm vui trên bục giảng.`,
        ],
      },
      newsletter: {
        subtitle: `Kính mong ${midCall} để lại đôi dòng lưu bút lên bảng kỷ niệm — từng lời nhắn gửi của ${titleWord} là hành trang quý báu em Mai sẽ mang theo mãi.`,
        attendanceLabel: `Kính hỏi ${midCall} có tham dự buổi lễ không ạ?`,
        attendingChoice: `${titleWord} sẽ tham dự`,
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: titleWord,
        noteTag: 'Giảng viên UIT',
        placeholderMessage: 'Viết đôi dòng nhắn gửi đến em Mai tại đây...',
        errorMessage: `Kính mời ${midCall} viết đôi dòng lưu bút trước khi dán lên bảng ạ.`,
        successMessage: `Tờ note mới đã được dán lên bảng kỷ niệm! Em Mai xin chân thành cảm ơn ${midCall} ạ.`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Em xin gửi lời tri ân sâu sắc nhất đến ${midCall} — người đã tận tâm dìu dắt em trong những năm tháng thanh xuân tại UIT, và rất hân hạnh nếu được đón ${titleWord} đến chung vui trong ngày lễ tốt nghiệp của em.`,
      },
      inviteSms: `Em chào ${midCall}, em là Xuân Mai (khóa K17 - UIT). Sắp tới chiều thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của em tại trường ạ. Em trân trọng kính gửi ${titleWord} tấm thiệp mời online này, rất mong nếu thuận tiện được đón ${titleWord} đến chung vui và chụp cùng em một tấm ảnh kỷ niệm ạ!`,
    }
  }

  if (presetId === 'bome') {
    const midCall = hasExplicitName ? callName : 'Bố Mẹ'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Kính mời',
        suffix: 'đến chung vui trong ngày trọng đại của con',
      },
      hero: {
        lead: 'Con',
        description: `Bốn năm đại học tại UIT sắp khép lại, mở ra một chặng đường mới. Khoảnh khắc tốt nghiệp này sẽ chẳng thể trọn vẹn nếu thiếu ${midCall} ở bên.`,
      },
      countdownPillPrefix: 'Con kính mời',
      about: {
        title: `Đôi dòng con gửi ${midCall}`,
        paragraphs: [
          `Bốn năm đại học tại UIT đã chính thức khép lại. Để con có được tấm bằng cử nhân và đứng tại cột mốc hôm nay, phía sau luôn là sự hy sinh thầm lặng, tình yêu thương vô bờ bến và niềm tin tuyệt đối mà ${midCall} đã dành trọn cho con.`,
          `Cảm ơn ${midCall} đã luôn là điểm tựa bình yên nhất. Niềm tự hào và nụ cười rạng rỡ của ${midCall} trong chiều 27/11 chính là món quà tốt nghiệp lớn nhất cuộc đời con!`,
        ],
      },
      newsletter: {
        subtitle: `Nếu muốn nhắn nhủ đôi lời cho con gái trước chặng đường mới, ${midCall} cứ viết lên tờ giấy note nhỏ này nhé — con sẽ đọc và giữ mãi.`,
        attendanceLabel: `${midCall} có tham dự buổi lễ cùng con không?`,
        attendingChoice: 'Cả nhà sẽ tham dự',
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: 'Bố Mẹ',
        noteTag: 'Gia đình',
        placeholderMessage: 'Viết lời nhắn thương yêu gửi con gái tại đây...',
        errorMessage: 'Viết vài chữ gửi con gái trước khi dán lên bảng nhé!',
        successMessage: `Con đã nhận được note yêu thương từ ${midCall} rồi ạ! Thương ${midCall} nhiều thật nhiều.`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Con xin gửi lời cảm ơn sâu sắc nhất đến ${midCall} — những người luôn ở phía sau lặng lẽ hy sinh để con yên tâm bước tiếp, và mong ngày tốt nghiệp hôm nay sẽ là kỷ niệm thật tự hào của cả nhà mình.`,
      },
      inviteSms: `${midCall} ơi, vậy là chiều thứ Sáu 27/11 (15:00 – 17:00) tới đây con chính thức làm lễ tốt nghiệp ở UIT rồi! Con gửi ${midCall} tấm thiệp mời online nhỏ xinh này, cả nhà mình cùng lên trường chụp ảnh kỷ niệm với con nhé!`,
    }
  }

  if (presetId === 'nguoi_than') {
    const midCall = hasExplicitName ? callName : 'cả nhà'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Trân trọng kính mời',
        suffix: 'đến chung vui trong ngày trọng đại của cháu',
      },
      hero: {
        lead: 'Cháu',
        description: `Bốn năm đại học tại UIT sắp khép lại, mở ra một hành trình mới. Cháu rất mong được đón ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng cháu.`,
      },
      countdownPillPrefix: 'Cháu kính mời',
      about: {
        title: hasExplicitName ? `Đôi dòng cháu gửi ${callName}` : 'Đôi dòng cháu gửi gia đình',
        paragraphs: [
          `Bốn năm đại học tại UIT của cháu đã chính thức khép lại. Để cháu có được cột mốc trưởng thành hôm nay là nhờ tình yêu thương, sự động viên và quan tâm ấm áp của Bố Mẹ, Thầy Cô và sự nâng đỡ từ ${midCall}.`,
          `Sự hiện diện hay những lời chúc từ phương xa của ${midCall} đều là món quà tinh thần vô giá đối với cháu. Cháu cảm ơn ${midCall} rất nhiều vì đã luôn dõi theo cháu!`,
        ],
      },
      newsletter: {
        subtitle: `Kính mời ${midCall} viết đôi dòng lên tờ giấy note và dán lên bảng kỷ niệm — từng lời chúc của người thân đều là niềm hạnh phúc lớn cháu sẽ giữ mãi.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Gia đình'} có tham dự buổi lễ cùng cháu không?`,
        attendingChoice: 'Cả nhà sẽ tham dự',
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: 'Người thân',
        noteTag: 'Gia đình',
        placeholderMessage: 'Viết lời chúc mừng gửi cháu Mai tại đây...',
        errorMessage: 'Hãy viết đôi dòng lên tờ giấy note gửi cháu Mai trước khi dán nha!',
        successMessage: `Tờ note mới đã được dán lên bảng kỷ niệm! Cháu Mai cảm ơn tình cảm của ${midCall} nhiều ạ.`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Cháu xin gửi lời cảm ơn chân thành nhất đến ${midCall} và cả gia đình đã luôn yêu thương, ủng hộ, để ngày tốt nghiệp của cháu trở nên trọn vẹn và đáng nhớ hơn bao giờ hết.`,
      },
      inviteSms: `Cháu chào ${midCall}, chiều thứ Sáu 27/11 (15:00 – 17:00) tới đây là lễ tốt nghiệp đại học của cháu tại UIT ạ. Cháu trân trọng gửi ${midCall} tấm thiệp mời online này, rất vui nếu được đón mọi người qua trường chung vui và chụp ảnh kỷ niệm cùng cháu ạ!`,
    }
  }

  if (presetId === 'ban_than') {
    const midCall = hasExplicitName ? callName : 'bạn hiền'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Thân mời',
        suffix: 'đến chung vui cùng Mai trong ngày trọng đại này nha',
      },
      hero: {
        lead: 'Mình',
        description: `Sau bốn năm cày deadline ở UIT cuối cùng tụi mình cũng sắp tốt nghiệp rồi! Hẹn ${midCall} qua chụp thật nhiều ảnh kỷ niệm với Mai nhé.`,
      },
      countdownPillPrefix: 'Hẹn gặp',
      about: {
        title: hasExplicitName ? `Đôi dòng gửi ${callName}` : 'Đôi dòng gửi hội bạn thân',
        paragraphs: [
          `Cuối cùng thì hành trình bốn năm ở UIT cũng sắp chạm vạch đích rồi! Cảm ơn ${midCall} vì đã đồng hành cùng Mai qua biết bao mùa thi, chạy đồ án và cả những buổi nói chuyện xuyên trưa.`,
          `Chiều 27/11 nhất định phải có mặt ở UIT ôm hoa chụp ảnh với Mai đó nha — thiếu ${midCall} là bộ ảnh tốt nghiệp mất hẳn một mảnh ghép quý giá luôn!`,
        ],
      },
      newsletter: {
        subtitle: `Viết vài dòng tâm tình hoặc chốt kèo giờ qua UIT lên tờ giấy note nha ${midCall} — mai mốt xem lại chắc chắn sẽ cười rạng rỡ lắm đây!`,
        attendanceLabel: `${hasExplicitName ? callName : 'Bạn'} có tham dự buổi lễ cùng Mai chứ?`,
        attendingChoice: 'Chắc chắn tham dự!',
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: 'Bạn thân',
        noteTag: 'Bạn thân',
        placeholderMessage: 'Viết lời chúc hoặc lời hẹn lên tờ note cho Mai nha...',
        errorMessage: 'Viết vài dòng cho Mai trước khi bấm dán note nha!',
        successMessage: `Đã dán note lên tường rồi đó! Cảm ơn ${midCall} siêu nhiều luôn!`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Mai cảm ơn gia đình, thầy cô và đặc biệt cảm ơn ${midCall} đã luôn ở bên từ giảng đường tới ngày ra trường, để thanh xuân này trở nên rực rỡ và đáng nhớ hơn bao giờ hết.`,
      },
      inviteSms: `${midCall} ơi, chiều thứ Sáu 27/11 (15:00 – 17:00) Mai tốt nghiệp ở UIT nè! Gửi ${midCall} tấm thiệp xinh này chốt lịch trước, bữa đó nhớ qua trường chụp ảnh chung vui với Mai nha!`,
    }
  }

  if (presetId === 'ban') {
    const midCall = hasExplicitName ? callName : 'bạn'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Trân trọng kính mời',
        suffix: 'đến chung vui cùng Mai trong ngày trọng đại này',
      },
      hero: {
        lead: 'Mình',
        description: `Thanh xuân tại UIT sắp khép lại, mở ra một hành trình mới. Mong được cùng ${midCall} lưu giữ khoảnh khắc đáng nhớ này.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: {
        title: hasExplicitName ? `Đôi dòng gửi ${callName}` : 'Đôi Dòng Tâm Sự',
        paragraphs: [
          'Bốn năm đại học tại UIT đã chính thức khép lại. Để có được cột mốc hôm nay là nhờ sự hy sinh thầm lặng của Bố Mẹ, sự dìu dắt tận tâm của Thầy Cô và sự sẻ chia ấm áp của bạn bè.',
          `Sự hiện diện hay dù chỉ là một lời chúc từ ${midCall} đều là món quà vô giá đối với Mai. Cảm ơn vì đã luôn là một phần thanh xuân tuyệt vời của mình!`,
        ],
      },
      newsletter: {
        subtitle: `Hãy viết đôi dòng lên một tờ giấy note và dán lên bảng kỷ niệm — từng lời chúc hay cái hẹn chiều 27/11 của ${midCall} đều là mảnh ghép Mai sẽ giữ mãi.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Bạn'} có tham dự buổi lễ cùng Mai không?`,
        attendingChoice: 'Mình sẽ tham dự',
        remoteChoice: 'Mình gửi chúc từ xa',
        defaultAuthor: 'Bạn của Mai',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc hoặc kỷ niệm lên tờ note tại đây...',
        errorMessage: 'Hãy viết đôi dòng lên tờ giấy note gửi đến Mai trước khi dán nha!',
        successMessage: `Tờ note mới đã được dán lên bảng kỷ niệm! Cảm ơn tình cảm của ${midCall}.`,
      },
      footer: {
        message: `Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Xuân Mai xin gửi lời cảm ơn chân thành nhất đến gia đình, thầy cô, bạn bè — và cảm ơn ${midCall} đã dành thời gian đến chung vui, để ngày tốt nghiệp này trở nên trọn vẹn và đáng nhớ hơn bao giờ hết.`,
      },
      inviteSms: `${hasExplicitName ? `Chào ${callName}` : 'Chào bạn'}, chiều thứ Sáu 27/11 (15:00 – 17:00) tới đây là lễ tốt nghiệp của Mai tại trường UIT. Mai gửi ${midCall} tấm thiệp mời online này, rất mong được đón ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng Mai nhé!`,
    }
  }

  // Mặc định: chung (mọi người)
  return {
    preset: presetMeta,
    isPersonalized: Boolean(customNote),
    rawName: '',
    callName: 'mọi người',
    customNote,
    cover: {
      prefix: 'Trân trọng kính mời',
      suffix: 'đến chung vui trong ngày trọng đại này',
    },
    hero: {
      lead: 'Mình',
      description:
        'Thanh xuân tại UIT sắp khép lại, mở ra một hành trình mới. Mong được cùng mọi người lưu giữ khoảnh khắc đáng nhớ này.',
    },
    countdownPillPrefix: 'Trân trọng kính mời',
    about: {
      title: 'Đôi Dòng Tâm Sự',
      paragraphs: [
        'Bốn năm đại học tại UIT đã chính thức khép lại. Để có được cột mốc hôm nay là nhờ sự hy sinh thầm lặng của Bố Mẹ, sự dìu dắt tận tâm của Thầy Cô và sự sẻ chia ấm áp của bạn bè.',
        'Sự hiện diện hay dù chỉ là một lời chúc từ phương xa của bạn đều là món quà vô giá đối với Mai. Cảm ơn vì đã luôn là một phần thanh xuân tuyệt vời của Mai!',
      ],
    },
    newsletter: {
      subtitle:
        'Hãy viết đôi dòng lên một tờ giấy note và dán lên bảng kỷ niệm — từng lời chúc hay cái hẹn chiều 27/11 đều là mảnh ghép thanh xuân Mai sẽ giữ mãi.',
      attendanceLabel: 'Bạn có tham dự buổi lễ không?',
      attendingChoice: 'Rất vui được tham dự',
      remoteChoice: 'Gửi lời chúc từ xa',
      defaultAuthor: 'Khách mời',
      noteTag: '',
      placeholderMessage: 'Viết lời chúc hoặc kỷ niệm lên tờ note tại đây...',
      errorMessage: 'Hãy viết đôi dòng lên tờ giấy note gửi đến Mai trước khi dán nha!',
      successMessage: 'Tờ note mới đã được dán lên bảng kỷ niệm! Cảm ơn tình cảm của bạn.',
    },
    footer: {
      message:
        'Bốn năm đại học là hành trình của tri thức, của những nỗ lực không ngừng và của biết bao yêu thương nâng đỡ. Xuân Mai xin gửi lời cảm ơn chân thành nhất đến gia đình, thầy cô và bạn bè — những người đã luôn ở bên, và xin cảm ơn mọi người đã dành thời gian đến chung vui, để ngày tốt nghiệp này trở nên trọn vẹn và đáng nhớ hơn bao giờ hết.',
    },
    inviteSms:
      'Chào mọi người, chiều thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của Xuân Mai tại UIT. Mai gửi tấm thiệp mời online này, rất mong được đón mọi người đến chung vui và chụp ảnh kỷ niệm cùng Mai nhé!',
  }
}
