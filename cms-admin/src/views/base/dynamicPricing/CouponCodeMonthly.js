import React from 'react'
import { useTranslation } from "react-i18next";

const CouponCodeMonthly = () => {
  const { t } = useTranslation();
  return (
   <>{t("CouponCodeMonthly")}</>
  )
}

export default CouponCodeMonthly
