import React from 'react'
import { useTranslation } from 'react-i18next'

const Upcomingbookings = () => {
  const { t } = useTranslation()
  return (
   <>{t('Upcomingbookings booking')}</>
  )
}

export default Upcomingbookings
