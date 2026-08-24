import React from "react";

/**
 * Route Facile — Privacy Policy (Morocco).
 *
 * This replaces the CMS-served policy, for the same reason the terms were made
 * static: the `pages` table has only `_en` and `_ar` columns, so a French
 * visitor was served the ENGLISH policy, and the Arabic column still held the
 * previous UAE operator's text naming a different company. A privacy policy is
 * a legal notice — it has to be in the language the customer is reading, and it
 * has to describe the business that actually holds the data.
 *
 * Written against Moroccan law:
 *   • Loi 09-08 — protection of individuals with regard to the processing of
 *     personal data, supervised by the CNDP
 *   • Loi 31-08 — consumer protection
 *   • Loi 52-05 — Code de la route (why offence data is shared with authorities)
 *
 * NOTE FOR THE OPERATOR: this describes what the platform actually does today —
 * the data the booking form collects, the analytics that are installed, and the
 * mail that is sent. If any of those change, this text has to change with them.
 * Have a Moroccan lawyer review before relying on it commercially.
 */
const PrivacyPolicyContent = ({ t }) => (
  <div className="terms-content">
    <h2>{t("Privacy Policy")}</h2>
    <p>
      {t(
        "This policy explains what personal data Route Facile collects when you book or rent a vehicle, why it is collected, how long it is kept and what rights you have over it. Route Facile is a car rental business based in Marrakech, Morocco, and processes personal data under Loi 09-08 on the protection of individuals with regard to the processing of personal data, supervised by the CNDP."
      )}
    </p>

    <h3>{t("1. Who is responsible for your data")}</h3>
    <ul>
      <li>{t("Route Facile Car Rental, Marrakech, Morocco, is the data controller for the information described in this policy.")}</li>
      <li>{t("Questions about this policy, or any request concerning your data, can be sent to info@routefacilecarrental.com.")}</li>
    </ul>

    <h3>{t("2. What we collect")}</h3>
    <ul>
      <li>{t("Booking details: pick-up and drop-off city, branch or address, dates and times, the vehicle selected and any extras.")}</li>
      <li>{t("Contact details: first and last name, email address and telephone number, so the booking can be confirmed and the vehicle delivered.")}</li>
      <li>{t("Identity and driving documents at collection: driving licence, and a passport for visitors or a CIN for residents. These are checked to confirm eligibility to drive.")}</li>
      <li>{t("Technical data: IP address and basic device information recorded when a booking is submitted, kept as a record of the transaction.")}</li>
    </ul>

    <h3>{t("3. Why we use it")}</h3>
    <ul>
      <li>{t("To create, confirm, amend and cancel your booking, and to deliver and collect the vehicle.")}</li>
      <li>{t("To meet legal obligations, including identity and licence checks before handing over a vehicle.")}</li>
      <li>{t("To deal with traffic offences, fines and damage arising during the rental period.")}</li>
      <li>{t("To answer enquiries and provide customer support, including over WhatsApp where you contact us that way.")}</li>
    </ul>

    <h3>{t("4. Payment")}</h3>
    <ul>
      <li>{t("Route Facile does not take card payments through this website. Bookings are made on a pay-later basis and settled at collection, so no card number is entered on or stored by this site.")}</li>
    </ul>

    <h3>{t("5. Who your data is shared with")}</h3>
    <ul>
      <li>{t("The competent Moroccan authorities, where a traffic offence is issued to Route Facile as owner of the vehicle and the driver's details must be provided by law.")}</li>
      <li>{t("Service providers who operate parts of the platform on our behalf, such as email delivery and website hosting, and only to the extent needed to provide that service.")}</li>
      <li>{t("Your personal data is never sold, rented or traded.")}</li>
    </ul>

    <h3>{t("6. Cookies and measurement")}</h3>
    <ul>
      <li>{t("This site uses Google Tag Manager and Google Analytics to understand how visitors use the pages and which bookings are completed. These tools set cookies in your browser.")}</li>
      <li>{t("Measurement data is limited to how the site is used. Your name, telephone number, email address and document numbers are never sent to analytics or advertising tools.")}</li>
      <li>{t("You can block or delete cookies in your browser settings. The booking flow continues to work without them.")}</li>
    </ul>

    <h3>{t("7. How long it is kept")}</h3>
    <ul>
      <li>{t("Booking records are kept for as long as needed to manage the rental and afterwards for the period required by Moroccan accounting and legal obligations.")}</li>
      <li>{t("Identity and licence documents are kept only for as long as necessary for the purposes above and for the legal limitation period, then deleted.")}</li>
    </ul>

    <h3>{t("8. Your rights")}</h3>
    <ul>
      <li>{t("Under Loi 09-08 you have the right to access the personal data held about you, to have inaccurate data corrected, and to object to processing on legitimate grounds.")}</li>
      <li>{t("To exercise any of these rights, write to info@routefacilecarrental.com. We may ask you to confirm your identity before acting on the request.")}</li>
      <li>{t("You also have the right to refer a complaint to the CNDP, the Moroccan national data protection authority.")}</li>
    </ul>

    <h3>{t("9. Security")}</h3>
    <ul>
      <li>{t("The site is served over an encrypted connection, and access to booking records is limited to Route Facile staff who need it to do their work.")}</li>
    </ul>

    <h3>{t("10. Changes to this policy")}</h3>
    <ul>
      <li>{t("This policy may be updated as the service changes. The version published on this page is the one that applies.")}</li>
    </ul>

    <h3>{t("11. Contact")}</h3>
    <ul>
      <li>{t("Email")}: info@routefacilecarrental.com</li>
      <li>{t("Phone / WhatsApp")}: +212 655 585 859</li>
    </ul>
  </div>
);

export default PrivacyPolicyContent;
