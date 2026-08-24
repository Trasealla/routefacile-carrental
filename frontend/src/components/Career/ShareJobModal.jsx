import React, { useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { notifySuccess, notifyError } from '../../SharedComponent/notify';
import whatsIcon from '../../assets/all-images/icons8-whatsapp.svg';

/**
 * Production public site (independent of staging env vars).
 * Admin's REACT_APP_CAREERS_PUBLIC_URL must match this base.
 */
const PUBLIC_SITE = 'https://routefacilecarrental.com';

/**
 * Build the canonical, shareable URL for a job.
 * @param {string} lang   - 'en' | 'ae' | 'ar'
 * @param {string|number} id - job id (or slug)
 * @param {string} channel - utm_source value
 */
export const buildJobShareUrl = (lang, id, channel) => {
  const safeLang = lang || 'en';
  const base = `${PUBLIC_SITE}/${safeLang}/careerspage/${id}`;
  const params = new URLSearchParams({
    utm_source: channel,
    utm_medium: 'share',
    utm_campaign: `job-${id}`,
  });
  return `${base}?${params.toString()}`;
};

const trackShare = (channel, jobId) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag?.('event', 'share', {
        method: channel,
        content_type: 'job',
        item_id: String(jobId),
      });
    }
  } catch (_) {
    /* analytics is best-effort */
  }
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for non-secure contexts
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
};

const ShareJobModal = ({ show, onHide, job, lang }) => {
  const { t } = useTranslation();

  const channels = useMemo(() => {
    if (!job) return null;
    const id = job.id;
    const title = job.title || '';
    const location = job.location || '';
    const yrs = job.experience_years;

    const summary =
      `Check out this job: ${title}` +
      (location ? ` in ${location}` : '') +
      (yrs ? `. Requires ${yrs} years of experience!` : '');

    return {
      id,
      title,
      summary,
      whatsapp:
        'https://api.whatsapp.com/send?text=' +
        encodeURIComponent(`${summary} ${buildJobShareUrl(lang, id, 'whatsapp')}`),
      linkedin:
        'https://www.linkedin.com/sharing/share-offsite/?url=' +
        encodeURIComponent(buildJobShareUrl(lang, id, 'linkedin')),
      facebook:
        'https://www.facebook.com/sharer/sharer.php?u=' +
        encodeURIComponent(buildJobShareUrl(lang, id, 'facebook')) +
        '&quote=' +
        encodeURIComponent(summary),
      x:
        'https://twitter.com/intent/tweet?url=' +
        encodeURIComponent(buildJobShareUrl(lang, id, 'x')) +
        '&text=' +
        encodeURIComponent(summary),
      telegram:
        'https://t.me/share/url?url=' +
        encodeURIComponent(buildJobShareUrl(lang, id, 'telegram')) +
        '&text=' +
        encodeURIComponent(summary),
      email:
        'mailto:?subject=' +
        encodeURIComponent(`Job Opportunity: ${title}`) +
        '&body=' +
        encodeURIComponent(`${summary}\n\n${buildJobShareUrl(lang, id, 'email')}`),
      copyUrl: buildJobShareUrl(lang, id, 'copy_link'),
    };
  }, [job, lang]);

  const handleChannelClick = (channel) => {
    if (!channels) return;
    trackShare(channel, channels.id);
  };

  const handleCopy = async () => {
    if (!channels) return;
    try {
      await copyToClipboard(channels.copyUrl);
      trackShare('copy_link', channels.id);
      notifySuccess(t('Link copied to clipboard'));
    } catch (_) {
      notifyError(t('Could not copy link'));
    }
  };

  const handleNativeShare = async () => {
    if (!channels || !navigator.share) return;
    try {
      await navigator.share({
        title: channels.title,
        text: channels.summary,
        url: buildJobShareUrl(lang, channels.id, 'web_share'),
      });
      trackShare('web_share', channels.id);
    } catch (_) {
      /* user dismissed */
    }
  };

  const supportsWebShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <Modal show={show} onHide={onHide} centered scrollable className="career-share-modal">
      <Modal.Header closeButton>
        <Modal.Title>{t('Share this opportunity')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!channels ? null : (
          <>
            {supportsWebShare && (
              <>
                <button
                  type="button"
                  className="career-share__native-btn"
                  onClick={handleNativeShare}
                  aria-label={t('Share using your device')}
                >
                  <span className="career-share__native-btn__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="22" height="22">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                    </svg>
                  </span>
                  <span className="career-share__native-btn__text">
                    <span className="career-share__native-btn__title">{t('Share via device')}</span>
                    <span className="career-share__native-btn__sub">{t('Use your phone’s share menu')}</span>
                  </span>
                  <svg className="career-share__native-btn__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width="18" height="18" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                  </svg>
                </button>
                <div className="career-share__divider" role="separator">
                  <span>{t('or')}</span>
                </div>
              </>
            )}

            <div className="career-share__grid">
              <a
                href={channels.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="career-share__item career-share__item--whatsapp"
                onClick={() => handleChannelClick('whatsapp')}
              >
                <img src={whatsIcon} alt="WhatsApp" />
                <span>WhatsApp</span>
              </a>

              <a
                href={channels.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="career-share__item career-share__item--linkedin"
                onClick={() => handleChannelClick('linkedin')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0A66C2" width="32" height="32">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href={channels.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="career-share__item career-share__item--facebook"
                onClick={() => handleChannelClick('facebook')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" width="32" height="32">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>

              <a
                href={channels.x}
                target="_blank"
                rel="noopener noreferrer"
                className="career-share__item career-share__item--x"
                onClick={() => handleChannelClick('x')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000" width="28" height="28">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
              </a>

              <a
                href={channels.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="career-share__item career-share__item--telegram"
                onClick={() => handleChannelClick('telegram')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#229ED9" width="32" height="32">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.146.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.658-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.938z" />
                </svg>
                <span>Telegram</span>
              </a>

              <a
                href={channels.email}
                className="career-share__item career-share__item--email"
                onClick={() => handleChannelClick('email')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ea4335" width="32" height="32">
                  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                </svg>
                <span>Email</span>
              </a>

              <button
                type="button"
                className="career-share__item career-share__item--copy"
                onClick={handleCopy}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth={1.6} width="32" height="32">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                <span>{t('Copy link')}</span>
              </button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ShareJobModal;
