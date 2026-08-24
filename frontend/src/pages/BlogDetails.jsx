import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, FormGroup, Input } from "reactstrap";

import { useParams } from "react-router-dom";
import blogData from "../assets/data/blogData.js";
import Helmet from "../components/Helmet/Helmet";
import { Link } from "react-router-dom";
import carlogo from "../assets/new-logo/logo.png";
import commentImg from "../assets/all-images/ava-1.jpg";

import "../styles/blog-details.css";
import configWeb from "../config.js/configWeb.js";
import { simpleGetCall, getBlogApiLang } from "../config.js/SetUp.js";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import MetaHelmet from "../components/Helmet/MetaHelmet.js";

const BlogDetails = () => {
  const { slug, id } = useParams(); 
  const language = useSelector((state) => state.language.language);
  const [blog_details, set_blog_details] = useState([]);
  const [loading, set_loading] = useState(true);
  // Distinct from a slow/failed fetch: this means the API confirmed there is
  // no blog at this id (deleted, or a bad link). Without this, the page fell
  // through to the normal layout with every field blank — HTTP 200, no
  // "not found" messaging, no noindex — so a deleted post's old URL stayed
  // fully indexable forever. This is exactly what happened to the 25 legacy
  // UAE posts removed from the database: Google kept serving their old
  // titles/snippets from cache because nothing on this page ever told it the
  // content was gone.
  const [notFound, set_not_found] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getBlogDetails = () => {
    const url = `${configWeb.GET_BLOG_DETAILS(id)}?lang=${getBlogApiLang(language)}`;

    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_blog_details(res);
          set_not_found(false);
        } else {
          set_not_found(true);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
        set_not_found(true);
      })
      .finally(() => {
        set_loading(false);
      });
  };
  useEffect(() => {
    getBlogDetails();
  }, [language]);
  function formatDate(isoString) {
    const date = new Date(isoString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options)?.format(date);
  }

  // Generate structured data dynamically based on blog details
  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "headline": blog_details?.title || "",
      "image": blog_details?.image || "", // URL to image
      "author": {
        "@type": "Person",
        "name": blog_details?.author || "Unknown Author"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Route Facile",
        "logo": {
          "@type": "ImageObject",
          "url": /* carlogo */ "https://routefacilecarrental.com/assets/images/logo.png"
        }
      },
      "dateModified": "2024-10-23T18:30:00.000Z",
      "datePublished": blog_details?.publish_date || formatDate(new Date()), // Default to today's date if not available
      "description": blog_details?.seo_meta_description || blog_details?.description?.slice(0, 500) 
         };
  };
