import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/global-enhancements.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
// slick-carousel CSS moved next to the components that actually use it
// (BookingStepper, ServicesList) so it ships with their route chunk instead of
// the global entry.
import AppState from "../src/context/AppState";
import { CurrencyProvider } from "./context/CurrencyContext";
import { i18nReady } from "./components/MultiLang/i18n.js"
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store'; // Ensure correct import path
import { BrowserRouter as Router } from "react-router-dom";

// Google Analytics is loaded by Google Tag Manager (GTM-MVTPG3QM) and nothing
// else. react-ga4 used to initialise G-W3Q4FEM68C here as well, so gtag.js was
// fetched twice — 183 KiB duplicated — and every page_view and event was
// counted once by each copy. GA4 now has exactly one owner: the container.
//
// Do not re-add a direct GA4 init. Events go through
// src/SharedComponent/tracking.js, which pushes to window.dataLayer.

const root = ReactDOM.createRoot(document.getElementById("root"));

const tree = (
  // <React.StrictMode>
    <Router>
    <AppState>
      <Provider store={store} >
      <PersistGate loading={null} persistor={persistor}>
      <CurrencyProvider>
      <App />
      </CurrencyProvider>
      </PersistGate>
      </Provider>
      </AppState>
    </Router>
    // </React.StrictMode>
);

// Translations are fetched at runtime rather than bundled (see
// MultiLang/i18n.js), so the first render waits until the active language is in
// memory. index.html preloads that file, so it is normally already cached by the
// time the bundle finishes booting and this resolves immediately. Rendering
// anyway on failure is deliberate: a missing translation file should degrade to
// untranslated keys, not a blank site.
// Remove the static above-the-fold scaffolding injected at build time (see
// scripts/inline-hero.js) immediately before React renders the real thing. It
// exists only so the browser can paint the hero without waiting for this bundle;
// leaving it in place would duplicate the header and hero in the DOM.
// Removal and render happen in the same task, so no frame is painted in between.
i18nReady.catch(() => {}).then(() => {
  document.getElementById("rf-prepaint")?.remove();
  // Same reasoning for the prerendered copy (scripts/prerender.js): it carries
  // this page's real heading and body text so a crawler that never runs
  // JavaScript still gets the content. Once React is about to render, it has
  // done its job and would otherwise sit in the DOM twice over.
  document.getElementById("root-prerender")?.remove();
  root.render(tree);
});
