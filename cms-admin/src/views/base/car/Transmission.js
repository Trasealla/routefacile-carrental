import React from 'react'
import { useTranslation } from "react-i18next";

const Transmission = () => {
  const { t } = useTranslation();
  return (
   <>{t("car transmission")}</>
  )
}

export default Transmission;
