// Meta (Facebook) Pixel event helpers.
//
// No pixel is loaded on the site: Meta is to be added through Google Tag
// Manager if the business ever runs Meta ads. Every function below is a no-op
// until window.fbq exists, and stays silent rather than logging a warning on
// each call — the pixel's absence is the intended state, not a fault.

export const pixelLeadEvent = (contentName) => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      value: 0.0,
      currency: "MAD",
      content_name: contentName,
     
    });
  } else {
  }
};


export const pixelViewContentEvent = (contentType, contentIds, value, currency = 'MAD') => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_type: contentType,
      content_ids: contentIds,
      value: value,
      currency: currency,
    });
  } else {
  }
};

export  const pixelSearchEvent = (searchTerm, contentIds, value, currency = 'MAD') => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Search', {
      search_string: searchTerm,
      content_ids: contentIds,
      value: value,
      currency: currency,
    });
  } else {
  }
};

export const pixelInitiateCheckoutEvent = (contentIds,contents , value , currency,numItems)=>{
  if(typeof window.fbq === "function"){
    window.fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      contents: contents,
      value: value,
      currency: currency,
      num_items : numItems,
    });
  } else {
  }
  }
export const pixelPurchaseEvent = (contentType,contents , value , currency)=>{
if(typeof window.fbq === "function"){
  window.fbq('track', 'Purchase', {
    content_type: contentType,
    contents: contents,
    value: value,
    currency: currency,
  });
} else {
}
}