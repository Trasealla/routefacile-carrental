import React from 'react'
import { useTranslation } from 'react-i18next'

const Lostandfound = () => {
  const { t } = useTranslation();

  return <>{t("lost and found")}</>
}

export default Lostandfound
