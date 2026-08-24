import React from 'react'
import { useTranslation } from 'react-i18next'
const Cartype = () => {
  const { t } = useTranslation()
  return <>{t('car type')}</>
}

export default Cartype
