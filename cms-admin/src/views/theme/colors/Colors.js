import React, { useEffect, useState, createRef } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
import { rgbToHex } from '@coreui/utils'
import { DocsLink } from '../../../components'

const ThemeView = () => {
  const { t } = useTranslation();
  const [color, setColor] = useState('rgb(255, 255, 255)')
  const ref = createRef()

  useEffect(() => {
    const el = ref.current.parentNode.firstChild
    const varColor = window.getComputedStyle(el).getPropertyValue('background-color')
    setColor(varColor)
  }, [ref])

  return (
    <table className="table w-100" ref={ref}>
      <tbody>
        <tr>
          <td className="text-body-secondary">{t("HEX:")}</td>
          <td className="font-weight-bold">{rgbToHex(color)}</td>
        </tr>
        <tr>
          <td className="text-body-secondary">{t("RGB:")}</td>
          <td className="font-weight-bold">{color}</td>
        </tr>
      </tbody>
    </table>
  )
}

const ThemeColor = ({ className, children }) => {
  const classes = classNames(className, 'theme-color w-75 rounded mb-3')
  return (
    <CCol xs={12} sm={6} md={4} xl={2} className="mb-4">
      <div className={classes} style={{ paddingTop: '75%' }}></div>
      {children}
      <ThemeView />
    </CCol>
  )
}

ThemeColor.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

const Colors = () => {
  const { t } = useTranslation();
  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          {t("Theme colors")}
          <DocsLink href="https://coreui.io/docs/utilities/colors/" />
        </CCardHeader>
        <CCardBody>
          <CRow>
            <ThemeColor className="bg-primary">
              <h6>{t("Brand Primary Color")}</h6>
            </ThemeColor>
            <ThemeColor className="bg-secondary">
              <h6>{t("Brand Secondary Color")}</h6>
            </ThemeColor>
            <ThemeColor className="bg-success">
              <h6>{t("Brand Success Color")}</h6>
            </ThemeColor>
            <ThemeColor className="bg-danger">
              <h6>{t("Brand Danger Color")}</h6>
            </ThemeColor>
            <ThemeColor className="bg-warning">
              <h6>{t("Brand Warning Color")}</h6>
            </ThemeColor>
            <ThemeColor className="bg-info">
              <h6>{t("Brand Info Color")}</h6>
            </ThemeColor>
            <ThemeColor className="bg-light">
              <h6>{t("Brand Light Color")}</h6>
            </ThemeColor>
            <ThemeColor className="bg-dark">
              <h6>{t("Brand Dark Color")}</h6>
            </ThemeColor>
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Colors
