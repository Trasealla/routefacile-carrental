import React from 'react'
import { useTranslation } from 'react-i18next'

const Career = () => {
  const { t } = useTranslation();
  return (
   <>{t("career")}</>
  )
}

export default Career
