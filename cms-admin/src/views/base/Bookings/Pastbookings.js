import React from 'react'
import { useTranslation } from "react-i18next";

const Pastbookings = () => {
  const { t } = useTranslation();
  return (
   <>{t("Pastbookings booking")}</>
  )
}

export default Pastbookings
