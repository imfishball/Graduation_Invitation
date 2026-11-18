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
  const newsletterSub = sanitizeField(raw.newsletterSub, 360)

  if (coverText) out.coverText = coverText
  if (heroTitle) out.heroTitle = heroTitle
  if (heroDesc) out.heroDesc = heroDesc
  if (aboutTitle) out.aboutTitle = aboutTitle
  if (aboutPara) out.aboutPara = aboutPara
  if (newsletterSub) out.newsletterSub = newsletterSub
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
  if (cleanOverrides.newsletterSub) compactOverrides.n = cleanOverrides.newsletterSub

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
        newsletterSub: rawMap.n,
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
  const defaultNewsletterSub = base.newsletter.subtitle

  const finalCoverText = cleanOverrides.coverText || defaultCoverText
  const finalHeroTitle = cleanOverrides.heroTitle || defaultHeroTitle
  const heroSplit = cleanOverrides.heroTitle
    ? splitHeroHeadline(finalHeroTitle)
    : { lead: base.hero.lead, rest: 'tốt nghiệp rồi!' }
  const finalHeroDesc = cleanOverrides.heroDesc || defaultHeroDesc
  const finalAboutTitle = cleanOverrides.aboutTitle || defaultAboutTitle
  const finalAboutPara = cleanOverrides.aboutPara || defaultAboutPara
  const finalNewsletterSub = cleanOverrides.newsletterSub || defaultNewsletterSub

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
      newsletterSub: defaultNewsletterSub,
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
    newsletter: {
      ...base.newsletter,
      subtitle: finalNewsletterSub,
    },
    footer: {
      message: DEFAULT_FOOTER_MESSAGE,
    },
  }
}

const DEFAULT_FOOTER_MESSAGE =
  'Bốn năm đại học tại UIT là chặng đường đáng nhớ với nhiều trải nghiệm và sự trưởng thành. Xuân Mai xin gửi lời cảm ơn chân thành đến gia đình, quý Thầy Cô và bạn bè đã luôn đồng hành, hỗ trợ trong suốt thời gian qua. Rất mong được đón tiếp mọi người đến chung vui trong ngày lễ tốt nghiệp.'

const ABOUT_TITLE_DEFAULT = 'Đôi Dòng Chia Sẻ'
const ABOUT_FIRST_PARAGRAPH =
  'Bốn năm đại học tại UIT đã chính thức khép lại. Để có được cột mốc hôm nay là nhờ sự quan tâm của Bố Mẹ, sự dạy bảo tận tình của quý Thầy Cô cùng sự đồng hành của gia đình và bạn bè.'

