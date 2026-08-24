import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import './screeningQuestions.css';

const ALLOWED_FILE_TYPES = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

export const validateScreeningAnswers = (questions, answers, t) => {
  const errors = {};
  for (const q of questions) {
    const a = answers?.[q.id];
    const value = a?.value;
    const file = a?.file;

    if (q.is_required) {
      if (q.question_type === 'file_upload') {
        if (!file) {
          errors[q.id] = t('This question is required');
          continue;
        }
      } else if (isEmpty(value)) {
        errors[q.id] = t('This question is required');
        continue;
      }
    }

    if (isEmpty(value) && q.question_type !== 'file_upload') continue;

    switch (q.question_type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[q.id] = t('Please enter a valid email');
        }
        break;
      case 'phone':
        if (value && !/^[0-9]{4,15}$/.test(String(value).replace(/\s|-/g, ''))) {
          errors[q.id] = t('Please enter a valid phone number');
        }
        break;
      case 'url':
        try { if (value) new URL(value); } catch { errors[q.id] = t('Please enter a valid URL'); }
        break;
      case 'number':
      case 'rating': {
        const num = Number(value);
        if (Number.isNaN(num)) { errors[q.id] = t('Please enter a valid number'); break; }
        if (q.min_value !== null && q.min_value !== undefined && num < Number(q.min_value)) {
          errors[q.id] = t('Minimum value is') + ' ' + q.min_value;
        } else if (q.max_value !== null && q.max_value !== undefined && num > Number(q.max_value)) {
          errors[q.id] = t('Maximum value is') + ' ' + q.max_value;
        }
        break;
      }
      case 'single_choice': {
        const opts = (q.options || []).map((o) => o.value);
        if (value && !opts.includes(value)) errors[q.id] = t('Please select a valid option');
        break;
      }
      case 'multiple_choice': {
        const opts = (q.options || []).map((o) => o.value);
        if (Array.isArray(value) && value.some((v) => !opts.includes(v))) {
          errors[q.id] = t('Please select valid options');
        }
        break;
      }
      case 'file_upload': {
        if (file) {
          const ext = (file.name.split('.').pop() || '').toLowerCase();
          if (!ALLOWED_FILE_TYPES.includes(ext)) {
            errors[q.id] = t('Allowed file types: PDF, DOC, DOCX, JPG, PNG');
          } else if (file.size > MAX_FILE_SIZE) {
            errors[q.id] = t('File must be under 5MB');
          }
        }
        break;
      }
      default:
        break;
    }
  }
  return errors;
};

export const buildScreeningPayload = (questions, answers) => {
  const arr = [];
  const files = {};
  for (const q of questions) {
    const a = answers?.[q.id];
    if (!a) continue;
    if (q.question_type === 'file_upload') {
      if (a.file) {
        arr.push({ questionnaire_id: q.id });
        files[q.id] = a.file;
      }
    } else if (!isEmpty(a.value)) {
      arr.push({ questionnaire_id: q.id, value: a.value });
    }
  }
  return { answersArray: arr, files };
};