// Slugify function to convert blog titles into URL-friendly strings — used
// only as a fallback for the handful of legacy posts predating the `slug`
// column; every webhook-authored article already carries its own stored slug.
const slugify = (text) => {
  return text
    ?.toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

// Generate breadcrumb structured data dynamically based on blog details
const generateBreadcrumbsStructuredData = (resolvedSlug) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${configWeb.BASE_WEB_URL}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blogs",
        "item": `${configWeb.BASE_WEB_URL}blogs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog_details?.title || "Blog Details",
        "item": `${configWeb.BASE_WEB_URL}blogs/${resolvedSlug}-${id}`
      }
    ]
  };
};
  
  return (
    // <Helmet title={blog_details?.title}>

<>

{loading ?   <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        >
          {" "}
          <Spinner />
        </div> : notFound ? (
      <section className="">
        <MetaHelmet
          title="Article not found"
          noindex={true}
          canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/blogs`}
        />
        <Container>
          <Row>
            <Col lg="12" md="12" className="text-center py-5">
              <h1 className="section__title mt-4">{"Article not found"}</h1>
              <p className="section__description mb-4">
                {"This article no longer exists. It may have been removed or moved."}
              </p>
              <Link to={`/${language}/blogs`} className="btn-def">
                {"Back to Blog"}
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
        ) :
      <section className="">
      {(() => {
        // Webhook-authored articles carry their own SEO-chosen slug; fall
        // back to a client-derived one only for the legacy posts that predate it.
        const resolvedSlug = blog_details?.slug || slugify(blog_details?.title);
        // A webhook article arrives with pre-built Article + FAQPage JSON-LD
        // (article.schema in the source payload, stored verbatim as
        // schema_json) — render that as-is so the markup Google reads is the
        // markup the SEO routine intended. Hand-built BlogPosting schema is
        // the fallback for posts written directly in the CMS, which have none.
        let engineSchema = null;
        if (blog_details?.schema_json) {
          try {
            engineSchema = JSON.parse(blog_details.schema_json);
          } catch (e) {
            engineSchema = null;
          }
        }
        return (
          <>
      {engineSchema ? (
        Object.values(engineSchema).map((node, index) => (
          <script
            key={`engine-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
          />
        ))
      ) : (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />
      )}
        {/* Structured data for BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBreadcrumbsStructuredData(resolvedSlug)),
          }}
        />
      <MetaHelmet
        title={blog_details?.title}
        description={blog_details?.seo_meta_description || blog_details?.excerpt || blog_details?.description?.slice(0, 500) }
        keywords={blog_details?.seo_meta_tags || "car rental, affordable cars, rent a car"}
        ogTitle={blog_details?.title} /* "For Those Who Want A Taste Of Adventure" */
        ogDescription={blog_details?.seo_meta_description || blog_details?.excerpt || "This is very good blog" }
        ogImage={blog_details?.image || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
        ogUrl={window.location.href}
        twitterTitle={blog_details?.title}
        twitterDescription={blog_details?.seo_meta_description || blog_details?.excerpt || blog_details?.description?.slice(0, 500) }
        twitterImage={blog_details?.image}
        twitterCard="summary_large_image"
        // twitterSite="@YourTwitterHandle"
        // twitterCreator="@AuthorTwitterHandle"
        // Always derived from this site's own /:lang/blogs/:slug-:id route, never
        // from the stored canonical_url: that field carries whatever URL shape
        // the content engine assumed (e.g. "/blog/{slug}", no language prefix),
        // which doesn't match this site's routing and would break the
        // MetaHelmet-derived hreflang set (it reads the language prefix off
        // this exact path).
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/blogs/${resolvedSlug}-${id}`}

      />
          </>
        );
      })()}

        <Container>
          <Row>
            <Col lg="12" md="12">
              <div className="blog__details">
                <img src={blog_details?.image} alt={blog_details?.image_alt || blog_details?.title || ""} className="w-100" />
<div className="blog-padding">
                <h1 className="section__title mt-4">{blog_details?.title}</h1>

                <div className="blog__publisher d-flex align-items-center gap-4 mb-4">
                  <span className="blog__author">
                    <i class="ri-user-line"></i>By {blog_details?.author}
                  </span>

                  <span className=" d-flex align-items-center gap-1 section__description">
                    <i class="ri-calendar-line"></i> {/* {blog_details?.created_at ? formatDate(blog_details?.created_at) : ''} */}Published Date : {blog_details?.publish_date}
                  </span>

                  <span className=" d-flex align-items-center gap-1 section__description">
                    <i class="ri-time-line"></i> {blog_details?.time}
                  </span>
                </div>

            
                <div 
                
                  dangerouslySetInnerHTML={{
                    __html: blog_details?.description,
                  }}
                />
               </div>
              </div>
            </Col>

            {/* <Col lg="4" md="4">
              <div className="recent__post mb-4">
                <h5 className=" fw-bold">Recent Posts</h5>
              </div>
              {blogData?.map((item) => (
                <div className="recent__blog-post mb-4" key={item.id}>
                  <div className="recent__blog-item d-flex gap-3">
                    <img src={item.imgUrl} alt="" className="w-25 rounded-2" />
                    <h6>
                      <Link to={`/blogs/${item.title}`}>{blog?.title}</Link>
                    </h6>
                  </div>
                </div>
              ))}
            </Col> */}
          </Row>
        </Container>
    
      </section>
         
          }   
     </>
    // </Helmet>
  );
  
};



export default BlogDetails;
