// Default API key fallback for development
const DEFAULT_API_KEY = "J%P9&g4aIbZn7D3";

export async function PostCallWithErrorResponse(url, requestBody) {
  var resp;
  
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
///form data

export async function multipartPostCallWithErrorResponse(url, requestBody) {
  var resp;
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      //"Content-Type": "multipart/form-data",
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
export async function multipartPostCallWithErrorResponseCategory(
  url,
  requestBody,
  status,
  category_icon_id
) {
  var resp;
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      //"Content-Type": "multipart/form-data",
      category_icon_id: category_icon_id,
      switch: status,
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}

export async function getWithAuthCallWithErrorResponse(url) {
  var resp;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",

      // Authorization: "Token " + localStorage.getItem("auth_token"),
      "x-api-key": process.env.REACT_APP_API_KEY || DEFAULT_API_KEY,
    },
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}

export async function postWithAuthCallWithErrorResponse(url, requestBody) {
  var resp;
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // "Content-Type": "multipart/form-data",
      Authorization: "Token " + localStorage.getItem("auth_token"),
      // Origin: window.location.origin,
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
export async function getWithAuthCallWithtext(url) {
  var resp;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Authorization: 'Token ' + localStorage.getItem("USER_AUTH_TOKEN"),    },
    },
  })
    .then((response) => {
      resp = response;
      return response.text();
    })
    .then((text) => {
      return { response: resp, text: text, error: !resp.ok };
    });
}

