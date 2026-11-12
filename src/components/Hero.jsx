import { Fragment } from 'react'
import { HERO } from '../data'
import { useInvitation } from '../invitationContext'
import WaterRipple from './WaterRipple'
import RoseDivider from './RoseDivider'
import { MapPinIcon } from './Icons'

export default function Hero() {
  const { copy } = useInvitation()

  return (
    <section className="hero on-dark" id="top" aria-labelledby="hero-title">
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
    </section>
  )
}