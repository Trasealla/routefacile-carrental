import React from 'react'
import { useTranslation } from 'react-i18next'

const BookNowDis = () => {
  const { t } = useTranslation();
  return (
   <>{t("BookNowDis")}</>
  )
}

export default BookNowDis
