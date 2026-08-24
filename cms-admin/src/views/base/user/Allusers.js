import React from 'react'
import { useTranslation } from 'react-i18next'

const Allusers = () => {
  const { t } = useTranslation()
  return (
    <>{t('all users')}</>
  )
}

export default Allusers
