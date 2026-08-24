import React from 'react'
import { useTranslation } from 'react-i18next'

const Landmarkwise = () => {
  const { t } = useTranslation();
  return (
  <>{t("landmarkwise")}</>
  )
}

export default Landmarkwise
