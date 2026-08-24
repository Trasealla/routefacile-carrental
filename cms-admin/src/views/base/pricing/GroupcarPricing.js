import React from 'react'
import { useTranslation } from "react-i18next";

const GroupcarPricing = () => {
  const { t } = useTranslation();
  return (
  <>{t("groupcarpricing")}</>
  )
}

export default GroupcarPricing
