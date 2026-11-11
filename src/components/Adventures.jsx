import { POSTS } from '../data'
import { MapPinIcon } from './Icons'
import SectionHead from './SectionHead'
import AirplaneOrnament from './AirplaneOrnament'
import HotAirBalloonOrnament from './HotAirBalloonOrnament'

export default function Adventures() {
  return (
    <section className="section adventures" id="adventures" aria-labelledby="adventures-title">
      {/* Khinh khí cầu lơ lửng bồng bềnh và chuyển động theo scroll */}
      <HotAirBalloonOrnament />

      {/* Máy bay và vệt khói hồng lướt ngang qua tiêu đề */}
      <AirplaneOrnament className="adventures__airplane" />

      <div className="container">
        <SectionHead tagline="nhìn lại" title="Dấu Ấn Thanh Xuân" id="adventures-title" className="reveal" />

        <div className="adventures__grid reveal-group">
          {POSTS.map((post, index) => (
            <article className="post-card reveal-item" key={post.slug} style={{ '--stagger': index }}>
              <div className="post-card__media">
                <img src={post.image} alt={post.alt} loading="eager" decoding="async" />
              </div>

              <div className="post-card__body">
                <span className="place-tag post-card__place">
                  <MapPinIcon />
                  {post.location}
                </span>
                <h3 className="post-card__title">{post.title}</h3>
                <p className="post-card__excerpt">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}