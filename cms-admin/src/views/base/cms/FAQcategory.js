import React from 'react'
import { useTranslation } from 'react-i18next'

const FAQcategory = () => {
  const { t } = useTranslation();
  return (
    <>{t('faq category')}</>
  )
}

export default FAQcategory
