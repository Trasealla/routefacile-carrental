import React from "react";
import MetaHelmet from "../components/Helmet/MetaHelmet";

const NotFound = () => {
  return (
    <div>
      <MetaHelmet
        title="Page Not Found"
        description="The page you are looking for does not exist. Go back to Route Facile homepage."
        noindex={true}
      />
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '48px', color: '#0D1B2A', marginBottom: '16px' }}>404</h1>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Page Not Found</p>
        <a href="/en" style={{ color: '#2563eb', textDecoration: 'underline' }}>Go to Homepage</a>
      </div>
    </div>
  );
};

export default NotFound;
