import React, { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../../context/AppContext";
// import { useSelector } from "react-redux";

const DropdownLanguage = () => {
  const { SetChangeLang } = useContext(AppContext);
  const { i18n, t } = useTranslation();
//   const addonSettingData = useSelector((state) => state.auth.addonModule);

  // Get the language preference from local storage or default to 'en'
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
//   const [language, setLanguage] = useState("ar");
  

  useEffect(() => {
    // Set the language in i18n when the component mounts
    setLanguage(localStorage.getItem('language'))
    i18n.changeLanguage(language);
    
  }, [i18n, language]);

  const handleLangChange = (status) => {
    setLanguage(status);
    // Store the selected language in local storage
    localStorage.setItem("language", status);
    i18n.changeLanguage(status);
    document.dir = status === 'ar' ? 'rtl' : 'ltr';
  };

 

  return (
    <>
     

<button onClick={() => handleLangChange("en")} style={{ backgroundColor : localStorage.getItem('language')==='en' && '#9C4900', borderRadius:'0.2rem'}}>
  <span style={{ color: localStorage.getItem('language') === 'en' && 'white', fontSize : '0.9rem' , paddingLeft:'2rem', paddingRight:'2rem' } }>{t("English")}</span>
</button>


<button onClick={() => handleLangChange("ar")} style={{ backgroundColor : localStorage.getItem('language')==='ar' && '#9C4900', borderRadius:'0.2rem'}}>
<span style={{ color: localStorage.getItem('language') === 'ar' && 'white', fontSize : '0.9rem' , paddingLeft:'2rem', paddingRight:'2rem' } }>{t("Arabic")}</span>
</button>

<button onClick={() => handleLangChange("fr")} style={{ backgroundColor : localStorage.getItem('language')==='fr' && '#9C4900', borderRadius:'0.2rem'}}>
<span style={{ color: localStorage.getItem('language') === 'fr' && 'white', fontSize : '0.9rem' , paddingLeft:'2rem', paddingRight:'2rem' } }>{t("French")}</span>
</button>

</>

  )
  
};

export default DropdownLanguage;