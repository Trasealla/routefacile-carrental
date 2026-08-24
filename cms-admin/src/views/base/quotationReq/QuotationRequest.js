import React from 'react'
import { useTranslation } from 'react-i18next'


const QoutationRequest = () => {
    const { t } = useTranslation();

    return (
      <>{t("quotationrequest")}</>
  )
}

export default QoutationRequest;
