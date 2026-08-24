import React from 'react'
import { useTranslation } from 'react-i18next'

const InterCityPricing = () => {
  const { t } = useTranslation();
  return (
  <>{t("intercitypricing")}</>
  )
}

export default InterCityPricing
