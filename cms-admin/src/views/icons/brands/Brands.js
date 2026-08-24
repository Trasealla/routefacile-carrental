import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { brandSet } from '@coreui/icons'
import { DocsCallout } from 'src/components'
import { useTranslation } from "react-i18next";

const toKebabCase = (str) => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

export const getIconsView = (iconset) => {
  return Object.entries(iconset).map(([name, value]) => (
    <CCol className="mb-5" xs={6} sm={4} md={3} xl={2} key={name}>
      <CIcon icon={value} size="xxl" />
      <div>{toKebabCase(name)}</div>
    </CCol>
  ))
}

const CoreUIIcons = () => {
  const { t } = useTranslation();
  return (
    <>
      <DocsCallout
        name={t("CoreUI Brand Icons")}
        href="components/chart"
        content={t("CoreUI Brand Icons. CoreUI Icons package is delivered with more than 1500 icons in multiple formats SVG, PNG, and Webfonts. CoreUI Icons are beautifully crafted symbols for common actions and items. You can use them in your digital products for web or mobile app.")}
      />
      <CCard className="mb-4">
        <CCardHeader>{t("Brand Icons")}</CCardHeader>
        <CCardBody>
          <CRow className="text-center">{getIconsView(brandSet)}</CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default CoreUIIcons
