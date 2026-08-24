import React from 'react'
import { useTranslation } from 'react-i18next'

const TermsConditions = () => {
  const { t } = useTranslation();
  return (
    <div>{t("TermsConditions")}</div>
  )
}

export default TermsConditions
