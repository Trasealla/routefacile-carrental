import React from 'react'
import { useTranslation } from 'react-i18next'

const Allbookings = () => {
  const { t } = useTranslation();
  return (
   <>{t('All Bookings')}</>
  )
}

export default Allbookings