const ScreeningQuestions = ({ questions = [], answers = {}, onChange, errors = {}, lang }) => {
  const { t } = useTranslation();
  const language = useSelector((state) => state.language?.language) || lang || 'en';
  const isAr = language === 'ar' || language === 'ar';
  const fileRefs = useRef({});

  const sections = useMemo(() => {
    const sorted = [...questions].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const groups = new Map();
    for (const q of sorted) {
      const key = q.category || '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    }
    return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
  }, [questions]);

  const setAnswer = (q, patch) => {
    const next = { ...(answers[q.id] || {}), ...patch };
    onChange({ ...answers, [q.id]: next });
  };

  const labelOf = (q) => (isAr && q.question_ar ? q.question_ar : q.question_en);
  const helpOf = (q) => (isAr && q.help_text_ar ? q.help_text_ar : q.help_text_en);
  const phOf = (q) => (isAr && q.placeholder_ar ? q.placeholder_ar : q.placeholder_en) || '';
  const optLabel = (o) => (isAr && o.label_ar ? o.label_ar : o.label_en);

  const renderField = (q) => {
    const v = answers[q.id]?.value;
    const f = answers[q.id]?.file;
    const err = errors[q.id];
    const dir = isAr ? 'rtl' : 'ltr';
    const inputId = 'sq_' + q.id;
    const helpId = 'sq_help_' + q.id;
    const errId = 'sq_err_' + q.id;
    const ariaDescribed = [helpOf(q) ? helpId : null, err ? errId : null].filter(Boolean).join(' ') || undefined;
    const baseProps = {
      id: inputId,
      'aria-required': !!q.is_required,
      'aria-invalid': !!err,
      'aria-describedby': ariaDescribed,
      dir,
    };

    switch (q.question_type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            className={'sq-input sq-textarea' + (err ? ' is-invalid' : '')}
            rows={4}
            placeholder={phOf(q)}
            value={v || ''}
            onChange={(e) => setAnswer(q, { value: e.target.value })}
          />
        );
      case 'email':
      case 'phone':
      case 'url':
      case 'text':
        return (
          <input
            {...baseProps}
            type={q.question_type === 'phone' ? 'tel' : q.question_type}
            className={'sq-input' + (err ? ' is-invalid' : '')}
            placeholder={phOf(q)}
            value={v || ''}
            onChange={(e) => setAnswer(q, { value: e.target.value })}
          />
        );
      case 'number':
        return (
          <input
            {...baseProps}
            type="number"
            inputMode="numeric"
            className={'sq-input' + (err ? ' is-invalid' : '')}
            placeholder={phOf(q)}
            min={q.min_value ?? undefined}
            max={q.max_value ?? undefined}
            value={v ?? ''}
            onChange={(e) => setAnswer(q, { value: e.target.value === '' ? '' : Number(e.target.value) })}
          />
        );
      case 'date':
        return (
          <input
            {...baseProps}
            type="date"
            className={'sq-input' + (err ? ' is-invalid' : '')}
            value={v || ''}
            onChange={(e) => setAnswer(q, { value: e.target.value })}
          />
        );
      case 'rating': {
        const min = Number(q.min_value ?? 1);
        const max = Number(q.max_value ?? 5);
        const stars = [];
        for (let i = min; i <= max; i++) stars.push(i);
        return (
          <div className={'sq-rating' + (err ? ' is-invalid' : '')} role="radiogroup" aria-label={labelOf(q)} dir={dir}>
            {stars.map((n) => (
              <button
                key={n}
                type="button"
                className={'sq-rating__star' + (Number(v) >= n ? ' active' : '')}
                aria-checked={Number(v) === n}
                role="radio"
                onClick={() => setAnswer(q, { value: n })}
                title={String(n)}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
        );
      }
      case 'yes_no':
        return (
          <div className={'sq-pillgroup' + (err ? ' is-invalid' : '')} role="radiogroup" aria-label={labelOf(q)} dir={dir}>
            {[
              { value: 'yes', label: t('Yes') },
              { value: 'no', label: t('No') },
            ].map((o) => (
              <label key={o.value} className={'sq-pill' + (v === o.value ? ' active' : '')}>
                <input
                  type="radio"
                  name={'q_' + q.id}
                  value={o.value}
                  checked={v === o.value}
                  onChange={() => setAnswer(q, { value: o.value })}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        );
      case 'single_choice':
        return (
          <div className={'sq-pillgroup sq-pillgroup--wrap' + (err ? ' is-invalid' : '')} role="radiogroup" aria-label={labelOf(q)} dir={dir}>
            {(q.options || []).map((o) => (
              <label key={o.value} className={'sq-pill' + (v === o.value ? ' active' : '')}>
                <input
                  type="radio"
                  name={'q_' + q.id}
                  value={o.value}
                  checked={v === o.value}
                  onChange={() => setAnswer(q, { value: o.value })}
                />
                <span>{optLabel(o)}</span>
              </label>
            ))}
          </div>
        );
      case 'multiple_choice': {
        const arr = Array.isArray(v) ? v : [];
        return (
          <div className={'sq-pillgroup sq-pillgroup--wrap' + (err ? ' is-invalid' : '')} dir={dir}>
            {(q.options || []).map((o) => {
              const checked = arr.includes(o.value);
              return (
                <label key={o.value} className={'sq-pill sq-pill--check' + (checked ? ' active' : '')}>
                  <input
                    type="checkbox"
                    value={o.value}
                    checked={checked}
                    onChange={() => {
                      const next = checked ? arr.filter((x) => x !== o.value) : [...arr, o.value];
                      setAnswer(q, { value: next });
                    }}
                  />
                  <span className="sq-pill__check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  <span>{optLabel(o)}</span>
                </label>
              );
            })}
          </div>
        );
      }
      case 'file_upload':
        return (
          <div>
            <div
              className={'sq-file' + (f ? ' has-file' : '') + (err ? ' is-invalid' : '')}
              onClick={() => fileRefs.current[q.id]?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRefs.current[q.id]?.click(); }}
              dir={dir}
            >
              {f ? (
                <div className="sq-file__name">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{f.name}</span>
                  <button
                    type="button"
                    className="sq-file__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnswer(q, { file: null });
                      if (fileRefs.current[q.id]) fileRefs.current[q.id].value = '';
                    }}
                  >
                    {t('Remove')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="sq-file__icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div>
                    <strong>{t('Click to upload')}</strong>
                    <div className="sq-file__hint">PDF, DOC, DOCX, JPG, PNG — {t('Max')} 5MB</div>
                  </div>
                </>
              )}
            </div>
            <input
              ref={(el) => { fileRefs.current[q.id] = el; }}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => setAnswer(q, { file: e.target.files?.[0] || null })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (!questions.length) return null;

  return (
    <div className="sq-wrap" dir={isAr ? 'rtl' : 'ltr'}>
      {sections.map((sec, sIdx) => (
        <section key={sec.category || 'sec_' + sIdx} className="sq-section">
          {sec.category ? (
            <header className="sq-section__header">
              <span className="sq-section__dot" />
              <h6 className="sq-section__title">{sec.category}</h6>
            </header>
          ) : null}
          <div className="sq-section__body">
            {sec.items.map((q, idx) => {
              const err = errors[q.id];
              const help = helpOf(q);
              return (
                <fieldset key={q.id} className={'sq-field' + (err ? ' has-error' : '')} id={'sq_field_' + q.id}>
                  <legend className="sq-field__legend">
                    <span className="sq-field__index">{idx + 1}</span>
                    <span className="sq-field__label">
                      {labelOf(q)}
                      {q.is_required ? <span className="sq-field__req" aria-hidden="true">*</span> : null}
                    </span>
                  </legend>
                  <div className="sq-field__control">{renderField(q)}</div>
                  {help ? <div id={'sq_help_' + q.id} className="sq-field__help">{help}</div> : null}
                  {err ? <div id={'sq_err_' + q.id} className="sq-field__error">{err}</div> : null}
                </fieldset>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ScreeningQuestions;
