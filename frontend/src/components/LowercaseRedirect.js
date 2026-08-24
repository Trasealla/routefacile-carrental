// components/LowercaseRedirect.js
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LowercaseRedirect = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    const lowercasePath = currentPath.toLowerCase();

    if (currentPath !== lowercasePath) {
      navigate({
        pathname: lowercasePath,
        search: location.search,
        hash: location.hash,
      }, { replace: true });
    }
  }, [location, navigate]);

  return children;
};

export default LowercaseRedirect;
