import React, { useEffect } from 'react';
import BlogList from './BlogList';
import { Col, Container, Row } from 'react-bootstrap';
import Helmet from '../Helmet/Helmet';
import MetaHelmet from '../Helmet/MetaHelmet';
import CommonSection from './CommonSection';
import { useSelector } from 'react-redux';

const Allblog = () => {
    const language = useSelector((state) => state.language.language);
    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
    return (
    <Helmet title="ALL BLOGS">
        <MetaHelmet
          title="All Blogs | Route Facile"
          description=""
          canonicalUrl={`/${language}/blogs`}
          noindex={true}
        />
        <div>
        <CommonSection title="ALL BLOGS" />
        <section className="p-0">
        <Container>
          <div className="">
            <Row>
             

              <BlogList />
            </Row>
          </div>
        </Container>
      </section>
        </div>
        </Helmet>
    );
};

export default Allblog;