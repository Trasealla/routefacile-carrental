import React from 'react'
import { useTranslation } from 'react-i18next'

const FAQs = () => {
  const { t } = useTranslation();
  return (
  <>{t("FAQs")}</>
  )
}

export default FAQs
