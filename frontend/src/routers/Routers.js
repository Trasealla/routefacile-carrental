import React, { Suspense, lazy, useEffect, startTransition } from "react";
import { Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import RouteSkeleton from "../components/UI/RouteSkeleton/RouteSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../actions/action";
// Only the slug list — importing seoPageData here dragged ~49 KB of landing
// page copy into the entry bundle for routes most visitors never open.
import SEO_SLUGS from "../components/SEO/seoSlugs";

// ── Route-level code splitting ──────────────────────────────────────────────
const HomeNew               = lazy(() => import("../pages/HomeNew"));
const About                 = lazy(() => import("../pages/About"));
const CarDetails            = lazy(() => import("../pages/CarDetails"));
const Blog                  = lazy(() => import("../pages/Blog"));
const BlogDetails           = lazy(() => import("../pages/BlogDetails"));
const NotFound              = lazy(() => import("../pages/NotFound"));
const Contact               = lazy(() => import("../pages/Contact"));
const BookingDetails        = lazy(() => import("../pages/BookingDetails"));
const Login                 = lazy(() => import("../pages/login"));
const ForgetPassword        = lazy(() => import("../pages/ForgetPassword"));
const Offerspage            = lazy(() => import("../components/UI/Offerspage"));
const OffersDetails         = lazy(() => import("../components/UI/OffersDetails"));
const BookingDetailsTwo     = lazy(() => import("../pages/BookingDetailsTwo").then(m => ({ default: m.BookingDetailsTwo })));
const Register              = lazy(() => import("../pages/Register"));
const Location              = lazy(() => import("../components/UI/Location"));
const OurFleetList          = lazy(() => import("../components/UI/OurFleetList"));
const CarEnquriry           = lazy(() => import("../components/UI/CarEnquriry"));
const CityService           = lazy(() => import("../components/UI/CitiesDetalis"));
const LeasingCorporatePage  = lazy(() => import("../components/UI/LeasingCorporatePage"));
const Allblog               = lazy(() => import("../components/UI/Allblog"));
const AboutUae              = lazy(() => import("../components/UI/AboutUae"));
const OtherBlog             = lazy(() => import("../components/UI/OtherBlog"));
const FqaPage               = lazy(() => import("../components/UI/FqaPage"));
const CustomerFeedback      = lazy(() => import("../components/UI/CustomerFeedback"));
const TermsCondition        = lazy(() => import("../components/UI/TermsCondition"));
const PrivacyPolicy         = lazy(() => import("../components/UI/PrivacyPolicy"));
const YourAccount           = lazy(() => import("../pages/MyAccount/YourAccount"));
const ResetPassword         = lazy(() => import("../pages/ResetPassword"));
const PaymentSuccess        = lazy(() => import("../components/UI/PaymentSuccess"));
const PaymentFailed         = lazy(() => import("../components/UI/PaymentFail"));
const LandMarkDetailsPage   = lazy(() => import("../components/UI/LandmarkDetailsPage"));
const NeighbourhoodDetailsPage = lazy(() => import("../components/UI/NeighbourhoodDetailsPage"));
const NewOurServices        = lazy(() => import("../components/UI/NewOurServices/NewOurServices"));
const AccountDelete         = lazy(() => import("../pages/AccountDelete"));
const Sitemap               = lazy(() => import("../pages/Sitemap"));
const BookingReport         = lazy(() => import("../pages/counter/BookingReport"));
const SeoLandingPage        = lazy(() => import("../components/SEO/SeoLandingPage"));
const KycWizard             = lazy(() => import("../pages/Kyc/KycWizard"));
const KycStatusPage         = lazy(() => import("../pages/Kyc/KycStatusPage"));

// Fallback shown while a page chunk loads.
//
// This still reserves a full viewport, for the reason it always did: the
// newsletter and footer are rendered by Layout *below* this route content, so a
// screenful keeps them off the fold until the real (much taller) page mounts,
// avoiding a layout shift. What changed is what fills that screenful — it used
// to be a lone spinner on white, which read as a broken page for the second or
// two Fleet and Offers took to load. It now sketches the layout that is coming.
const PageLoader = () => <RouteSkeleton />;

// Redirect /blogs/:slug-:id (no lang prefix) → canonical /en/blogs/:slug-:id
const BlogLangRedirect = () => {
  const { slug, id } = useParams();
  return <Navigate to={`/en/blogs/${slug}-${id}`} replace />;
};

// Redirect /cardetail/:id → /cars/:id
const CarDetailRedirect = () => {
  const { lang, id } = useParams();
  return <Navigate to={`/${lang}/cars/${id}`} replace />;
};

// Redirect legacy /:lang/aboutuae → /:lang/discover-morocco (keeps lang prefix)
const DiscoverMoroccoRedirect = () => {
  const { lang } = useParams();
  return <Navigate to={`/${lang || "en"}/discover-morocco`} replace />;
};

// Syncs the :lang URL param → Redux store + i18n on every navigation.
// This makes direct URL access (e.g. /ar/...) immediately activate Arabic.
const VALID_LANGS = ["en", "ar", "fr"];
const LangSync = () => {
  const { lang } = useParams();
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const storeLang = useSelector((state) => state.language.language);
  useEffect(() => {
    if (!lang || !VALID_LANGS.includes(lang)) return;
    // Compare against the STORE, not against i18n. redux-persist restores the
    // last language the visitor used, and App.js pushes that value into i18n —
    // so guarding on i18n.language meant /en was skipped whenever i18n had
    // already detected "en" from the path while the store still said "ar",
    // and App.js then dragged the page back to Arabic. The URL is the source of
    // truth for language; the store has to follow it.
    if (storeLang !== lang) {
      dispatch(setLanguage(lang));
    }
    if (i18n.language !== lang) {
      // Translations load over the network, so this suspends — it must be a
      // transition or React throws error #426 and blanks the page.
      startTransition(() => {
        i18n.changeLanguage(lang);
      });
    }
  }, [lang, storeLang, dispatch, i18n]);
  return null;
};

// Layout route wrapper that runs LangSync on all /:lang/* routes

const LangLayout = () => (
  <>
    <LangSync />
    <Outlet />
  </>
);

const Routers = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Non-lang routes */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/home" element={<Navigate to="/en" replace />} />
        <Route path="/counter/booking" element={<BookingReport />} />
        <Route path="/" element={<Navigate to="/en" replace />} />
        <Route path="/blogs/:slug-:id" element={<BlogLangRedirect />} />
        <Route path="/paymentsuccess" element={<PaymentSuccess />} />
        <Route path="/PaymentSuccess" element={<Navigate to="/paymentsuccess" replace />} />
        <Route path="/paymentfailed" element={<PaymentFailed />} />
        <Route path="/PaymentFailed" element={<Navigate to="/paymentfailed" replace />} />
        <Route path="/account-delete" element={<AccountDelete />} />
        <Route path="/kyc/status/:token" element={<KycStatusPage />} />
        <Route path="/kyc" element={<Navigate to="/en/kyc" replace />} />

        {/* All /:lang/* routes — LangLayout runs LangSync to sync URL lang → Redux */}
        <Route path="/:lang" element={<LangLayout />}>
          <Route index element={<HomeNew />} />
          <Route path="home" element={<Navigate to=".." replace />} />
          <Route path="login" element={<Login />} />
          <Route path="forgetpassword" element={<ForgetPassword />} />
          <Route path="resetpassword" element={<ResetPassword />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="about-us" element={<Navigate to="../about" replace />} />
          <Route path="cars" element={<Navigate to="../ourfleetlist" replace />} />
          <Route path="cars/:car_id" element={<CarDetails />} />
          <Route path="blogs" element={<Blog />} />
          <Route path="blogs/:slug-:id" element={<BlogDetails />} />
          <Route path="bookingdetails" element={<BookingDetails />} />
          <Route path="bookingdetails/:booking_number" element={<BookingDetails />} />
          <Route path="bookingdetailstwo/:booking_number" element={<BookingDetailsTwo />} />
          <Route path="bookingdetailstwo" element={<BookingDetailsTwo />} />
          <Route path="contact" element={<Contact />} />
          <Route path="carenquriry" element={<CarEnquriry />} />
          <Route path="offerspage" element={<Offerspage />} />
          <Route path="offersdetails/:slug/:id" element={<OffersDetails />} />
          <Route path="location" element={<Location />} />
          <Route path="ourFleet" element={<Navigate to="ourfleetlist" replace />} />
          <Route path="ourfleetlist" element={<OurFleetList />} />
          <Route path="fleet-leasing" element={<LeasingCorporatePage />} />
          <Route path="allblog" element={<Allblog />} />
          <Route path="discover-morocco" element={<AboutUae />} />
          <Route path="otherblog" element={<OtherBlog />} />
          <Route path="faq" element={<FqaPage />} />
          <Route path="contact-us" element={<Navigate to="../contact" replace />} />
          <Route path="customerfeedback" element={<Navigate to="customer-feedback" replace />} />
          <Route path="customer-feedback" element={<CustomerFeedback />} />
          <Route path="termscondition" element={<TermsCondition />} />
          <Route path="our-services" element={<NewOurServices />} />
          <Route path="car-rental" element={<Navigate to="../booking-engine" replace />} />
          <Route path="privacypolicy" element={<PrivacyPolicy />} />
          <Route path="myaccount/:type" element={<YourAccount />} />
          <Route path="myaccount" element={<YourAccount />} />
          <Route path="MyAccount/:type" element={<Navigate to="../myaccount/:type" replace />} />
          <Route path="MyAccount" element={<Navigate to="../myaccount" replace />} />
          <Route path="MyAccount/DiverDocuments/:id" element={<Navigate to="../myaccount/diverdocuments/:id" replace />} />
          <Route path="CarDetails" element={<Navigate to="../cars" replace />} />
          <Route path="paymentsuccess" element={<PaymentSuccess />} />
          <Route path="PaymentSuccess" element={<Navigate to="paymentsuccess" replace />} />
          <Route path="paymentfailed" element={<PaymentFailed />} />
          <Route path="PaymentFailed" element={<Navigate to="paymentfailed" replace />} />
          <Route path="citieservice/rent-a-car-in-:slug-:id" element={<CityService />} />
          <Route path="citylandmark/:slug/:id/:place_id" element={<LandMarkDetailsPage />} />
          <Route path="cityneighbourhood/:slug/:id/:place_id" element={<NeighbourhoodDetailsPage />} />
          <Route path="sitemap" element={<Sitemap />} />
          <Route path="counter/booking" element={<BookingReport />} />
          <Route path="terms-and-conditions" element={<Navigate to="../termscondition" replace />} />
          <Route path="enquiry" element={<Navigate to="../contact" replace />} />
          <Route path="cardetail/:id" element={<CarDetailRedirect />} />
          <Route path="car_rental_service_location/*" element={<Navigate to="../location" replace />} />
          <Route path="cities_car_rental/*" element={<Navigate to="../ourfleetlist" replace />} />
          <Route path="offer_details/*" element={<Navigate to="../offerspage" replace />} />
          <Route path="blog/*" element={<Navigate to="../blogs" replace />} />
          <Route path="neighbourhood/*" element={<Navigate to="../" replace />} />
          <Route path="contectuspage" element={<Navigate to="../contact" replace />} />
          <Route path="offers" element={<Navigate to="../offerspage" replace />} />
          <Route path="forgot-password" element={<Navigate to="../forgetpassword" replace />} />
          <Route path="fqapage" element={<Navigate to="../faq" replace />} />
          <Route path="kyc" element={<KycWizard />} />
          <Route path="kyc/status/:token" element={<KycStatusPage />} />
          {SEO_SLUGS.map((slug) => (
            <Route key={slug} path={slug} element={<SeoLandingPage staticSlug={slug} />} />
          ))}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Routers;
