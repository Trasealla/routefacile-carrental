import React from "react";

/**
 * Route Facile — Terms & Conditions (Morocco).
 *
 * This replaces the inherited UAE terms, which referenced the previous
 * operator, Dubai RTA,
 * Salik/DARB tolls, Oman border permits, UAE driving licences and UAE insurance
 * products (CDW/SCDW/PAI). None of that applies to a Moroccan rental and it was
 * being served to Moroccan customers as the binding contract.
 *
 * Written against Moroccan law:
 *   • Dahir des Obligations et des Contrats (DOC) — contract and hire (louage)
 *   • Loi 31-08 — consumer protection measures
 *   • Loi 09-08 / CNDP — personal data protection
 *   • Loi 52-05 — Code de la route (traffic offences, driver requirements)
 *
 * NOTE FOR THE OPERATOR: figures marked below are the values Route Facile
 * confirmed (no deposit) or standard Moroccan practice. Anything a lawyer needs
 * to set is written so it can be changed in one place. Have a Moroccan lawyer
 * review before relying on this commercially.
 *
 * Insurance is deliberately not covered here — Route Facile asked for all
 * insurance representations to be removed until the cover level and excess can
 * be stated accurately.
 */
const TermsConditionContent = ({ t }) => (
  <div className="terms-content">
    <h2>{t("Terms & Conditions")}</h2>
    <p>
      {t(
        "These terms govern the rental of a vehicle from Route Facile, a car rental business operating in Marrakech, Morocco. They are subject to Moroccan law, in particular the Dahir des Obligations et des Contrats. By confirming a booking you accept these terms."
      )}
    </p>

    <h3>{t("1. The Rental Agreement")}</h3>
    <ul>
      <li>{t("The rental contract is formed between Route Facile and the person named on the booking, who must be the main driver.")}</li>
      <li>{t("The vehicle remains the property of Route Facile at all times. The customer receives the right to use it for the agreed period only.")}</li>
      <li>{t("The signed rental agreement handed over at collection, together with these terms, forms the complete contract.")}</li>
    </ul>

    <h3>{t("2. Driver Requirements")}</h3>
    <ul>
      <li>{t("The main driver must be at least 21 years old. Certain premium categories may require a higher minimum age, which is stated before booking.")}</li>
      <li>{t("The driver must hold a licence that has been valid for at least one year.")}</li>
      <li>{t("Moroccan residents must present a valid Moroccan driving licence and national identity card (CIN).")}</li>
      <li>{t("Visitors must present a valid national driving licence, or an International Driving Permit where their licence is not in Latin script, together with a passport.")}</li>
      <li>{t("Only drivers named on the rental agreement may drive the vehicle. Allowing an unnamed person to drive is a breach of contract.")}</li>
    </ul>

    <h3>{t("3. Deposit")}</h3>
    <ul>
      <li>{t("Route Facile does not take a security deposit and does not block funds on the customer's card at collection.")}</li>
      <li>{t("Amounts properly due at the end of the rental — such as fuel not replaced, traffic fines, or costs arising from a breach of these terms — remain payable.")}</li>
    </ul>

    <h3>{t("4. Booking, Payment and Prices")}</h3>
    <ul>
      <li>{t("All prices are quoted in Moroccan dirham (MAD) and are the total for the rental period shown. Any price displayed in another currency is a guide only; the amount charged is in dirham.")}</li>
      <li>{t("No VAT is added to the advertised price.")}</li>
      <li>{t("Payment may be made in cash or by card, as agreed at the time of booking.")}</li>
      <li>{t("The quoted price covers the vehicle for the stated period and mileage. Optional extras and any charges described in these terms are additional.")}</li>
    </ul>

    <h3>{t("5. Cancellation, Amendment and No-Show")}</h3>
    <ul>
      <li>{t("Bookings may be cancelled free of charge up to 48 hours before the scheduled pick-up time.")}</li>
      <li>{t("Cancellations made less than 48 hours before pick-up may incur a charge equal to one rental day.")}</li>
      <li>{t("If the customer does not arrive within 2 hours of the agreed pick-up time and has not contacted Route Facile, the booking may be treated as a no-show and released.")}</li>
      <li>{t("Amendments are subject to availability and to any difference in price for the new dates or vehicle.")}</li>
      <li>{t("Where a rental is ended early, unused full days are refundable only if agreed in writing with Route Facile.")}</li>
    </ul>

    <h3>{t("6. Collection, Delivery and Return")}</h3>
    <ul>
      <li>{t("Route Facile delivers to and collects from addresses and airports in Marrakech, Casablanca, Rabat, Tangier, Agadir and other Moroccan cities on request.")}</li>
      <li>{t("Delivery to airports is arranged at the time of booking. Where a delivery charge applies it is shown before the booking is confirmed.")}</li>
      <li>{t("The customer must inspect the vehicle at handover and note any existing damage on the rental agreement before driving away.")}</li>
      <li>{t("The vehicle must be returned at the agreed time and place, in the same condition, and with the same fuel level.")}</li>
    </ul>

    <h3>{t("7. Late Return")}</h3>
    <ul>
      <li>{t("A grace period of 59 minutes applies after the agreed return time.")}</li>
      <li>{t("Beyond that, each additional period begun is charged at the daily rate for the vehicle.")}</li>
      <li>{t("If the customer wishes to extend, Route Facile must be contacted before the return time. Keeping the vehicle without agreement is a breach of contract.")}</li>
    </ul>

    <h3>{t("8. Fuel")}</h3>
    <ul>
      <li>{t("The vehicle is supplied with a recorded fuel level and must be returned at the same level.")}</li>
      <li>{t("Any shortfall is charged at the pump price of the fuel replaced, plus a refuelling service charge notified before it is applied.")}</li>
      <li>{t("Misfuelling — putting the wrong fuel in the vehicle — is the customer's responsibility, including draining, recovery and any resulting repair.")}</li>
    </ul>

    <h3>{t("9. Use of the Vehicle")}</h3>
    <p>{t("The vehicle must not be:")}</p>
    <ul>
      <li>{t("driven by anyone not named on the rental agreement;")}</li>
      <li>{t("driven under the influence of alcohol, drugs or any substance affecting the ability to drive;")}</li>
      <li>{t("used to carry passengers or goods for hire or reward, or to push or tow another vehicle;")}</li>
      <li>{t("used in any race, rally, test or competition;")}</li>
      <li>{t("driven outside Morocco without the prior written agreement of Route Facile;")}</li>
      <li>{t("driven on unsurfaced roads, tracks or terrain for which the vehicle is not suited;")}</li>
      <li>{t("sub-let, sold, pledged or otherwise dealt with as if it belonged to the customer.")}</li>
    </ul>

    <h3>{t("10. Traffic Offences and Fines")}</h3>
    <ul>
      <li>{t("The customer is responsible for all traffic offences, parking charges and related penalties incurred during the rental period, under the Code de la route (Loi 52-05).")}</li>
      <li>{t("Where a fine is issued to Route Facile as owner, the customer's details will be provided to the authorities as required by law, and the amount recharged to the customer.")}</li>
      <li>{t("An administrative handling charge may be applied for each fine processed. It is notified to the customer before it is charged.")}</li>
    </ul>

    <h3>{t("11. Breakdown, Accident and Theft")}</h3>
    <ul>
      <li>{t("In the event of an accident, theft or attempted theft, the customer must inform the police immediately and obtain an official report (procès-verbal), and must inform Route Facile without delay.")}</li>
      <li>{t("The customer must not admit liability or agree any settlement on behalf of Route Facile.")}</li>
      <li>{t("In the event of a breakdown, the customer must contact Route Facile before arranging any repair or recovery. Repairs arranged without agreement are not reimbursed.")}</li>
      <li>{t("Keys, documents and equipment supplied with the vehicle must be returned. Loss is charged at replacement cost.")}</li>
    </ul>

    <h3>{t("12. Personal Data")}</h3>
    <ul>
      <li>{t("Route Facile processes personal data in accordance with Loi 09-08 on the protection of individuals with regard to the processing of personal data, under the supervision of the CNDP.")}</li>
      <li>{t("Data is collected to manage the booking and rental, to meet legal obligations, and to handle traffic offences. It is not sold.")}</li>
      <li>{t("Identity and licence documents are retained only for as long as necessary for these purposes and for the legal limitation period.")}</li>
      <li>{t("Customers may request access to, correction of, or deletion of their data by writing to info@routefacilecarrental.com.")}</li>
    </ul>

    <h3>{t("13. Liability")}</h3>
    <ul>
      <li>{t("Route Facile is not liable for property left in the vehicle, or for indirect losses such as missed flights or appointments, except where Moroccan law provides otherwise.")}</li>
      <li>{t("Nothing in these terms limits any right the customer has under Loi 31-08 on consumer protection.")}</li>
    </ul>

    <h3>{t("14. Governing Law and Disputes")}</h3>
    <ul>
      <li>{t("These terms are governed by Moroccan law.")}</li>
      <li>{t("The parties will seek to resolve any dispute amicably. Failing agreement, the competent courts of Marrakech have jurisdiction.")}</li>
    </ul>

    <h3>{t("15. Contact")}</h3>
    <p>
      {t("Route Facile — Marrakech, Morocco.")}
      <br />
      {t("Email")}: <a href="mailto:info@routefacilecarrental.com">info@routefacilecarrental.com</a>
      <br />
      {t("Phone / WhatsApp")}: <a href="tel:+212655585859" dir="ltr">+212 655 585 859</a>
    </p>
  </div>
);

export default TermsConditionContent;
