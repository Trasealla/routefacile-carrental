import React from 'react'
import { useTranslation } from 'react-i18next'

const Group = () => {
  const { t } = useTranslation();
  return (
    <>{t("car group")}</>
  )
}

export default Group;
