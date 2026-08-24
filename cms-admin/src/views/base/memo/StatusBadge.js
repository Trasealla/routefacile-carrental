import React from "react";
import { useTranslation } from "react-i18next";

/**
 * StatusBadge — used everywhere in the Memo Portal. Maps a status string
 * (draft/published/archived/active/inactive) to the matching memo-badge--*
 * CSS modifier from memo.css.
 */
const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cls = `memo-badge memo-badge--${status}`;
  const label =
    {
      draft: t("Draft"),
      published: t("Published"),
      archived: t("Archived"),
      active: t("Active"),
      inactive: t("Inactive"),
    }[status] || status;
  return <span className={cls}>{label}</span>;
};

export default StatusBadge;
