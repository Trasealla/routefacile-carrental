import React from 'react';
import { useTranslation } from 'react-i18next';
import './LangSwitcher.css';

const LANGS = [
  { code: 'en', label: 'EN', full: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'FR', full: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'AR', full: 'العربية',  flag: '🇲🇦' },
];

const LangSwitcher = () => {
  const { i18n } = useTranslation();
  const current = LANGS.find((l) => l.code === i18n.language) || LANGS[0];

  const switchTo = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="rf-lang-switcher">
      <button className="rf-lang-btn" aria-label="Change language">
        <span className="rf-lang-flag">{current.flag}</span>
        <span className="rf-lang-label">{current.label}</span>
        <svg className="rf-lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <ul className="rf-lang-dropdown" role="menu">
        {LANGS.map((lang) => (
          <li
            key={lang.code}
            className={`rf-lang-option ${i18n.language === lang.code ? 'active' : ''}`}
            onClick={() => switchTo(lang.code)}
            role="menuitem"
          >
            <span className="rf-lang-flag">{lang.flag}</span>
            <span className="rf-lang-full">{lang.full}</span>
            {i18n.language === lang.code && (
              <svg className="rf-lang-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LangSwitcher;
