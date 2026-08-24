import React from 'react'
import { useTranslation } from "react-i18next";

const CoprporateLeasing = () => {
  const { t } = useTranslation();
  return (
   <>{t("corporate leasing")}</>
  )
}

export default CoprporateLeasing
