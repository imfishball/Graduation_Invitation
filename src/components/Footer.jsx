import { FOOTER } from '../data'
import { useInvitation } from '../invitationContext'

export default function Footer() {
  const { copy } = useInvitation()

  return (
    <footer className="footer" aria-labelledby="footer-thanks-title">
      <div className="ornament footer__deco" aria-hidden="true" />

      <div className="container">
        <div className="footer__thanks reveal-group">
          <h2 className="footer__thanks-title reveal-item" id="footer-thanks-title" style={{ '--stagger': 0 }}>
            {FOOTER.title}
          </h2>

          <p className="footer__thanks-message reveal-item" style={{ '--stagger': 1 }}>
            {copy.footer.message}
          </p>

          <div className="footer__signature reveal-item" style={{ '--stagger': 2 }}>
            <p className="footer__author">{FOOTER.author}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}