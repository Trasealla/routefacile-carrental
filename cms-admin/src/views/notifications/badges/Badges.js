import React from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CBadge, CRow } from '@coreui/react'
import { DocsExample } from 'src/components'
import { useTranslation } from 'react-i18next'

const Badges = () => {
  const { t } = useTranslation()
  return (
    <CRow>
      <CCol lg={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Badges')}</strong> <small>{t('Dismissing')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t('Bootstrap badge scale to suit the size of the parent element by using relative font sizing and')} <code>em</code> {t('units.')}
            </p>
            <DocsExample href="components/badge">
              <h1>
                {t('Example heading')} <CBadge color="secondary">{t('New')}</CBadge>
              </h1>
              <h2>
                {t('Example heading')} <CBadge color="secondary">{t('New')}</CBadge>
              </h2>
              <h3>
                {t('Example heading')} <CBadge color="secondary">{t('New')}</CBadge>
              </h3>
              <h4>
                {t('Example heading')} <CBadge color="secondary">{t('New')}</CBadge>
              </h4>
              <h5>
                {t('Example heading')} <CBadge color="secondary">{t('New')}</CBadge>
              </h5>
              <h6>
                {t('Example heading')} <CBadge color="secondary">{t('New')}</CBadge>
              </h6>
            </DocsExample>
            <p className="text-body-secondary small">
              {t('Badges can be used as part of links or buttons to provide a counter.')}
            </p>
            <DocsExample href="components/badge">
              <CButton color="primary">
                {t('Notifications')} <CBadge color="secondary">4</CBadge>
              </CButton>
            </DocsExample>
            <p className="text-body-secondary small">
              {t('Remark that depending on how you use them, badges may be complicated for users of screen readers and related assistive technologies.')}
            </p>
            <p className="text-body-secondary small">
              {t('Unless the context is clear, consider including additional context with a visually hidden piece of additional text.')}
            </p>
            <DocsExample href="components/badge">
              <CButton color="primary">
                {t('Profile')} <CBadge color="secondary">9</CBadge>
                <span className="visually-hidden">{t('unread messages')}</span>
              </CButton>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Badges')}</strong> <small>{t('Contextual variations')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t('Add any of the below-mentioned')} <code>color</code> {t('props to modify the presentation of a badge.')}
            </p>
            <DocsExample href="components/badge#contextual-variations">
              <CBadge color="primary">{t('primary')}</CBadge>
              <CBadge color="success">{t('success')}</CBadge>
              <CBadge color="danger">{t('danger')}</CBadge>
              <CBadge color="warning">{t('warning')}</CBadge>
              <CBadge color="info">{t('info')}</CBadge>
              <CBadge color="light">{t('light')}</CBadge>
              <CBadge color="dark">{t('dark')}</CBadge>
            </DocsExample>
          </CCardBody>
        </CCard>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Badges')}</strong> <small>{t('Pill badges')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t('Apply the')} <code>shape=&#34;rounded-pill&#34;</code> {t('prop to make badges rounded.')}
            </p>
            <DocsExample href="components/badge#pill-badges">
              <CBadge color="primary" shape="rounded-pill">
                {t('primary')}
              </CBadge>
              <CBadge color="success" shape="rounded-pill">
                {t('success')}
              </CBadge>
              <CBadge color="danger" shape="rounded-pill">
                {t('danger')}
              </CBadge>
              <CBadge color="warning" shape="rounded-pill">
                {t('warning')}
              </CBadge>
              <CBadge color="info" shape="rounded-pill">
                {t('info')}
              </CBadge>
              <CBadge color="light" shape="rounded-pill">
                {t('light')}
              </CBadge>
              <CBadge color="dark" shape="rounded-pill">
                {t('dark')}
              </CBadge>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Badges
