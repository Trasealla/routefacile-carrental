import React from 'react'
import { useTranslation } from "react-i18next";

const Cancelledbookings = () => {
  const { t } = useTranslation();
  return (
   <>{t("Cancelledbookings booking")}</>
  )
}

export default Cancelledbookings
