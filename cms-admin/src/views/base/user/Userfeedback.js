import React from 'react'
import { useTranslation } from 'react-i18next'

const Userfeedback = () => {
  const { t } = useTranslation();
  return (
   <>{t('user feedback')}</>
  )
}

export default Userfeedback
