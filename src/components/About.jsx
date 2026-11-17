import { ABOUT } from '../data'
import { useInvitation } from '../invitationContext'

export default function About() {
  const { copy } = useInvitation()

  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="ornament about__flower-corner ornament--spin" aria-hidden="true" />
      <div className="ornament about__star ornament--spin-reverse" aria-hidden="true" />

      {/* Bức thư nhỏ gửi người thương yêu */}
      <div className="container about__inner">
        <div className="about__photos reveal">
          <figure className="about__frame">
            <img
              className="about__photo"
              src="/assets/about-mai.jpg?v=3"
              alt="Nguyễn Vũ Xuân Mai duyên dáng trong lễ phục cử nhân UIT, đội mũ tốt nghiệp và dải băng tốt nghiệp UIT"
              width="1200"
              height="1283"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="about__caption">It&apos;s me!</figcaption>
          </figure>

          <div className="about__pet">
            <img
              src="/assets/albert.jpg"
              alt="Tòa nhà Trường Đại học Công nghệ Thông tin UIT dưới bầu trời trong xanh cùng cánh máy bay"
              width="760"
              height="760"
              loading="lazy"
              decoding="async"
            />
            <span>UIT :3</span>
          </div>

          <div className="ornament about__paw" aria-hidden="true" />
        </div>

        <div className="about__text reveal-group">
          <p className="about__tagline reveal-item" style={{ '--stagger': 0 }}>
            {ABOUT.script}
          </p>
          <h2 className="about__title reveal-item" id="about-title" style={{ '--stagger': 1 }}>
            {copy.about.title}
          </h2>

          <div className="about__body reveal-item" style={{ '--stagger': 2 }}>
            {copy.about.paragraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            {copy.customNote && (
              <blockquote className="about__personal-note">
                “{copy.customNote}”
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
