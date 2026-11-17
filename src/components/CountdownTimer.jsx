import { useEffect, useState } from 'react'
import { GRADUATION_INFO } from '../data'
import { useInvitation } from '../invitationContext'
import {
  BusIcon,
  CalendarIcon,
  CarIcon,
  ClockIcon,
  DirectionsIcon,
  EyeIcon,
  GraduationCapIcon,
  MapPinIcon,
  XIcon,
} from './Icons'
import MonthCalendar from './MonthCalendar'

function formatNumber(num) {
  return String(Math.max(0, num)).padStart(2, '0')
}

export default function CountdownTimer() {
  const { copy } = useInvitation()
  const [showMapModal, setShowMapModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  })

  useEffect(() => {
    const target = new Date(GRADUATION_INFO.dateISO).getTime()

    const calculateTime = () => {
      const now = new Date().getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds, isOver: false })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!showMapModal) return undefined

    document.body.classList.add('is-locked')
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowMapModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('is-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMapModal])

  return (
    <section
      className="section countdown-section"
      id="countdown"
      aria-label="Thời gian và địa điểm buổi lễ"
    >
      {/* 1. Save the Date & Bộ đếm ngược */}
      <div className="container">
        <div className="section-head reveal-group">
          {copy.isPersonalized && (
            <div className="section-head__guest-pill reveal-item" style={{ '--stagger': 0 }}>
              <span>{copy.countdownPillPrefix}</span>
              <span className="guest-pill__dot" aria-hidden="true">•</span>
              <strong>{copy.callName}</strong>
            </div>
          )}
          <p className="section-head__tagline reveal-item" style={{ '--stagger': 0 }}>save the date</p>
          <h2 className="section-head__title reveal-item" style={{ '--stagger': 1 }}>Thời Gian Buổi Lễ</h2>
        </div>

        <div className="countdown-open reveal-group">
          {/* Cột 1: Lịch tháng 11 với ngày 27 viền trái tim */}
          <div className="countdown-open__calendar reveal-item" style={{ '--stagger': 0 }}>
            <MonthCalendar />
          </div>

          <div className="countdown-open__divider reveal-item" style={{ '--stagger': 1 }} aria-hidden="true" />

          {/* Cột 2: Bộ đếm ngược thời gian thực */}
          <div className="countdown-open__timer">
            <div className="countdown-card__meta reveal-item" style={{ '--stagger': 1 }}>
              <span className="countdown-meta-item">
                <CalendarIcon size={15} />
                {GRADUATION_INFO.date}
              </span>
              <span className="countdown-meta-divider" aria-hidden="true">•</span>
              <span className="countdown-meta-item">
                <ClockIcon size={15} />
                {GRADUATION_INFO.time}
              </span>
            </div>

            <div className="countdown-grid reveal-item" style={{ '--stagger': 2 }} role="timer" aria-live="off">
              <div className="countdown-box">
                <div className="countdown-box__num">{formatNumber(timeLeft.days)}</div>
                <div className="countdown-box__unit">Ngày</div>
              </div>
              <div className="countdown-colon" aria-hidden="true">:</div>

              <div className="countdown-box">
                <div className="countdown-box__num">{formatNumber(timeLeft.hours)}</div>
                <div className="countdown-box__unit">Giờ</div>
              </div>
              <div className="countdown-colon" aria-hidden="true">:</div>

              <div className="countdown-box">
                <div className="countdown-box__num">{formatNumber(timeLeft.minutes)}</div>
                <div className="countdown-box__unit">Phút</div>
              </div>
              <div className="countdown-colon" aria-hidden="true">:</div>

              <div className="countdown-box countdown-box--accent">
                <div className="countdown-box__num">{formatNumber(timeLeft.seconds)}</div>
                <div className="countdown-box__unit">Giây</div>
              </div>
            </div>

            <p className="countdown-open__venue reveal-item" style={{ '--stagger': 3 }}>
              <span className="text-desktop">
                Địa điểm: <strong>{GRADUATION_INFO.venue}</strong>
              </span>
              <span className="text-mobile">
                <strong>UIT • ĐHQG-HCM</strong>, Thủ Đức
              </span>
            </p>
            <p className="countdown-open__note reveal-item" style={{ '--stagger': 4 }}>
              <span className="text-desktop">
                Đón khách &amp; chụp ảnh kỷ niệm: <strong>15:00 – 17:00</strong>
              </span>
              <span className="text-mobile">
                Đón khách &amp; chụp ảnh: <strong>15:00 – 17:00</strong>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Điểm Đến Buổi Lễ & Hướng Dẫn Di Chuyển */}
      <div className="container ceremony-wrap" id="ceremony">
        <div className="ceremony-venue reveal-group" id="campus-map">
          <div className="ceremony-venue__grid">
            {/* Cột trái: Thông tin địa điểm UIT, Lối đi, Phương tiện & CTAs */}
            <div className="venue-info">
              <div className="venue-info__header reveal-item" style={{ '--stagger': 0 }}>
                <p className="venue-info__eyebrow">điểm đến buổi lễ</p>
                <h3 className="venue-info__hall">{GRADUATION_INFO.hall}</h3>
                <p className="venue-info__univ">{GRADUATION_INFO.university}</p>
                <p className="venue-info__address">
                  <MapPinIcon size={16} />
                  <span>{GRADUATION_INFO.address}</span>
                </p>
              </div>

              {/* Lối vào & Gửi xe tinh gọn */}
              <div className="venue-guide reveal-item" style={{ '--stagger': 1 }}>
                <div className="venue-guide__item">
                  <span className="venue-guide__dot" />
                  <div className="venue-guide__content">
                    <strong>Lối vào chính</strong>
                    <span>
                      <span className="text-desktop">Cổng 1 (đường Hàn Thuyên) mở cho mọi phương tiện</span>
                      <span className="text-mobile">Cổng 1 (Hàn Thuyên) — mọi phương tiện</span>
                    </span>
                  </div>
                </div>
                <div className="venue-guide__item">
                  <span className="venue-guide__dot" />
                  <div className="venue-guide__content">
                    <strong>Bãi giữ xe máy</strong>
                    <span>
                      <span className="text-desktop">Khu vực giữ xe cạnh Tòa A</span>
                      <span className="text-mobile">Khu vực cạnh Tòa A</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Gợi ý phương tiện tinh gọn */}
              <div className="venue-transit reveal-item" style={{ '--stagger': 2 }}>
                <div className="venue-transit__item">
                  <CarIcon size={15} />
                  <span><strong>Grab / Taxi:</strong> Ghim Cổng chính UIT</span>
                </div>
                <div className="venue-transit__item">
                  <BusIcon size={15} />
                  <span><strong>Xe buýt:</strong> Tuyến 08, 10, 19, 52, ...</span>
                </div>
              </div>

              {/* Hàng nút hành động chuẩn design system */}
              <div className="venue-actions reveal-item" style={{ '--stagger': 3 }}>
                <a
                  className="pill pill--rose"
                  href={GRADUATION_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Mở Google Maps chỉ đường đến Trường Đại học Công nghệ Thông tin (UIT)"
                >
                  <DirectionsIcon size={15} />
                  <span className="text-desktop">Chỉ đường Google Maps</span>
                  <span className="text-mobile">Chỉ đường</span>
                </a>
                <a
                  className="pill pill--light"
                  href={GRADUATION_INFO.googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Thêm sự kiện Lễ Tốt Nghiệp vào Google Calendar"
                >
                  <CalendarIcon size={15} />
                  <span className="text-desktop">Lưu vào Lịch</span>
                  <span className="text-mobile">Lưu lịch</span>
                </a>
              </div>
            </div>

            {/* Cột phải: Visual Map & Legend */}
            <div className="venue-map-card reveal-item" style={{ '--stagger': 2 }}>
              <div
                className="campus-map-interactive"
                onClick={() => setShowMapModal(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setShowMapModal(true)
                  }
                }}
                aria-label="Nhấn để phóng to toàn màn hình sơ đồ trường UIT"
              >
                <img
                  src="/assets/map-uit-pastel.webp"
                  alt="Sơ đồ khuôn viên Trường Đại học Công nghệ Thông tin (UIT)"
                  className="campus-map-interactive__img"
                  width="2045"
                  height="2048"
                  loading="eager"
                />

                {/* Hotspot 1: Khuôn viên UIT / Điểm hẹn */}
                <div className="map-hotspot hotspot--uit" style={{ top: '74%', left: '47%' }}>
                  <div className="hotspot-pin hotspot-pin--rose">
                    <GraduationCapIcon size={14} />
                    <span>Điểm hẹn UIT</span>
                  </div>
                </div>

                {/* Hotspot 2: Cổng 1 */}
                <div className="map-hotspot hotspot--gate" style={{ top: '88%', left: '72%' }}>
                  <div className="hotspot-pin hotspot-pin--gate">
                    <span>Cổng 1</span>
                  </div>
                </div>

                {/* Hotspot 3: Bãi đỗ xe */}
                <div className="map-hotspot hotspot--parking" style={{ top: '86.5%', left: '24%' }}>
                  <div className="hotspot-pin hotspot-pin--parking">
                    <span>Bãi xe Tòa A</span>
                  </div>
                </div>

                {/* Dotted Route */}
                <svg className="map-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d="M 66 90 L 66 74 L 54 74"
                    fill="none"
                    stroke="#D68B96"
                    strokeWidth="1.8"
                    strokeDasharray="2.5 2.5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="campus-map-interactive__badge">
                  <span className="map-zoom-pill">
                    <EyeIcon size={13} /> Phóng to
                  </span>
                </div>
              </div>

              {/* Minimalist Legend */}
              <div className="campus-legend">
                <span className="campus-legend__item">
                  <span className="legend-dot legend-dot--rose" /> Điểm hẹn UIT
                </span>
                <span className="campus-legend__item">
                  <span className="legend-dot legend-dot--gate" /> Cổng 1 lối vào
                </span>
                <span className="campus-legend__item">
                  <span className="legend-dot legend-dot--parking" /> Bãi xe Tòa A
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal phóng to sơ đồ toàn màn hình */}
      {showMapModal && (
        <div
          className="map-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Sơ đồ chi tiết khuôn viên UIT"
          onClick={() => setShowMapModal(false)}
        >
          <div className="map-modal__backdrop" />
          <div
            className="map-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="map-modal__head">
              <div className="map-modal__titles">
                <span className="map-modal__badge">
                  <MapPinIcon size={14} /> Trường ĐH Công nghệ Thông tin — ĐHQG-HCM
                </span>
                <h3 className="map-modal__title">Sơ Đồ Khuôn Viên Trường ĐH CNTT (UIT)</h3>
              </div>
              <button
                type="button"
                className="map-modal__close"
                onClick={() => setShowMapModal(false)}
                aria-label="Đóng sơ đồ"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="map-modal__body">
              <img
                src="/assets/map-uit-pastel.webp"
                alt="Sơ đồ chi tiết khuôn viên UIT"
                className="map-modal__img"
              />
            </div>

            <div className="map-modal__foot">
              <p className="map-modal__note">
                <strong>Gợi ý di chuyển:</strong> Từ Cổng 1 (đường Hàn Thuyên) đi thẳng vào khuôn viên trung tâm quanh Tòa A để gặp Mai (15:00 – 17:00). Bãi giữ xe máy nằm ngay cạnh Tòa A.
              </p>
              <a
                className="pill pill--rose"
                href={GRADUATION_INFO.googleMapsUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <DirectionsIcon size={16} />
                <span>Mở Google Maps chỉ đường</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
