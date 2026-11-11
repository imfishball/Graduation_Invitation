import { Fragment } from 'react'
import { COVER } from '../data'
import { useInvitation } from '../invitationContext'
import { MailIcon } from './Icons'

function renderCoverLine(line, callName) {
  if (!callName) return line
  const idx = line.indexOf(callName)
  if (idx === -1) return line
  return (
    <>
      {line.slice(0, idx)}
      <strong>{callName}</strong>
      {line.slice(idx + callName.length)}
    </>
  )
}

export default function CoverCard({ closing = false, onOpen }) {
  const { copy } = useInvitation()

  return (
    <div
      className={`cover-card${closing ? ' is-opening' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cover-card-title"
      data-lenis-prevent
    >
      <div className="cover-card__frame">
        <div className="cover-card__corner cover-card__corner--tl" aria-hidden="true" />
        <div className="cover-card__corner cover-card__corner--br" aria-hidden="true" />

        <div className="cover-card__inner">
          <p className="cover-card__eyebrow">{COVER.eyebrow}</p>

          <div className="cover-card__monogram" aria-hidden="true">
            <span>{COVER.monogram}</span>
          </div>

          <p className="cover-card__script" id="cover-card-title">
            {COVER.script}
          </p>

          <p className="cover-card__name">{COVER.name}</p>
          <p className="cover-card__subtitle">{COVER.subtitle}</p>

          <p className="cover-card__date" aria-label="Ngày 27 tháng 11 năm 2026">
            {COVER.dateParts.map((part, index) => (
              <Fragment key={part}>
                {index > 0 && (
                  <span className="cover-card__date-dot" aria-hidden="true">
                    .
                  </span>
                )}
                <span>{part}</span>
              </Fragment>
            ))}
          </p>

          <div className="cover-card__rule" aria-hidden="true" />

          <p className="cover-card__invite">
            {copy.cover.isCustom && copy.cover.customLines?.length > 0 ? (
              copy.cover.customLines.map((line, i) => (
                <span key={i}>{renderCoverLine(line, copy.callName)}</span>
              ))
            ) : (
              <>
                <span>
                  {copy.cover.prefix} <strong>{copy.callName}</strong>
                </span>
                <span>{copy.cover.suffix}</span>
              </>
            )}
          </p>

          {copy.customNote && (
            <p className="cover-card__note">“{copy.customNote}”</p>
          )}

          <button
            type="button"
            className="pill pill--rose cover-card__btn"
            onClick={onOpen}
          >
            <MailIcon size={16} />
            <span>{COVER.cta}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
