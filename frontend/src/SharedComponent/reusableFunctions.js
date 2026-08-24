

export const isDifferenceGreaterThanDays = (date1, date1Time, date2, date2Time, days) => {
  const dateTime1 = new Date(`${date1}T${date1Time}:00`); 
  const dateTime2 = new Date(`${date2}T${date2Time}:00`); 

  const diffInTime = Math.abs(dateTime2 - dateTime1);

  const diffInDays = diffInTime / (1000 * 60 * 60 * 24);

  return diffInDays > days;
};


export function getFullMonthDifference(date1, date2) {
  // Convert strings to Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Calculate the difference in years and months
  let yearDiff = d2.getFullYear() - d1.getFullYear();
  let monthDiff = d2.getMonth() - d1.getMonth();

  // Total full months difference
  let totalMonths = yearDiff * 12 + monthDiff;

  // Check if the end date's day is before the start date's day
  if (d2.getDate() < d1.getDate()) {
    totalMonths--; // Subtract 1 if a full month hasn't passed
  }

  return totalMonths > 0 ? totalMonths : 1; // Ensure non-negative result
}

export const extractCity = (googleApiResponse) => {
  if (!Array.isArray(googleApiResponse) || googleApiResponse.length === 0)
    return null;

  const addressComponents = googleApiResponse[0]?.address_components;
  if (!Array.isArray(addressComponents)) return null;

  const cityComponent = addressComponents.find((component) =>
    component.types.includes("administrative_area_level_1")
  );

  return cityComponent ? cityComponent.long_name : null;
};

export const filterCityArrayByLabel = (cityArray, label) => {
  if (!Array.isArray(cityArray) || typeof label !== "string") return null;
  const foundItem = cityArray.find((item) => item.name === label);
  return foundItem ? { value: foundItem.id, label: foundItem.name } : null;
};

export const UAE_BOUNDS = {
  north: 26.5,
  south: 22.5,
  west: 51.5,
  east: 57.5,
};

export const addMonthsToDate = (dateString, numberOfMonths) => {
  if (typeof dateString !== "string" /*   */) {
    throw new Error(
      "Invalid input: date must be a string and months must be a number"
    );
  }
  const inputDate = new Date(dateString);
  if (isNaN(inputDate.getTime())) {
    throw new Error("Invalid date format. Use 'YYYY-MM-DD'.");
  }
  const daysToAdd = numberOfMonths * 30;
  inputDate.setDate(inputDate.getDate() + daysToAdd);
  const updatedDate = inputDate.toISOString().split("T")[0];
  return updatedDate;
};

export const getDayOfWeekFromDateString = (date) => {
  if (typeof date !== "string") return null;
  const newDate = new Date(date);
  if (isNaN(newDate.getTime())) return null;
  return newDate.getDay();
};

export const findClosestShiftTime = (shifts, timeString) => {
 
  if (!Array.isArray(shifts) || typeof timeString !== "string") return false;
  
  // Convert timeString to hours and minutes
  const [hours, minutes] = timeString.split(":").map(Number);
  const inputTime = hours + minutes / 60; // Convert to decimal format

  // Check if all shifts are closed
  const allShiftsClosed = shifts.every(
    (shift) => shift.from_hours === 0 && shift.to_hours === 0
  );
  if (allShiftsClosed) return false;
  
  // Iterate through shifts to find the next available time
  for (const { from_hours, to_hours } of shifts) {
    // Check if time falls within shift
    if (inputTime >= from_hours && inputTime <= to_hours) {
      
      return timeString; // Time is already within the shift, return it.
    }

    // Check if time is before a shift's start time
    /* if (inputTime < from_hours) */ else {
    
      // Return the next available shift start time
      const formattedHours = Math.floor(from_hours);
      const formattedMinutes = Math.round((from_hours - formattedHours) * 60);
      return `${String(formattedHours).padStart(2, "0")}:${String(
        formattedMinutes
      ).padStart(2, "0")}`;
    }
  }

  // If no shift found after the current time, return false
  return false;
};


// Maps the app's language codes onto BCP-47 locales. ar-MA rather than ar-AE:
// Morocco writes Arabic dates with Western digits.
export const dateLocaleFor = (language) =>
  ({ ar: "ar-MA", fr: "fr-MA", en: "en-GB" }[language] || "en-GB");

export function formatDate(dateString, language) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    // Morocco (UTC+1, UTC+0 during Ramadan). This was Asia/Dubai, inherited from
    // the previous UAE business, which displayed every pickup and drop-off time
    // three hours ahead of the actual local time.
    timeZone: "Africa/Casablanca",
  };

  return new Date(dateString)
    .toLocaleString(dateLocaleFor(language), options)
    .replace(",", "");
}

// Renders a stored UTC timestamp in Moroccan local time (UTC+1, and UTC+0 during
// Ramadan — the IANA zone handles the switch, so do not hardcode an offset).
// Formerly convertToUAETTime, which used Asia/Dubai and put every booking time
// three hours ahead.
export const convertToLocalTime = (utcDateTime) => {
  const date = new Date(utcDateTime);
  return date.toLocaleString("en-US", { timeZone: "Africa/Casablanca" });
};

// Slugify function that supports Arabic & Unicode
export const slugify = (text) => {
  return text
    ?.toString()
    .toLowerCase()
    .normalize("NFKD") // Normalize Unicode (removes accents/diacritics)
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\p{L}\p{N}\-]+/gu, "") // Keep letters (L), numbers (N), and -
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
};


// Fix image URLs by replacing staging URLs with production URLs from environment
// Uses REACT_APP_FILE_SERVER from .env file (should be https://routefacilecarrental.com/media)
export const fixImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;
  
  // Get production file server URL from environment variable (.env file)
  const productionFileServer = process.env.REACT_APP_FILE_SERVER || 'https://routefacilecarrental.com/media';
  
  // Remove trailing slash if present
  const baseUrl = productionFileServer.replace(/\/$/, '');
  
  // Legacy CMS rows still hold absolute URLs on the previous owner's file
  // servers. Point them at ours instead of returning them untouched: that host
  // is not ours to rely on, and the same paths exist under /media here.
  if (/^https?:\/\/files\.(staging\.)?trasealla\.com/i.test(imageUrl)) {
    return imageUrl.replace(/^https?:\/\/files\.(staging\.)?trasealla\.com/i, baseUrl);
  }
  
  // If it's a relative path (starts with /), prepend the base URL
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }
  
  // If it's already a full URL (http/https) but not our domain, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, assume it's a relative path and prepend base URL
  return `${baseUrl}/${imageUrl.replace(/^\//, '')}`;
};

// dayjs.extend(updateLocale);

// dayjs.updateLocale("en", {
//   months: [
//     "M1", "M2", "M3", "M4", "M5", "M6",
//     "M7", "M8", t("M9"), "M10", "M11", "M12"
//   ],
//   weekdays: [
//     "SunX", "MonX", "TueX", "WedX", "ThuX", "FriX", "SatX"
//   ]
// });