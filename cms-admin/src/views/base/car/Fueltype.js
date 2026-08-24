import React from 'react'
import { useTranslation } from 'react-i18next'

const Fueltype = () => {
  const { t } = useTranslation();
  return (
 <>{t("car fuel type")}</>
  )
}

export default Fueltype;