function buildAboutCopy(guestCall, selfCall, customSecondParagraph = '') {
  return {
    title: ABOUT_TITLE_DEFAULT,
    paragraphs: [
      ABOUT_FIRST_PARAGRAPH,
      customSecondParagraph ||
        `Sự hiện diện hoặc lời chúc từ phương xa của ${guestCall} là niềm vui và niềm vinh hạnh đối với ${selfCall}. Cảm ơn ${guestCall} đã luôn đồng hành cùng ${selfCall} trong thời gian qua.`,
    ],
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
        suffix: 'đến chung vui trong buổi lễ tốt nghiệp của em',
      },
      hero: {
        lead: 'Em',
        description: `Bốn năm học tập tại UIT sắp khép lại, mở ra một chặng đường mới. Em rất mong được đón tiếp ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng em.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: buildAboutCopy(midCall, 'em'),
      newsletter: {
        subtitle: `Em rất mong nhận được đôi dòng lời chúc từ ${midCall} trên bảng lưu bút kỷ niệm chiều 27/11.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Anh'} có tham dự buổi lễ cùng em không?`,
        attendingChoice: 'Anh sẽ tham dự',
        remoteChoice: 'Anh gửi chúc từ xa',
        defaultAuthor: 'Anh',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc gửi em Mai tại đây...',
        errorMessage: 'Vui lòng viết lời chúc trước khi dán lên bảng lưu bút.',
        successMessage: `Tờ note đã được dán lên bảng lưu bút. Em Mai xin cảm ơn ${midCall} ạ.`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `Em chào ${midCall}, chiều Thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của em tại Trường ĐH Công nghệ Thông tin (UIT). Em trân trọng gửi ${midLower} thiệp mời này, rất mong được đón tiếp ${midLower} đến chung vui và chụp ảnh kỷ niệm cùng em ạ.`,
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
        suffix: 'đến chung vui trong buổi lễ tốt nghiệp của em',
      },
      hero: {
        lead: 'Em',
        description: `Bốn năm học tập tại UIT sắp khép lại, mở ra một chặng đường mới. Em rất mong được đón tiếp ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng em.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: buildAboutCopy(midCall, 'em'),
      newsletter: {
        subtitle: `Em rất mong nhận được đôi dòng lời chúc từ ${midCall} trên bảng lưu bút kỷ niệm chiều 27/11.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Chị'} có tham dự buổi lễ cùng em không?`,
        attendingChoice: 'Chị sẽ tham dự',
        remoteChoice: 'Chị gửi chúc từ xa',
        defaultAuthor: 'Chị',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc gửi em Mai tại đây...',
        errorMessage: 'Vui lòng viết lời chúc trước khi dán lên bảng lưu bút.',
        successMessage: `Tờ note đã được dán lên bảng lưu bút. Em Mai xin cảm ơn ${midCall} ạ.`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `Em chào ${midCall}, chiều Thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của em tại Trường ĐH Công nghệ Thông tin (UIT). Em trân trọng gửi ${midLower} thiệp mời này, rất mong được đón tiếp ${midLower} đến chung vui và chụp ảnh kỷ niệm cùng em ạ.`,
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
        suffix: 'đến chung vui trong buổi lễ tốt nghiệp của chị',
      },
      hero: {
        lead: 'Chị',
        description: `Bốn năm học tập tại UIT của chị sắp khép lại, mở ra một chặng đường mới. Rất mong được đón ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng chị.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: buildAboutCopy(midCall, 'chị'),
      newsletter: {
        subtitle: `${hasExplicitName ? callName : 'Em'} hãy để lại đôi dòng lời chúc hoặc hẹn giờ gặp chiều 27/11 trên bảng lưu bút cùng chị Mai nhé.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Em'} có tham dự buổi lễ cùng chị không?`,
        attendingChoice: 'Em sẽ tham dự',
        remoteChoice: 'Em gửi chúc từ xa',
        defaultAuthor: 'Em',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc gửi chị Mai tại đây...',
        errorMessage: 'Vui lòng viết lời chúc trước khi dán lên bảng lưu bút.',
        successMessage: `Tờ note đã được dán lên bảng lưu bút. Chị Mai cảm ơn ${midCall} nhiều nhé.`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `Chào ${midCall}, chiều Thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của chị tại Trường ĐH Công nghệ Thông tin (UIT). Chị gửi thiệp mời này, rất mong ${midCall} sắp xếp thời gian đến chung vui và chụp ảnh kỷ niệm với chị nhé.`,
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
        suffix: 'đến dự buổi lễ tốt nghiệp của em',
      },
      hero: {
        lead: 'Em',
        description: `Bốn năm học tập tại UIT sắp khép lại, mở ra một chặng đường mới. Em rất hân hạnh được đón tiếp ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng em.`,
      },
      countdownPillPrefix: 'Kính mời',
      about: buildAboutCopy(
        midCall,
        'em',
        `Sự hiện diện của ${midCall} là niềm vinh hạnh đối với em. Em xin cảm ơn ${titleWord} đã tận tình dạy bảo em trong suốt thời gian qua.`
      ),
      newsletter: {
        subtitle: `Em kính mời ${midCall} để lại đôi dòng lời nhắn trên bảng lưu bút kỷ niệm ngày tốt nghiệp.`,
        attendanceLabel: `Kính hỏi ${midCall} có tham dự buổi lễ không ạ?`,
        attendingChoice: `${titleWord} sẽ tham dự`,
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: titleWord,
        noteTag: 'Giảng viên UIT',
        placeholderMessage: 'Viết đôi dòng nhắn gửi đến em Mai tại đây...',
        errorMessage: `Kính mời ${midCall} viết đôi dòng lưu bút trước khi dán lên bảng ạ.`,
        successMessage: `Tờ note đã được dán lên bảng lưu bút. Em Mai xin chân thành cảm ơn ${midCall} ạ.`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `Em chào ${midCall}, em là Nguyễn Vũ Xuân Mai (khóa K17 - UIT). Chiều Thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của em tại trường. Em trân trọng kính gửi ${titleWord} thiệp mời này, rất hân hạnh nếu được đón tiếp ${titleWord} đến chung vui và chụp ảnh kỷ niệm cùng em ạ.`,
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
        suffix: 'đến dự buổi lễ tốt nghiệp của con',
      },
      hero: {
        lead: 'Con',
        description: `Bốn năm học tập tại UIT sắp khép lại, mở ra một chặng đường mới. Con rất mong được đón ${midCall} đến dự buổi lễ và chụp ảnh kỷ niệm cùng con.`,
      },
      countdownPillPrefix: 'Con kính mời',
      about: buildAboutCopy(
        midCall,
        'con',
        `Con rất mong ${midCall} đến dự buổi lễ cùng con. Cảm ơn ${midCall} đã luôn đồng hành và ủng hộ con trong suốt thời gian qua.`
      ),
      newsletter: {
        subtitle: `Nếu muốn nhắn nhủ đôi lời cho con trước chặng đường mới, ${midCall} có thể viết lên tờ note này để lưu làm kỷ niệm.`,
        attendanceLabel: `${midCall} có tham dự buổi lễ cùng con không?`,
        attendingChoice: 'Cả nhà sẽ tham dự',
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: 'Bố Mẹ',
        noteTag: 'Gia đình',
        placeholderMessage: 'Viết lời nhắn gửi con tại đây...',
        errorMessage: 'Vui lòng viết lời nhắn trước khi dán lên bảng lưu bút.',
        successMessage: `Con đã nhận được lời nhắn từ ${midCall} trên bảng lưu bút. Con cảm ơn ${midCall} ạ.`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `${midCall} ơi, chiều Thứ Sáu 27/11 (15:00 – 17:00) tới đây là lễ tốt nghiệp của con tại Trường ĐH Công nghệ Thông tin (UIT). Con gửi ${midCall} thiệp mời này, rất mong cả nhà cùng lên trường dự lễ và chụp ảnh kỷ niệm với con ạ.`,
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
        suffix: 'đến chung vui trong buổi lễ tốt nghiệp của cháu',
      },
      hero: {
        lead: 'Cháu',
        description: `Bốn năm học tập tại UIT sắp khép lại, mở ra một chặng đường mới. Cháu rất mong được đón tiếp ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng cháu.`,
      },
      countdownPillPrefix: 'Cháu kính mời',
      about: buildAboutCopy(
        midCall,
        'cháu',
        `Sự hiện diện hoặc lời chúc của ${midCall} là niềm vui và niềm vinh hạnh đối với cháu. Cháu cảm ơn ${midCall} đã luôn quan tâm và đồng hành cùng cháu.`
      ),
      newsletter: {
        subtitle: `Cháu kính mời ${midCall} viết đôi dòng lời chúc lên bảng lưu bút kỷ niệm ngày tốt nghiệp của cháu.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Gia đình'} có tham dự buổi lễ cùng cháu không?`,
        attendingChoice: 'Cả nhà sẽ tham dự',
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: 'Người thân',
        noteTag: 'Gia đình',
        placeholderMessage: 'Viết lời chúc mừng gửi cháu Mai tại đây...',
        errorMessage: 'Vui lòng viết lời chúc trước khi dán lên bảng lưu bút.',
        successMessage: `Tờ note đã được dán lên bảng lưu bút. Cháu Mai xin cảm ơn ${midCall} ạ.`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `Cháu chào ${midCall}, chiều Thứ Sáu 27/11 (15:00 – 17:00) tới đây là lễ tốt nghiệp đại học của cháu tại Trường ĐH Công nghệ Thông tin (UIT). Cháu trân trọng gửi ${midCall} thiệp mời này, rất mong được đón tiếp ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng cháu ạ.`,
    }
  }

  if (presetId === 'ban_than') {
    const midCall = hasExplicitName ? callName : 'bạn'
    return {
      preset: presetMeta,
      isPersonalized,
      rawName,
      callName,
      customNote,
      cover: {
        prefix: 'Thân mời',
        suffix: 'đến chung vui trong buổi lễ tốt nghiệp của Mai',
      },
      hero: {
        lead: 'Mình',
        description: `Bốn năm học tập tại UIT sắp khép lại, mở ra một chặng đường mới. Hẹn ${midCall} chiều 27/11 đến chung vui và chụp ảnh kỷ niệm cùng Mai nhé.`,
      },
      countdownPillPrefix: 'Hẹn gặp',
      about: buildAboutCopy(
        midCall,
        'Mai',
        `Rất mong được gặp ${midCall} tại buổi lễ tốt nghiệp chiều 27/11. Cảm ơn ${midCall} đã luôn đồng hành cùng Mai trong suốt thời gian qua.`
      ),
      newsletter: {
        subtitle: `Để lại vài dòng lời chúc hoặc hẹn giờ gặp tại UIT chiều 27/11 trên bảng lưu bút nhé ${midCall}.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Bạn'} có tham dự buổi lễ cùng Mai không?`,
        attendingChoice: 'Sẽ tham dự',
        remoteChoice: 'Gửi lời chúc từ xa',
        defaultAuthor: 'Bạn thân',
        noteTag: 'Bạn thân',
        placeholderMessage: 'Viết lời chúc hoặc lời hẹn cho Mai tại đây...',
        errorMessage: 'Vui lòng viết vài dòng lời chúc trước khi dán lên bảng nhé.',
        successMessage: `Tờ note đã được dán lên bảng lưu bút. Cảm ơn ${midCall} nhiều nhé!`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `Chào ${midCall}, chiều Thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của Mai tại UIT. Mai gửi ${midCall} thiệp mời này, hẹn ${midCall} qua trường chung vui và chụp ảnh kỷ niệm cùng Mai nhé.`,
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
        suffix: 'đến chung vui trong buổi lễ tốt nghiệp của Mai',
      },
      hero: {
        lead: 'Mình',
        description: `Bốn năm học tập tại UIT sắp khép lại, mở ra một chặng đường mới. Rất mong được đón ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng Mai.`,
      },
      countdownPillPrefix: 'Trân trọng kính mời',
      about: buildAboutCopy(
        midCall,
        'Mai',
        `Sự hiện diện hoặc lời chúc từ phương xa của ${midCall} là niềm vui đối với Mai. Cảm ơn ${midCall} đã luôn đồng hành cùng Mai trong thời gian qua.`
      ),
      newsletter: {
        subtitle: `Hãy để lại đôi dòng lời chúc hoặc lời hẹn chiều 27/11 trên bảng lưu bút kỷ niệm cùng Mai nhé.`,
        attendanceLabel: `${hasExplicitName ? callName : 'Bạn'} có tham dự buổi lễ cùng Mai không?`,
        attendingChoice: 'Mình sẽ tham dự',
        remoteChoice: 'Mình gửi chúc từ xa',
        defaultAuthor: 'Bạn của Mai',
        noteTag: '',
        placeholderMessage: 'Viết lời chúc hoặc kỷ niệm lên tờ note tại đây...',
        errorMessage: 'Vui lòng viết lời chúc trước khi dán lên bảng lưu bút.',
        successMessage: `Tờ note đã được dán lên bảng lưu bút. Cảm ơn lời chúc của ${midCall}.`,
      },
      footer: {
        message: DEFAULT_FOOTER_MESSAGE,
      },
      inviteSms: `${hasExplicitName ? `Chào ${callName}` : 'Chào bạn'}, chiều Thứ Sáu 27/11 (15:00 – 17:00) tới đây là lễ tốt nghiệp của Mai tại Trường ĐH Công nghệ Thông tin (UIT). Mai trân trọng gửi ${midCall} thiệp mời này, rất mong được đón ${midCall} đến chung vui và chụp ảnh kỷ niệm cùng Mai nhé.`,
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
      suffix: 'đến chung vui trong buổi lễ tốt nghiệp',
    },
    hero: {
      lead: 'Mình',
      description:
        'Thanh xuân tại UIT sắp khép lại, mở ra một hành trình mới. Mong được cùng mọi người lưu giữ khoảnh khắc đáng nhớ này.',
    },
    countdownPillPrefix: 'Trân trọng kính mời',
    about: buildAboutCopy(hasExplicitName ? callName : 'bạn', 'Mai'),
    newsletter: {
      subtitle:
        'Hãy để lại đôi dòng lời chúc hoặc xác nhận tham dự chiều 27/11 trên bảng lưu bút kỷ niệm.',
      placeholderName: 'Ví dụ: Cha Eun Woo',
      roleLabel: 'Bạn đến với Mai là',
      attendanceLabel: 'Bạn có tham dự buổi lễ không?',
      attendingChoice: 'Rất vui được tham dự',
      remoteChoice: 'Gửi lời chúc từ xa',
      defaultAuthor: 'Khách mời',
      noteTag: '',
      placeholderMessage: 'Viết lời chúc hoặc kỷ niệm lên tờ note tại đây...',
      errorName: 'Vui lòng nhập họ và tên trước khi gửi lời chúc.',
      errorMessage: 'Vui lòng viết lời chúc trước khi dán lên bảng lưu bút.',
      successMessage: 'Tờ note đã được dán lên bảng lưu bút. Cảm ơn lời chúc của bạn.',
    },
    footer: {
      message: DEFAULT_FOOTER_MESSAGE,
    },
    inviteSms:
      'Chào mọi người, chiều Thứ Sáu 27/11 (15:00 – 17:00) là lễ tốt nghiệp của Nguyễn Vũ Xuân Mai tại Trường ĐH Công nghệ Thông tin (UIT). Mai trân trọng gửi mọi người thiệp mời này, rất mong được đón tiếp mọi người đến chung vui và chụp ảnh kỷ niệm.',
  }
}
