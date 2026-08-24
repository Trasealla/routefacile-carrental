import React from 'react'
import { useTranslation } from 'react-i18next'

const RangePricing = () => {
  const { t } = useTranslation();
  return (
   <>{t("Range pricing")}</>
  )
}

export default RangePricing
