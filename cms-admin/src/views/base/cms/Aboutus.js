import React from 'react'
import { useTranslation } from 'react-i18next'

const Aboutus = () => {
  const { t } = useTranslation();
  return (
   <>{t('about us')}</>
  )
}

export default Aboutus
