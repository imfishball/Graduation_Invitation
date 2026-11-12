import { Fragment, useEffect, useRef, useState } from 'react'
import { HERO } from '../data'
import { useInvitation } from '../invitationContext'
import WaterRipple from './WaterRipple'
import RoseDivider from './RoseDivider'
import { ChevronDownIcon, MapPinIcon } from './Icons'

const HERO_MOTES = [
  { left: '14%', bottom: '18%', size: '10px', dur: '11s', delay: '-1.5s', drift: '18px' },
  { left: '28%', bottom: '12%', size: '7px', dur: '13s', delay: '-4.2s', drift: '-14px' },
  { left: '46%', bottom: '20%', size: '12px', dur: '12s', delay: '-2.8s', drift: '22px' },
  { left: '63%', bottom: '14%', size: '8px', dur: '10.5s', delay: '-6s', drift: '-16px' },
  { left: '82%', bottom: '24%', size: '11px', dur: '14s', delay: '-3.1s', drift: '14px' },
  { left: '22%', bottom: '36%', size: '6px', dur: '12.5s', delay: '-7.2s', drift: '12px' },
  { left: '56%', bottom: '42%', size: '9px', dur: '11.5s', delay: '-5.1s', drift: '-18px' },
  { left: '74%', bottom: '38%', size: '7px', dur: '13.5s', delay: '-8.4s', drift: '16px' },
]

export default function Hero({ entered = true }) {
  const { copy } = useInvitation()
  const heroRef = useRef(null)
  const [isOffscreen, setIsOffscreen] = useState(false)

  useEffect(() => {
    const el = heroRef.current
    if (!el || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        setIsOffscreen(!entry.isIntersecting)
      },
      { rootMargin: '80px 0px', threshold: 0.01 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      className={`hero on-dark ${entered ? 'hero--entered' : 'hero--waiting'}${isOffscreen ? ' hero--offscreen' : ''}`}
      id="top"
      aria-labelledby="hero-title"
    >
      <div className="hero__media">
        <WaterRipple imageSrc="/assets/hero.webp" />
        <img
          src="/assets/hero.webp"
          alt="Tòa nhà Trường Đại học Công nghệ Thông tin (UIT) rạng rỡ dưới bầu trời xanh mây hồng pastel cùng cánh máy bay sải cánh"
          width="2160"
          height="1440"
          fetchpriority="high"
        />
      </div>
      <div className="hero__scrim" />

      <div className="hero__ambient" aria-hidden="true">
        <span className="hero__sunbeam" />
        {HERO_MOTES.map((mote, i) => (
          <span
            key={i}
            className="hero__mote"
            style={{
              '--mote-left': mote.left,
              '--mote-bottom': mote.bottom,
              '--mote-size': mote.size,
              '--mote-dur': mote.dur,
              '--mote-delay': mote.delay,
              '--mote-drift': mote.drift,
            }}
          />
        ))}
      </div>

      <div className="container hero__inner">
        <div className="hero__spacer" />

        <div className="hero__content">
          <p className="hero__script">{HERO.script}</p>

          <h1
            className={`hero__title${copy.hero.isCustomTitle ? ' hero__title--wrap' : ''}`}
            id="hero-title"
          >
            {copy.hero.lead && (
              <>
                <span className="hero__title-lead">{copy.hero.lead}</span>{' '}
              </>
            )}
            <span className="hero__title-rest">{copy.hero.rest || 'tốt nghiệp rồi!'}</span>
          </h1>

          <p className="hero__desc">
            {copy.isPersonalized ? (
              copy.hero.description
            ) : (
              <>
                <span className="text-desktop">{copy.hero.description}</span>
                <span className="text-mobile">
                  Thanh xuân UIT sắp khép lại. Mong được cùng mọi người lưu giữ khoảnh khắc này.
                </span>
              </>
            )}
          </p>

          <div className="hero__actions">
            <a className="pill pill--rose hero__action-btn hero__action-btn--primary" href="#contact">
              <span className="hero-cta-full">{HERO.cta.primary}</span>
              <span className="hero-cta-short">Gửi lời chúc</span>
            </a>
            <a className="pill pill--light hero__action-btn hero__action-btn--secondary" href="#countdown">
              <span className="hero-cta-full">{HERO.cta.secondary}</span>
              <span className="hero-cta-short">{HERO.cta.secondaryShort}</span>
            </a>
          </div>
        </div>

        <div className="hero__bottom">
          <ul className="hero__stats">
            {HERO.stats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 && (
                  <li className="hero__divider" aria-hidden="true">
                    <RoseDivider />
                  </li>
                )}
                <li>
                  <p className="stat__value">{stat.value}</p>
                  <p className="stat__label">
                    <span className="text-desktop">{stat.label}</span>
                    <span className="text-mobile">
                      {index === 0 ? 'Thanh xuân' : index === 1 ? 'Trưởng thành' : 'Biết ơn'}
                    </span>
                  </p>
                </li>
              </Fragment>
            ))}
          </ul>

          <div className="feature">
            <p className="feature__eyebrow">{HERO.feature.eyebrow}</p>
            <article className="post-card post-card--feature">
              <div className="post-card__media">
                <img
                  src="/assets/hero-feature.jpg"
                  alt="Khuôn viên Trường Đại học Công nghệ Thông tin (UIT) qua góc kính lúp nghệ thuật"
                  width="1280"
                  height="805"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="post-card__body">
                <span className="place-tag">
                  <MapPinIcon size={12} />
                  {HERO.feature.location}
                </span>
                <p className="post-card__title">{HERO.feature.title}</p>
              </div>
            </article>
          </div>
        </div>
      </div>

      <a className="hero__scroll-cue" href="#countdown" aria-label="Cuộn xuống xem lịch lễ tốt nghiệp">
        <span className="hero__scroll-cue-text">Cuộn xuống</span>
        <span className="hero__scroll-cue-icon" aria-hidden="true">
          <ChevronDownIcon size={14} />
        </span>
      </a>
    </section>
  )
}