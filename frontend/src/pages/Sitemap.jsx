import React, { useContext, useEffect, useState } from "react";

import MetaHelmet from "../components/Helmet/MetaHelmet";
import CommonSection from "../components/UI/CommonSection";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const Sitemap = () => {
const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);

  return (
    <>
      <CommonSection title="Sitemap" />
      <MetaHelmet
        title="Sitemap"
        description="Browse all pages on the Route Facile website. Find car rentals, offers, locations, blogs, and more."
        canonicalUrl={`/${language}/sitemap`}
      />
      <ul style={{ marginLeft: '20px' }}>
        <li>
          <a href="/">{t("Home")}</a>
        </li>
        <li>
          <a href="/en/offerspage">{t("Special Offers")}</a>
        </li>
        <li>
        </li>
        <li>
        </li>
        <li>
        </li>
        <li><a href="#">{t("Company")}</a></li>
        <ul>
          <li>
            <a href="/en/about">{t("About Us")}</a>
          </li>
          <li>
            <a href="/en/our-services">{t("Our Services")}</a>
          </li>
          <li>
            <a href="/en/location">{t("Our Locations")}</a>
          </li>
          <li>
            <a href="/en/ourfleetlist">{t("Our Fleet")}</a>
          </li>
          <li>
          </li>
          <li>
            <a href="/en/login">{t("Login")} / {t("My Account")}</a>
          </li>
        </ul>
        <li><a href="#">{t("Leasing Solutions")}</a></li>
        <ul>
          <li>
            <a href="/en/contact">{t("Request a Quote")}</a>
          </li>
          <li>
          </li>
        </ul>
        <li><a href="#">{t("Insights & Updates")}</a></li>
        <ul>
          <li>
            <a href="/en/blogs">{t("All Blogs")}</a>
          </li>
          <li>
            <a href="/en/discover-morocco">{t("Discover Morocco")}</a>
          </li>
          <li>
            <a href="/">{t("News & Eventscoming soon")}</a>
          </li>
          <li>
            <a href="/en/otherblog">{t("Other Articles")}</a>
          </li>
        </ul>
        <li><a href="#">{t("Support")}</a></li>
        <ul>
          <li>
            <a href="/en/faq">{t("FAQs")}</a>
          </li>
          <li>
          </li>
          <li>
            <a href="/en/contact">{t("Contact Us")}</a>
          </li>
          <li>
            <a href="/en/customer-feedback">{t("Customer Feedback")}</a>
          </li>
          <li>
            <a href="/en/termscondition">{t("Terms & Conditions")}</a>
          </li>
          <li>
            <a href="/en/privacypolicy">{t("Privacy Policy")}</a>
          </li>
        </ul>
      </ul>
    </>
  );
};

export default Sitemap;
