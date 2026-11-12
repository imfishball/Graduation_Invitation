import { useEffect, useState } from 'react'
import { GRADUATION_INFO } from '../data'
import { useInvitation } from '../invitationContext'
import { CalendarIcon, ClockIcon } from './Icons'
import MonthCalendar from './MonthCalendar'

function formatNumber(num) {
  return String(Math.max(0, num)).padStart(2, '0')
}

export default function CountdownTimer() {
  const { copy } = useInvitation()
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

  return (
    <section className="section countdown-section" id="countdown" aria-label="Thời gian và đếm ngược">
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
    </section>
  )
}
