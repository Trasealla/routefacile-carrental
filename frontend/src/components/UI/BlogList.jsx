

import React from "react";
import { useState, useEffect } from "react";
import { Col } from "reactstrap";
import "../../styles/blog-item.css";
import { Link } from "react-router-dom";
import blogData from "../../assets/data/blogData";
import { useSelector } from "react-redux";
import { slugify } from "../../SharedComponent/reusableFunctions";
import { useTranslation } from "react-i18next";

const BlogList = (props) => {
  const { blog_list_array, blog_image_path } = props;
  // Iconify is only used on the blog — load its script here rather than on every page.
  useEffect(() => {
    if (!document.querySelector("script[data-iconify]")) {
      const s = document.createElement("script");
      s.src = "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";
      s.async = true;
      s.setAttribute("data-iconify", "true");
      document.body.appendChild(s);
    }
  }, []);
  return (
    <>
      {/* {blogData.map((item) => ( */}
      {blog_list_array?.map((item) => (
        <BlogItem item={item} key={item.id} blog_image_path={blog_image_path} />
      ))}
    </>
  );
};

const BlogItem = ({ item, blog_image_path }) => {
  const language = useSelector((state) => state.language.language);

  // const { imgUrl, title, comments, date, description, likes } = item;
  const truncateHtmlContent = (htmlContent, limit) => {
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    const text = div.textContent || div.innerText || "";
    return text.length > limit ? text.substr(0, limit) + "..." : text;
  };

  const [truncatedDescription, setTruncatedDescription] = useState("");

  useEffect(() => {
    if (item?.description) {
      setTruncatedDescription(truncateHtmlContent(item.description, 100));
    }
  }, [item]);

  const { t } = useTranslation();

  return (
    <Col lg="4" md="6" sm="6" className="mb-5">
      <div className="blog__item">
        <img
          src={item?.image}
          alt={item.title}
          className="w-100  h-100-"
          height={150}
        />
        <div className="blog__info p-3">
          {/* <Link to={`/blogs/${item?.id}`} className="blog__title"> */}
          <Link
            to={`/${language}/blogs/${item?.slug || slugify(item.title)}-${item.id}`}
            className="blog__title"
          >
            {/* {title} */}
            {item?.title}
          </Link>
          {/* <p className="section__description mt-3">
           
            {item?.description.length > 100
              ? item?.description.substr(0, 100)
              : item?.description}
             
          </p> */}
          <div className="">
            <p className="section__description mt-3">
              <span
                style={{ fontSize: "18px", lineHeight: "1.5" }}
                dangerouslySetInnerHTML={{ __html: truncatedDescription }}
              />
            </p>
          </div>

          <Link
            to={`/${language}/blogs/${slugify(item.title)}-${item.id}`}
            className="read__more"
          >
            {t("Read more")}
          </Link>

          {/* <div className="blog__time pt-3 mt-3 d-flex align-items-center justify-content-between">
            <span className=" d-flex align-items-center gap-1 section__description">
              <i class="ri-calendar-line"></i> {date}
            </span>

            <div className=" d-flex align-items-center gap-3">
              <span className="section__description">
                <iconify-icon icon="fa:comments" /> {comments}
              </span>

              <span className=" d-flex align-items-center gap-1 section__description">
                <iconify-icon icon="icon-park-outline:like" />
                {likes}
              </span>
            </div>
          </div> */}
        </div>
      </div>
    </Col>
  );
};

export default BlogList;
