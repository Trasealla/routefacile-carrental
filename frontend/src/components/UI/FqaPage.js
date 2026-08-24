import React, { useEffect, useState } from "react";
import "../../styles/fqa.css";
import CommonSection from "./CommonSection";
import { Accordion, Col, Container, Nav, Tab } from "react-bootstrap";
import Helmet from "../Helmet/Helmet";
import { Link } from "react-router-dom";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, getApiLang } from "../../config.js/SetUp";
import { useSelector } from "react-redux";
import { hasLoadedNamespace } from "i18next";
import FindCarForm2 from "./FindCarForm2";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";
const FqaPage = () => {
  const language = useSelector((state) => state.language.language);
  const { t, i18n } = useTranslation();
  const [citiesArray, setCitiesArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const page_size = 10;
const [loading, set_loading] = useState(true);
const [faq_categories, set_faq_categories] = useState([]);
const [faq, set_faq] = useState([]);
const [faq_cat, set_faq_cat] =useState(1);


useEffect(()=>{
window.scroll(0,0);
},[])
  const getFAQCategories = () => {
    const url = `${configWeb.GET_FAQ_CATEGORIES}?lang=${getApiLang(language)}&page=${currentPage}&page_size=${page_size}`; 
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_faq_categories(res?.data || []); // Ensure it's always an array
          // set_total_records(res?.total_records || 0);
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {
        set_loading(false);
      });
  };
  const getFAQ = () => {
    const url = `${configWeb.GET_FAQ}?lang=${getApiLang(language)}&page=${currentPage}&page_size=${page_size}&faq_category_id=${faq_cat}`; 
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_faq(res?.data || []); // Ensure it's always an array
          // set_total_records(res?.total_records || 0);
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {
        set_loading(false);
      });
  };

  useEffect(() => {
    getFAQ();
  }, [language, faq_cat]);
  useEffect(() => {
    getFAQCategories();
  }, [language]);

  const handleCategorySelect =(id)=>{
    set_faq_cat(id);
  }

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
  return (
    <div>
        <MetaHelmet
        title="FAQ Page"
        description="Find answers to common questions about Route Facile's car rental services, booking process, payments, policies, and more. Get the details you need easily."
        keywords="car rental, affordable cars, rent a car"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/faq`}

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
      <CommonSection title="FAQ" />

      <Helmet title="Frequently Asked Questions | Route Facile">
        <div className="myAccountMainBox">
          <div className="tabsSection">
            <Tab.Container defaultActiveKey={faq_cat}>
              <Nav variant="pills">
                {Array.isArray(faq_categories) && faq_categories.length>0 && faq_categories?.map((item)=>(
                  <Nav.Item key={item.id} onClick={()=>handleCategorySelect(item.id)}>
                  <Nav.Link eventKey={item.id}>{item.name}</Nav.Link>
                </Nav.Item>

                ))}
                {/* <Nav.Item>
                  <Nav.Link eventKey="first">General</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="second">Payment Related</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="third">Vehicle Related</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fourth">Insurance Related</Nav.Link>
                </Nav.Item> */}
              </Nav>
              <Tab.Content>

                 {Array.isArray(faq_categories) && faq_categories.length>0 && faq_categories?.map((item)=>(
                   <Tab.Pane eventKey={item.id} key={item.id}>
                     <div className="accordBox rf-faq-list">
                       {/* One Accordion wrapping every question, rather than a
                           separate Accordion per item. Previously each question
                           was its own accordion with defaultActiveKey="1", so
                           they never behaved as a group and whichever question
                           happened to have id 1 was forced open. */}
                       <Accordion alwaysOpen={false}>
                         {Array.isArray(faq) && faq.length > 0 &&
                           faq.map((q) => (
                             <Accordion.Item eventKey={String(q.id)} key={q.id} className="rf-faq-item">
                               <Accordion.Header>{q.question}</Accordion.Header>
                               <Accordion.Body>
                                 <div dangerouslySetInnerHTML={{ __html: q?.answer }} />
                               </Accordion.Body>
                             </Accordion.Item>
                           ))}
                       </Accordion>
                     </div>
                   </Tab.Pane>
                 ))}
                {/* <Tab.Pane eventKey='1'>
                  <div className="accordBox">
{Array.isArray(faq) && faq?.length>0 && faq?.map((item)=>(
    
    <Accordion defaultActiveKey="1" key={item.id}>
    <Accordion.Item eventKey={item.id} className="shadow">
      <Accordion.Header>
     {item.question}
      </Accordion.Header>
      <Accordion.Body className="ps-4 py-0">
        <div dangerouslySetInnerHTML={{
                __html: item?.answer,
              }} />
   
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
)) }

                
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="2">
                  <div className="accordBox">

                  {Array.isArray(faq) && faq?.length>0 && faq?.map((item)=>(
    
    <Accordion defaultActiveKey="1" key={item.id}>
    <Accordion.Item eventKey={item.id} className="shadow">
      <Accordion.Header>
     {item.question}
      </Accordion.Header>
      <Accordion.Body className="ps-4 py-0">
        <div dangerouslySetInnerHTML={{
                __html: item?.answer,
              }} />
   
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
)) }


                    <Accordion defaultActiveKey="1">
                      <Accordion.Item eventKey="1" className="shadow">
                        <Accordion.Header>
                          I don’t have a credit card. Can I rent a car from
                          Route Facile?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Please note you must possess a credit card to rent a
                            car from us. You can also use a credit card of your
                            friend or family as a guarantee. However that person
                            needs to accompany you at the time of rental.
                          </p>

                          <p>
                            Credit card is required as a guarantee against
                            payment for the traffic fine/salik/any other traffic
                            violation/damage to the vehicle/all extras other
                            than the rental paid at the time of rental.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>
                          Can I use another person’s credit card with their
                          permission?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Yes, provided the person is present at the time of
                            signing the contract.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>
                          How much amount will Route Facile block on daily rental?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            We will block a Pre-Authorization Amount of a
                            minimum of MAD 1000 on your credit card. This amount
                            will be released automatically within 14-30 days
                            from closing of contract. Upon off hire of the
                            vehicle, the amount is auto released by banks within
                            2 weeks of being charged.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="4">
                        <Accordion.Header>
                          How much amount will Route Facile charge from my credit
                          card on monthly rental?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            We will charge MAD 1000 from your credit card as an
                            advance. The deposit sum is refunded back after a
                            month from the date of off-hire after the necessary
                            deductions i.e. Traffic Fines, Salik/ DARB (if
                            applicable)
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="5">
                        <Accordion.Header>
                          Why is my 1000 MAD Deposit Delayed?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            The 1000 MAD deposit is returned 30 days after the
                            vehicle is handed back, because traffic fines in
                            Morocco can reach us some weeks after the rental
                            ends.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="6">
                        <Accordion.Header>
                          Why is the rate I was charged different to the rate on
                          my reservation or rental record?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            The rate quoted at the time of reservation is an
                            approximate total based on the rental terms
                            indicated by you at the time the vehicle is reserved
                            and often does not include optional services or
                            additional charges for fuel, traffic fine, Salik,
                            etc. that occur at the time of rental or return.
                            Route Facile automatically pays for the fines and
                            charges clients on monthly payments.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="7">
                        <Accordion.Header>
                          I booked a car on the website and then cancelled it.
                          When can I expect a refund of my amount?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Refunds on your purchases are done automatically and
                            seamlessly after we receive your cancellation
                            request. However, depending upon the individual’s
                            bank requirement, the amount may take up to a month
                            to reflect in your card statement.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="3">
                  <div className="accordBox">
                  {Array.isArray(faq) && faq?.length>0 && faq?.map((item)=>(
    
    <Accordion defaultActiveKey="1" key={item.id}>
    <Accordion.Item eventKey={item.id} className="shadow">
      <Accordion.Header>
     {item.question}
      </Accordion.Header>
      <Accordion.Body className="ps-4 py-0">
        <div dangerouslySetInnerHTML={{
                __html: item?.answer,
              }} />
   
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
)) }


                    <Accordion defaultActiveKey="1">
                      <Accordion.Item eventKey="1" className="shadow">
                        <Accordion.Header>
                          What is the Mileage Allowance on my vehicle?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Unlimited mileage on daily and weekly rentals.
                            Customers with a monthly rental agreement (MRA) and
                            long-term agreement with Route Facile can
                            drive 3000 km monthly. Any accrued mileage beyond
                            the limit is charged at MAD 50 fills to 1 Dirham per
                            km based on the car group.{" "}
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>
                          I am leasing a vehicle from Route Facile . How would I
                          get the service done?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Customer has to notify 500 kms before reaching the
                            service due mark to ensure timely replacement and
                            avoid costs arising from service due
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>
                          How can I do the Rental Amendments?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Extension/Amendment of contract can be done by
                            personally visiting the branch.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="4">
                        <Accordion.Header>
                          What are the Additional Accessories I can expect from
                          Route Facile?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Child/Baby Seats or GPS Navigators can be provided
                            for an additional charge.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="5">
                        <Accordion.Header>
                          What should I do in case of a breakdown?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Route Facile offers you 24hr breakdown and
                            roadside assistance. In the event that you may
                            require any assistance, you can call our toll free
                            service number – 8002772.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="6">
                        <Accordion.Header>
                          Does Route Facile deliver the car to my doorstep?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Not to put you through inconvenience, we can deliver
                            and collect vehicles right at your doorstep. Please
                            note that in some cases a small charge will be
                            charged depending on the distance.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="4">
                  <div className="accordBox">
                    <Accordion defaultActiveKey="1">
                      <Accordion.Item eventKey="1" className="shadow">
                        <Accordion.Header>
                          What other insurance options are available?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            A) Collision Damage Waiver (CDW) &amp; Super
                            Collision Damage Waiver (SCDW)
                            <br />
                            B) Personal Accident Insurance (PAI)
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>
                          What is Collision Damage Waiver?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            CDW: Additional insurance coverage is offered to an
                            individual renting an automobile. Collision Damage
                            Waiver or CDW is optional, with the cost of the
                            waiver depending on a variety of factors including
                            the type of rental car and where the car is being
                            driven. The waiver typically covers damage to a
                            rental car but is unlikely to cover bodily injury
                            caused by an accident.
                          </p>
                          <p>
                            Renters can purchase a collision damage waiver by
                            paying an additional daily fee on top of the rental
                            car fee. The CDW provides a level of protection for
                            the renter that covers damage to the rental car and
                            reduces the excess amount of MAD 500 to MAD 1000. If
                            the car is damaged then the renter is not
                            responsible for the repairs to ROUTE FACILE as well as
                            for any loss of use fees that may accrue while the
                            rental car is being repaired but is still liable to
                            pay MAD 1000.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>
                          What is Super Collision Damage Waiver SCDW?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Super CDW: Renters can purchase SCDW only when they
                            have CDW cover with them. Super CDW reduces the
                            customer’s liability to ZERO. Renters will not be
                            paying anything to ROUTE FACILE for damage or repairs.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="4">
                        <Accordion.Header>
                          What is Personal Accident Insurance (PAI)?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            PAI – Is an additional extra that you may avail when
                            you pick up your hire vehicle. PAI is an additional
                            insurance which covers the authorized driver(s) and
                            passengers in the hire vehicle for death, disability
                            and medical expenses.
                          </p>
                          <p>
                            PAI provides Accidental Death and Medical Insurance
                            protection to you and your&nbsp;passengers in the
                            event of accidental death or bodily injury for the
                            duration of the rental. Your passengers will also be
                            covered but only while they are in the rented car.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="5">
                        <Accordion.Header>
                          Is it mandatory to purchase PAI (Personal Accident
                          Insurance)?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            No. PAI (Personal Accident Insurance)is optional for
                            clients who purchase it, although it is highly
                            recommended for personal safety.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="6">
                        <Accordion.Header>
                          What is Excess Insurance?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            The customer will be responsible for the settlement
                            of the insurance excess or deductible amount which
                            is listed on the vehicle hire agreement. In the
                            event of any damage or loss [including fire and
                            theft] caused to the vehicle, provided it is used,
                            operated or driven in conformity with the vehicle in
                            the agreement. NOTE: A valid police report is
                            mandatory
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="7">
                        <Accordion.Header>
                          I pre-paid for my rental. Why am I being charged an
                          additional amount?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Additional/optional items such as fuel, optional
                            coverages selected at the time of rental, Salik/
                            DARB, surcharge, etc. are not included in the
                            pre-paid amount unless it is specifically noted that
                            certain options are included.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion className="shadow">
                      <Accordion.Item eventKey="8">
                        <Accordion.Header>
                          Can I take the car outside Morocco?
                        </Accordion.Header>
                        <Accordion.Body className="ps-4 py-0">
                          <p>
                            Our vehicles are insured for use within Morocco.
                            Taking a car across the border requires separate
                            paperwork and insurance, so please contact us on
                            WhatsApp before booking and we will tell you what
                            is possible for your trip.
                          </p>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </Tab.Pane> */}
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </Helmet>
    </div>
  );
};

export default FqaPage;