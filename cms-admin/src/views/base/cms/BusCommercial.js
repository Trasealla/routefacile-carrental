import React from 'react'
import { useTranslation } from 'react-i18next'

const BusCommercial = () => {
  const { t } = useTranslation()
  return (
   <>{t('buses and commercial')}</>
  )
}

export default BusCommercial