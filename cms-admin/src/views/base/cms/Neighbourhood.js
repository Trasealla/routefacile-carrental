import React from 'react'
import { useTranslation } from 'react-i18next'

const Neighbourhood = () => {
  const { t } = useTranslation();
  return (
   <>{t("neighbourhoodwise")}</>
  )
}

export default Neighbourhood