export async function putMultipartWithAuthCallWithErrorResponse(
  url,
  requestBody
) {
  var resp;
  return await fetch(url, {
    method: "PUT",
    headers: {
      // Accept: "application/json",
      // "Content-Type": "multipart/form-data",
      Authorization: "Token " + localStorage.getItem("auth_token"),
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}

export async function postMultipartWithAuthCallWithErrorResponse(
  url,
  requestBody
) {
  var resp;
  return await fetch(url, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
export async function postMultipartWithAuthCallWithErrorResponseNode(
  url,
  requestBody
) {
  var resp;
  return await fetch(url, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: localStorage.getItem("auth_token"),
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
export async function simpleGetCallWithErrorResponse(url) {
  var resp;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
export async function simpleGetCallWithErrorResponseNODE(url) {
  var resp;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("auth_token"),
    },
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
export async function simpleGetCallWithErrorResponseNode(url) {
  var resp;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("auth_token"),
    },
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}
export async function getLocationName(latLng) {
  return await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${Number(
      latLng.lat
    )}&lon=${Number(latLng.lng)}`,
    {}
  )
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function simpleGetCall(url) {
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY || DEFAULT_API_KEY,
      // Authorization: localStorage.getItem("api_key"),
      // user_customer_id:localStorage.getItem("customer_id"),
      // user_id:localStorage.getItem("id")
    },
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}
export async function simpleGetCallNew(url, customerId) {
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Authorization:CustomerData?.api_key,
      user_customer_id: customerId,
      // user_id:CustomerData.id
      // Authorization: localStorage.getItem("api_key"),
      // user_customer_id:localStorage.getItem("customer_id"),
      // user_id:localStorage.getItem("id")
    },
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function simplePostCall(url, requestBody) {
  return await fetch(url, {
    method: "POST",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // //'Access-Control-Allow-Credentials': "*"
      // Authorization: localStorage?.getItem("api_key"),
      // user_customer_id:localStorage?.getItem("customer_id"),
      // user_id:localStorage?.getItem("id")
      "x-api-key": process.env.REACT_APP_API_KEY || DEFAULT_API_KEY,
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

/**
 * The access token, but only while it is still valid.
 *
 * Tokens are stored with a 3-hour expiry, and the header and the login page
 * both honour it — the API layer did not. So a customer who booked once, came
 * back later and booked again had the dead token sent anyway: the request came
 * back 401 and the booking failed with no way forward, because the app still
 * believed they were signed in and never offered guest checkout.
 *
 * An expired token is removed here so the rest of the app treats the visitor as
 * signed out, which is what they actually are.
 */
/**
 * True when a JWT was issued to a staff member rather than a customer.
 *
 * Staff tokens carry a `type` claim (admin, counter, kyc_officer, hr_*);
 * customer tokens carry only { email, sub }. Reading the claim needs no secret —
 * this only decides whether to SEND the token, and the server still verifies it.
 */
function isStaffToken(jwt) {
  try {
    const body = jwt.split(".")[1];
    if (!body) return false;
    const json = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    return !!JSON.parse(json)?.type;
  } catch (e) {
    return false; // unreadable: leave it to the server to reject
  }
}

export function getValidAccessToken() {
  try {
    const raw = localStorage?.getItem("token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token) return null;
    if (parsed?.expiry && parsed.expiry <= new Date().getTime()) {
      localStorage.removeItem("token");
      return null;
    }
    // The CMS admin used to store its session under this same key, so a browser
    // that had signed into /admin left an ADMIN token here — which this site then
    // sent to the booking API. Admin tokens are signed with a different secret,
    // so every booking confirmed from that browser failed with a 401 and no
    // useful message. The admin panel now uses its own key, but any browser that
    // signed in before that change still holds the stale token: drop it here so
    // those sessions heal themselves instead of failing at checkout.
    if (isStaffToken(parsed.access_token)) {
      localStorage.removeItem("token");
      return null;
    }
    return parsed.access_token;
  } catch (e) {
    localStorage.removeItem("token");
    return null;
  }
}

/** True when a non-expired session exists. */
export function hasValidSession() {
  return !!getValidAccessToken();
}

export async function simpleGetCallAuth(url) {
  const access_token = getValidAccessToken();
  
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function simplePostCallAuth(url, requestBody) {
  const access_token = getValidAccessToken();
  return await fetch(url, {
    method: "POST",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: `Bearer ${access_token}`,
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}
export async function simplePutCallAuth(url, requestBody) {
  const access_token = getValidAccessToken();
  return await fetch(url, {
    method: "PUT",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: `Bearer ${access_token}`,
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}
export async function simpleDeleteCallAuth(url, requestBody) {
  const access_token = getValidAccessToken();
  return await fetch(url, {
    method: "DELETE",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: `Bearer ${access_token}`,
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function simplePostCall_New(url, requestBody) {
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY || DEFAULT_API_KEY,
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => response.json())
    .then((result) => result) // or some other function to process result
    .catch((error) => {
      throw error;
    });
}

export async function simplePostCallShare(url, requestBody, customerId) {
  return await fetch(url, {
    method: "POST",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      // Authorization:CustomerData?.api_key,
      user_customer_id: customerId,
      // user_id:CustomerData.id
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
  //.then(data=>data.json());
}

export async function SimpleUploadFiles(url, requestBody) {
  return await fetch(url, {
    method: "POST",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      // "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
  //.then(data=>data.json());
}
export async function simpleDeleteCall(url, requestBody) {
  return await fetch(url, {
    method: "DELETE",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
  //.then(data=>data.json());
}

export async function simplePostCallNode(url, requestBody) {
  return await fetch(url, {
    method: "POST",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: localStorage.getItem("auth_token"),
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
  //.then(data=>data.json());
}
export async function simplePUTCall(url, requestBody) {
  return await fetch(url, {
    method: "PUT",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
  //.then(data=>data.json());
}
export async function simplePostCallAll(url, requestBody) {
  return await fetch(url, {
    method: "POST",
    // mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //'Access-Control-Allow-Credentials': "*"
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
  //.then(data=>data.json());
}

export async function multipartPostCall(url, requestBody) {
  const access_token = getValidAccessToken();
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      //'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${access_token}`,
    },
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}
export async function multipartPostCallWithoutAuth(url, requestBody) {
  const access_token = getValidAccessToken();
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      //'Content-Type': 'multipart/form-data',
      // Authorization: `Bearer ${access_token}`,
      "x-api-key": process.env.REACT_APP_API_KEY || DEFAULT_API_KEY,
    },
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function getWithAuthCall(url) {
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function postWithAuthCall(url, requestBody) {
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Token " + localStorage.getItem("auth_token"),
    },
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function putWithAuthCall(url, requestBody) {
  return await fetch(url, {
    method: "PUT",
    headers: {
      // Accept: "application/json",
      // "Content-Type": "application/json",
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function postMultipartWithAuthCall(url, requestBody) {
  return await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      // "Content-Type": "multipart/form-data",
      // "Access-Control-Allow-Origin": "*",
      Authorization: "Token " + localStorage.getItem("auth_token"),
    },
    withCredentials: true,
    body: requestBody,
  })
    .then((response) => response.text())
    .then((result) => getResult(result));
}

export async function putMultipartWithAuthCall(url, requestBody) {
  return await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      //Authorization: 'Token ' + (await AsyncStorage.getItem(AppStrings.TOKEN)),
      Authorization: localStorage.getItem("api_key"),
      user_customer_id: localStorage.getItem("customer_id"),
      user_id: localStorage.getItem("id"),
    },
    body: requestBody,
  })
    .then((response) => response.json())
    .then((result) => getResult(result));
}

export async function deleteWithAuthCall(url, requestBody) {
  return await fetch(url, {
    method: "DELETE",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Token " + localStorage.getItem("auth_token"),
    },

    body: requestBody,
  }).then((response) => response.json());
}

export async function deleteWithAuthCallNode(url, requestBody) {
  return await fetch(url, {
    method: "DELETE",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("auth_token"),
    },

    body: requestBody,
  }).then((response) => response.json());
}
export async function simpleGetCallWithErrorResponseNodeCreate(url) {
  var resp;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Authorization:  localStorage.getItem("auth_token"),
      // Authorization: 'YOUR_ACCESS_KEY'
    },
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .catch((err) => {
      return err;
    });
}

export async function postMultipartWithAuthCallWithErrorResponseNodeCreate(
  url,
  requestBody
) {
  var resp;
  return await fetch(url, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: localStorage.getItem("auth_token"),
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}

export async function putMultipartWithAuthCallWithErrorResponseNodeCreate(
  url,
  requestBody
) {
  var resp;
  return await fetch(url, {
    method: "PUT",
    headers: {
      // Accept: "application/json",
      // "Content-Type": "multipart/form-data",
      Authorization: localStorage.getItem("auth_token"),
    },
    body: requestBody,
  })
    .then((response) => {
      resp = response;
      return response.json();
    })
    .then((json) => {
      return {
        response: resp,
        json: json,
        error: !resp.ok,
      };
    });
}

//-------------------------------------
export async function getResult(data) {
  return JSON.parse(data.trim());
}
//-------------------------------------

/**
 * Maps UI language codes to backend-supported lang values.
 * Backend accepts: "en" | "ar"
 *
 * Arabic used to be sent as "ae" because the backend columns and its language
 * enum both carried that suffix — "ae" is the UAE country code, inherited from
 * the previous business, not a language code. Both sides now use the ISO 639-1
 * code "ar", so this is a pass-through for Arabic rather than a translation.
 * "ae" is still accepted as input so any bookmarked or cached URL keeps working.
 */
export const getApiLang = (language) => {
  if (language === "ar" || language === "ae") return "ar";
  return "en";
};

/**
 * Offer-specific language mapping. The `offers` table (and only that
 * table, for now) also has `_fr` columns, so pass French through as-is
 * instead of collapsing it to English like getApiLang() does. Use this
 * ONLY for offer endpoints — every other endpoint still only accepts
 * "en" | "ar" and will 400 on "fr".
 */
export const getOfferApiLang = (language) => {
  if (language === "ar" || language === "ae") return "ar";
  if (language === "fr") return "fr";
  return "en";
};

/**
 * Blog-specific language mapping. `blogs.title_fr`/`description_fr`/etc.
 * exist (the content-engine webhook writes them), so pass French through
 * instead of collapsing it to English like getApiLang() does. Use this ONLY
 * for blog endpoints — most other endpoints still only accept "en" | "ar".
 */
export const getBlogApiLang = (language) => {
  if (language === "ar" || language === "ae") return "ar";
  if (language === "fr") return "fr";
  return "en";
};
