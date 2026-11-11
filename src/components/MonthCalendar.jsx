import { HeartIcon } from './Icons'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// Tháng 11/2026: Ngày 1 rơi vào Chủ Nhật (cột thứ 7), có 30 ngày.
const DAYS = [
  // Hàng 1: 6 ô trống + ngày 1
  null, null, null, null, null, null, 1,
  // Hàng 2: ngày 2 -> 8
  2, 3, 4, 5, 6, 7, 8,
  // Hàng 3: ngày 9 -> 15
  9, 10, 11, 12, 13, 14, 15,
  // Hàng 4: ngày 16 -> 22
  16, 17, 18, 19, 20, 21, 22,
  // Hàng 5: ngày 23 -> 29 (ngày 27 rơi vào Thứ Sáu)
  23, 24, 25, 26, 27, 28, 29,
  // Hàng 6: ngày 30
  30, null, null, null, null, null, null,
]

export default function MonthCalendar() {
  return (
    <div className="mini-calendar" aria-label="Lịch tháng 11 năm 2026">
      <div className="mini-calendar__header">
        <span className="mini-calendar__month">Tháng 11</span>
        <span className="mini-calendar__year">2026</span>
      </div>

      <div className="mini-calendar__grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="mini-calendar__weekday">
            {day}
          </span>
        ))}

        {DAYS.map((day, idx) => {
          if (!day) {
            return <span key={`empty-${idx}`} className="mini-calendar__cell is-empty" aria-hidden="true" />
          }

          const isEventDay = day === 27

          return (
            <span
              key={day}
              className={`mini-calendar__cell${isEventDay ? ' is-event-day' : ''}`}
            >
              {isEventDay ? (
                <span className="mini-calendar__heart-wrap">
                  <svg
                    className="mini-calendar__heart"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M18 31.5C18 31.5 5 22.5 5 13.5C5 8.5 8.8 5 13.5 5C15.8 5 17.5 6.2 18 7C18.5 6.2 20.2 5 22.5 5C27.2 5 31 8.5 31 13.5C31 22.5 18 31.5 18 31.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <strong className="mini-calendar__day-num">{day}</strong>
                </span>
              ) : (
                <span className="mini-calendar__day-num">{day}</span>
              )}
            </span>
          )
        })}
      </div>

      <div className="mini-calendar__caption">
        <HeartIcon size={13} />
        <span>Thứ Sáu, 27.11.2026 — Lễ Tốt Nghiệp UIT</span>
      </div>
    </div>
  )
}
