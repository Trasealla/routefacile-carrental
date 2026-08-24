import React from 'react'
import { useTranslation } from 'react-i18next'

const Inactiveuser = () => {
  const { t } = useTranslation();
  return (
   <>{t("inactive users")}</>
  )
}

export default Inactiveuser
