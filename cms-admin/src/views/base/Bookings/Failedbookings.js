import React from 'react'
import { useTranslation } from 'react-i18next'

const Failedbookings = () => {
  const { t } = useTranslation()
  return (
   <>{t('Failedbookings booking')}</>
  )
}

export default Failedbookings
