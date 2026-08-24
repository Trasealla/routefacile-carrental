import React, { useRef, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CToast,
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
} from '@coreui/react'
import { DocsExample } from 'src/components'
import { useTranslation } from 'react-i18next'

const ExampleToast = ({ t }) => {
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const exampleToast = (
    <CToast title={t('CoreUI for React.js')}>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <strong className="me-auto">{t('CoreUI for React.js')}</strong>
        <small>{t('7 min ago')}</small>
      </CToastHeader>
      <CToastBody>{t('Hello, world! This is a toast message.')}</CToastBody>
    </CToast>
  )
  return (
    <>
      <CButton color="primary" onClick={() => addToast(exampleToast)}>
        {t('Send a toast')}
      </CButton>
      <CToaster ref={toaster} push={toast} placement="top-end" />
    </>
  )
}

const Toasts = () => {
  const { t } = useTranslation()
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Toast')}</strong> <small>{t('Basic')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t('Toasts are as flexible as you need and have very little required markup. At a minimum, we require a single element to contain your “toasted” content and strongly encourage a dismiss button.')}
            </p>
            <DocsExample href="components/toast">
              <CToast autohide={false} visible={true}>
                <CToastHeader closeButton>
                  <svg
                    className="rounded me-2"
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    focusable="false"
                    role="img"
                  >
                    <rect width="100%" height="100%" fill="#007aff"></rect>
                  </svg>
                  <strong className="me-auto">{t('CoreUI for React.js')}</strong>
                  <small>{t('7 min ago')}</small>
                </CToastHeader>
                <CToastBody>{t('Hello, world! This is a toast message.')}</CToastBody>
              </CToast>
            </DocsExample>
            <DocsExample href="components/toast">{ExampleToast({ t })}</DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Toast')}</strong> <small>{t('Translucent')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t("Toasts are slightly translucent to blend in with what's below them.")}
            </p>
            <DocsExample href="components/toast#translucent" tabContentClassName="bg-dark">
              <CToast autohide={false} visible={true}>
                <CToastHeader closeButton>
                  <svg
                    className="rounded me-2"
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    focusable="false"
                    role="img"
                  >
                    <rect width="100%" height="100%" fill="#007aff"></rect>
                  </svg>
                  <strong className="me-auto">{t('CoreUI for React.js')}</strong>
                  <small>{t('7 min ago')}</small>
                </CToastHeader>
                <CToastBody>{t('Hello, world! This is a toast message.')}</CToastBody>
              </CToast>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Toast')}</strong> <small>{t('Stacking')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t('You can stack toasts by wrapping them in a toast container, which will vertically add some spacing.')}
            </p>
            <DocsExample href="components/toast#stacking">
              <CToaster className="position-static">
                <CToast autohide={false} visible={true}>
                  <CToastHeader closeButton>
                    <svg
                      className="rounded me-2"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMidYMid slice"
                      focusable="false"
                      role="img"
                    >
                      <rect width="100%" height="100%" fill="#007aff"></rect>
                    </svg>
                    <strong className="me-auto">{t('CoreUI for React.js')}</strong>
                    <small>{t('7 min ago')}</small>
                  </CToastHeader>
                  <CToastBody>{t('Hello, world! This is a toast message.')}</CToastBody>
                </CToast>
                <CToast autohide={false} visible={true}>
                  <CToastHeader closeButton>
                    <svg
                      className="rounded me-2"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMidYMid slice"
                      focusable="false"
                      role="img"
                    >
                      <rect width="100%" height="100%" fill="#007aff"></rect>
                    </svg>
                    <strong className="me-auto">{t('CoreUI for React.js')}</strong>
                    <small>{t('7 min ago')}</small>
                  </CToastHeader>
                  <CToastBody>{t('Hello, world! This is a toast message.')}</CToastBody>
                </CToast>
              </CToaster>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Toast')}</strong> <small>{t('Custom content')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t('Customize your toasts by removing sub-components, tweaking them with')}{' '}
              <a href="https://coreui.io/docs/utilities/api">{t('utilities')}</a>{t(', or by adding your own markup. Here we\'ve created a simpler toast by removing the default')}{' '}
              <code>&lt;CToastHeader&gt;</code>{t(', adding a custom hide icon from')}{' '}
              <a href="https://coreui.io/icons/">{t('CoreUI Icons')}</a>{t(', and using some')}{' '}
              <a href="https://coreui.io/docs/utilities/flex">{t('flexbox utilities')}</a> {t('to adjust the layout.')}
            </p>
            <DocsExample href="components/toast#custom-content">
              <CToast autohide={false} className="align-items-center" visible={true}>
                <div className="d-flex">
                  <CToastBody>{t('Hello, world! This is a toast message.')}</CToastBody>
                  <CToastClose className="me-2 m-auto" />
                </div>
              </CToast>
            </DocsExample>
            <p className="text-body-secondary small">
              {t('Alternatively, you can also add additional controls and components to toasts.')}
            </p>
            <DocsExample href="components/toast#custom-content">
              <CToast autohide={false} visible={true}>
                <CToastBody>
                  {t('Hello, world! This is a toast message.')}
                  <div className="mt-2 pt-2 border-top">
                    <CButton type="button" color="primary" size="sm">
                      {t('Take action')}
                    </CButton>
                    <CToastClose as={CButton} color="secondary" size="sm" className="ms-1">
                      {t('Close')}
                    </CToastClose>
                  </div>
                </CToastBody>
              </CToast>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('React Toast')}</strong> <small>{t('Custom content')}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {t('Building on the above example, you can create different toast color schemes with our')}{' '}
              <a href="https://coreui.io/docs/utilities/colors">{t('color')}</a> {t('and')}{' '}
              <a href="https://coreui.io/docs/utilities/background">{t('background')}</a> {t("utilities. Here we've set")} <code>color=&#34;primary&#34;</code> {t('and added')} <code>.text-white</code>{' '}
              {t('class to the')} <code>&lt;Ctoast&gt;</code>{t(', and then set')} <code>white</code> {t('property to our close button. For a crisp edge, we remove the default border with')}{' '}
              <code>.border-0</code>.
            </p>
            <DocsExample href="components/toast#color-schemes">
              <CToast
                autohide={false}
                color="primary"
                className="text-white align-items-center"
                visible={true}
              >
                <div className="d-flex">
                  <CToastBody>{t('Hello, world! This is a toast message.')}</CToastBody>
                  <CToastClose className="me-2 m-auto" white />
                </div>
              </CToast>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Toasts
