import React from 'react'
import { useTranslation } from 'react-i18next'

const AdvanceBooking = () => {
  const { t } = useTranslation();
  return (
   <>{t('Advance booking')}</>
  )
}

export default AdvanceBooking
