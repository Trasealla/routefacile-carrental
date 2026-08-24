import React, { useEffect, useState } from 'react';
import { Col, Container, Spinner } from 'react-bootstrap';
import CommonSection from './CommonSection';
import "../../styles/contact.css"
import configWeb from '../../config.js/configWeb';
import { simpleGetCall, getApiLang } from '../../config.js/SetUp';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import carlogo from "../../assets/new-logo/Car Rental Platform Logos/logo-1009_191.png";
import FindCarForm2 from './FindCarForm2';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import MetaHelmet from '../Helmet/MetaHelmet';
const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const [privacyPolicy, setPrivacyPolicy] =useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [loading, setLoading]= useState(true);
useEffect(()=>{
  window.scroll(0,0);
},[])
  const getPrivacyPolicy = () => {
    const url = `${configWeb.GET_PRIVACY_POLICY('privacy_policy')}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setPrivacyPolicy(res || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(()=>{
getPrivacyPolicy()
  },[language]);


  const citiesData = () => {
    const url = `${configWeb.GET_CITIES}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        setCitiesArray(res);
      })
      .catch((errr) => {
        console.log("errr", errr);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  useEffect(()=>{
    citiesData();
  },[language])


  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: privacyPolicy?.title,
      description: privacyPolicy?.seo_meta_description,
      image: privacyPolicy?.image,
      author: {
        "@type": "Organization",
        name: "Route Facile",
      },
      publisher: {
        "@type": "Organization",
        name: "Route Facile",
        logo: {
          "@type": "ImageObject",
          url: carlogo,
        },
      },
      datePublished: "2024-10-11",
      dateModified: "2024-10-12",
    };
  };
    return (
     <>
     {loading ?  <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        >
        
          <Spinner />
        </div> : 
      
        <div>
           <MetaHelmet
        title={privacyPolicy?.title}
        description={privacyPolicy?.seo_description}
        keywords={privacyPolicy?.seo_meta_tags || "car rental, affordable cars, rent a car"}
        ogTitle={privacyPolicy?.title}
        ogDescription={privacyPolicy?.seo_meta_description}
        ogImage={privacyPolicy?.image}
        ogUrl= {window.location.href}
        twitterTitle={privacyPolicy?.title}
        twitterDescription={privacyPolicy?.seo_meta_description}
        twitterImage={privacyPolicy?.image}
        twitterCard="summary_large_image"
        // twitterSite="@YourTwitterHandle"
        // twitterCreator="@AuthorTwitterHandle"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/privacypolicy`}
      />
       <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateStructuredData()),
            }}
          />
           {/* <section className="pb-1 form-section" >
        <h1
          className="pt-2 m-0 text-center text-light booking__tital-dream"
          style={{ fontFamily: "Rubik" }}
        >
          {t("BOOK YOUR DREAM CAR NOW")}!
        </h1>
        <Col id="booking-form-container" lg="12" md="12" sm="12">
          <Container>
            <FindCarForm2 citiesArray={citiesArray} />
          </Container>
        </Col>
      </section> */}
        <CommonSection title="PRIVACY POLICY" />
        <section className="p-2">
          <Container>
        <div className="inner_section_main">
        <div className="blog_section padding-70 privacy_policy_section">
          {/* <div className="container">
            <p>
              <span >
                <span >
                  <strong>Consent</strong>
                  <br />
                  You hereby consent to our Privacy Policy and agree to its terms by
                  using our website.
                </span>
              </span>
            </p>
            <p>
              <span >
                <span >
                  This Application collects some Personal Data from its Users.
                </span>
              </span>
            </p>
            <p>
              <span >
                <span >
                  <strong>Data Controller and Owner</strong>
                  <br />
                  Route Facile Car Rental, Marrakech, Morocco,
                  <a href="mailto:info@routefacilecarrental.com">info@routefacilecarrental.com</a>
                </span>
              </span>
            </p>
            <p>
              <span >
                <span >
                  <strong>Types of Data collected&nbsp;</strong>
                </span>
              </span>
            </p>
            <ul>
              <li>
                <span >
                  <span >
                    Among the types of Personal Data that this Application collects,
                    by itself or through third parties, are First Name, Last Name,
                    Date of Birth, Phone number, Address, Username, Email, Password,
                    and Country, which are mandatory for making a booking.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Bookings are paid on collection, so this Application does not collect or
                    store card details.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Other Personal Data collected may be described in other sections
                    of this privacy policy or by dedicated explanation text
                    contextually with the Data collection.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    The Personal Data may be freely provided by the user or collected
                    automatically when using this Application.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Any use of Cookies - or of other tracking tools - by this
                    Application or by the owners of third-party services used by this
                    Application, unless stated otherwise, serves to identify Users and
                    remember their preference for the sole purpose of providing the
                    service required by the User.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Failure to provide certain Personal Data may make it impossible
                    for this Application to provide its services.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    The User assumes responsibility for the Personal Data of third
                    parties published or shared through this Application and declares
                    to have the right to communicate or broadcast them, thus relieving
                    the Data Controller of all responsibility.
                  </span>
                </span>
              </li>
            </ul>
            <p>
              <span >
                <span >
                  <strong>Mode and place of processing the Data</strong>
                </span>
              </span>
            </p>
            <ul>
              <li>
                <span >
                  <span >
                    All credit/debit cards’ details and personally identifiable
                    information will NOT be stored, sold, shared, rented, or leased to
                    any third parties.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Bookings are reserved without payment and settled when you collect the
                    car, so no card details are submitted through this website.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Route Facile will not pass any debit/credit card details
                    to third parties.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Route Facile takes appropriate steps to ensure data
                    privacy and security, including through various hardware and
                    software methodologies. However, routefacilecarrental.com cannot
                    guarantee the security of any information disclosed online.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Route Facile is not responsible for the privacy policies
                    of websites to which it links. If you provide any information to
                    such third parties, different rules regarding collecting and using
                    your personal information may apply.&nbsp;
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    You should contact these entities directly if you have any
                    questions about their use of the information they collect.
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Please remember that we do not have access to, or control over,
                    the information these third parties may collect. This privacy
                    policy does not cover the information practices of these third
                    parties.&nbsp;
                  </span>
                </span>
              </li>
            </ul>
            <p>
              <span >
                <span >
                  <strong>
                    <span >
                      <span style={{ color: "black" }}>Methods of processing</span>
                    </span>
                  </strong>
                </span>
              </span>
            </p>
            <ul>
              <li>
                <span >
                  <span >
                    <span >
                      <span style={{ color: "#212529" }}>
                        The Data Controller processes the Data of Users in a proper
                        manner and shall take appropriate security measures to prevent
                        unauthorized access, disclosure, modification, or unauthorized
                        destruction of the Data.
                      </span>
                    </span>
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    <span >
                      <span style={{ color: "#212529" }}>
                        The Data processing is carried out using computers and/or IT
                        enabled tools, following organizational procedures and modes
                        strictly related to the purposes indicated. In addition to the
                        Data Controller, in some cases, the Data may be accessible to
                        certain types of persons in charge, involved with the
                        operation of the site (administration, sales, marketing,
                        legal, system administration) or external parties (such as
                        third party technical service providers, mail carriers,
                        hosting providers, IT companies, communications agencies)
                        appointed, if necessary, as Data Processors by the Owner.
                      </span>
                    </span>
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    <span >
                      <span style={{ color: "#212529" }}>
                        The updated list of these parties may be requested from the
                        Data Controller at any time.
                      </span>
                    </span>
                  </span>
                </span>
                <ul>
                  <li>
                    <span >
                      <span >
                        <strong>Place</strong>
                      </span>
                    </span>
                    <ul>
                      <li>
                        <span >
                          <span >
                            The Data is processed at the Data Controller's operating
                            offices and in any other places where the parties involved
                            with the processing are located. For further information,
                            please contact the Data Controller.
                          </span>
                        </span>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span >
                      <span >
                        <strong>Retention time</strong>
                      </span>
                    </span>
                    <ul>
                      <li>
                        <span >
                          <span >
                            The Data is kept for the time necessary to provide the
                            service requested by the User, or stated by the purposes
                            outlined in this document, and the User can always request
                            that the Data Controller suspend or remove the data.
                          </span>
                        </span>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span >
                      <span >
                        <strong>The use of the collected Data</strong>
                      </span>
                    </span>
                    <ul>
                      <li>
                        <span >
                          <span >
                            The Data concerning the User is collected to allow the
                            Application to provide its services, as well as for the
                            following purposes: Registration and authentication.
                            <br />
                            The Personal Data used for each purpose is outlined in the
                            specific sections of this document.
                          </span>
                        </span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
            <p>
              <span >
                <span >
                  <strong>
                    Detailed information on the processing of Personal Data
                  </strong>
                </span>
              </span>
            </p>
            <ul>
              <li>
                <span >
                  <span >
                    Personal Data is collected for the following purposes and using
                    the following services:
                    <br />
                    Registration and authentication
                  </span>
                </span>
              </li>
              <li>
                <span >
                  <span >
                    Additional information about Data collection and processing
                  </span>
                </span>
              </li>
            </ul>
            <p>
              <span >
                <span >
                  <strong>Legal action</strong>
                  <br />
                  The User's Personal Data may be used for legal purposes by the Data
                  Controller, in Court or in the stages leading to possible legal
                  action arising from improper use of this Application or the related
                  services.
                  <br />
                  The User is aware of the fact that the Data Controller may be
                  required to reveal personal data upon request of public authorities.
                </span>
              </span>
            </p>
            <p>
              <span >
                <span >
                  <strong>Additional information about User's Personal Data</strong>
                </span>
              </span>
            </p>
            <p>
              <span >
                <span >
                  In addition to the information contained in this privacy policy,
                  this Application may provide the User with additional and contextual
                  information concerning particular services or the collection and
                  processing of Personal Data upon request.
                </span>
              </span>
              <br />
              &nbsp;
            </p>
            <p>
              <span >
                <span >
                  <strong>System Logs and Maintenance</strong>
                  <br />
                  For operation and maintenance purposes, this Application and any
                  third party services may collect files that record interaction with
                  this Application (System Logs) or use for this purpose other
                  Personal Data (such as IP Address).
                </span>
              </span>
              <br />
              &nbsp;
            </p>
            <p>
              <span >
                <span >
                  <strong>Information not contained in this policy</strong>
                  <br />
                  More details concerning the collection or processing of Personal
                  Data may be requested from the Data Controller at any time. Please
                  see the contact information at the beginning of this document.
                </span>
              </span>
            </p>
            <p>
              <br />
              <span >
                <span >
                  <strong>The rights of Users</strong>
                  <br />
                  Users have the right, at any time, to know whether their Personal
                  Data has been stored and can consult the Data Controller to learn
                  about their contents and origin, to verify their accuracy or to ask
                  for them to be supplemented, cancelled, updated or corrected, or for
                  their transformation into anonymous format or to block any data held
                  in violation of the law, as well as to oppose their treatment for
                  any and all legitimate reasons. Requests should be sent to the Data
                  Controller at the contact information set out above.
                  <br />
                  This Application does not support “Do Not Track” requests.
                  <br />
                  To determine whether any of the third party services it uses honor
                  the “Do Not Track” requests, please read their privacy policies.
                </span>
              </span>
              <br />
              &nbsp;
            </p>
            <p>
              <span >
                <span >
                  <strong>Changes to this privacy policy</strong>
                  <br />
                  The Data Controller reserves the right to make changes to this
                  privacy policy at any time by giving notice to its Users on this
                  page. It is strongly recommended to check this page often, referring
                  to the date of the last modification listed at the bottom. If a User
                  objects to any of the changes to the Policy, the User must cease
                  using this Application and can request that the Data Controller
                  erase the Personal Data. Unless stated otherwise, the then-current
                  privacy policy applies to all Personal Data the Data Controller has
                  about Users.
                </span>
              </span>
            </p>
            <p>
              <span >
                <span >
                  <strong>Children's Privacy</strong>
                  <br />
                  Our Service does not address anyone under the age of 13. We do not
                  knowingly collect personally identifiable information from anyone
                  under the age of 13. If You are a parent or guardian and You are
                  aware that Your child has provided Us with Personal Data, please
                  contact Us. If We become aware that We have collected Personal Data
                  from anyone under the age of 13 without verification of parental
                  consent, We take steps to remove that information from Our servers.
                  <br />
                  If We need to rely on consent as a legal basis for processing Your
                  information and Your country requires consent from a parent, We may
                  require Your parent's consent before We collect and use that
                  information.
                </span>
              </span>
            </p>
            <p>
              <span >
                <span >
                  <strong>Links to Other Websites</strong>
                  <br />
                  Our Service may contain links to other websites not operated by Us.
                  If You click on a third-party link, You will be directed to that
                  third-party’s site. We strongly advise You to review the Privacy
                  Policy of every site You visit.
                  <br />
                  We have no control over and assume no responsibility for the
                  content, privacy policies, or practices of any third-party sites or
                  services.
                </span>
              </span>
              <br />
              &nbsp;
            </p>
          </div> */}
         
          {/* Always the built-in component, never the CMS body.
              The CMS `pages` table only has English and Arabic columns, so a
              French visitor was served the English policy — and the Arabic
              column still held the previous UAE operator's text, naming a
              different company as the data controller. A privacy notice has to
              be in the reader's language and has to describe the business that
              actually holds the data. PrivacyPolicyContent is translated in all
              three languages; the CMS record is still used for the title and
              SEO fields above. */}
          <div className='px-1 px-lg-5'>
            <PrivacyPolicyContent t={t} />
          </div>
        
        </div>
      </div>
      </Container>
      </section>
      </div>
}    
      </> );
};

export default PrivacyPolicy;