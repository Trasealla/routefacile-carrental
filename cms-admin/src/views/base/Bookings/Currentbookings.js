import React from 'react'
import { useTranslation } from 'react-i18next'

const Currentbookings = () => {
  const { t } = useTranslation()
  return (
   <>{t('Currentbookings booking')}</>
  )
}

export default Currentbookings
