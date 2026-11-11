import { FOOTER } from '../data'
import { useInvitation } from '../invitationContext'

export default function Footer() {
  const { copy } = useInvitation()

  return (
    <footer className="footer" aria-labelledby="footer-thanks-title">
      <div className="ornament footer__deco" aria-hidden="true" />

      <div className="container">
        <div className="footer__thanks reveal">
          <h2 className="footer__thanks-title" id="footer-thanks-title">
            {FOOTER.title}
          </h2>

          <p className="footer__thanks-message">{copy.footer.message}</p>

          <div className="footer__signature">
            <p className="footer__author">{FOOTER.author}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}