import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ImBin } from "react-icons/im";
import { LuClipboardPen } from "react-icons/lu";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
} from "../../../components/config.js/Setup";
import {
  notifyError,
  notifySuccess,
} from "../../../components/notify/notify";
import configWeb from "../../../components/config.js/ConfigWeb";

const Post = () => {
  const { t } = useTranslation();
  const imageFileServer = (process.env.REACT_APP_FILE_SERVER || "").replace(/\/*$/, "/");
  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blogListArray, setBlogListArray] = useState([]);
  const [showdel, setShowdel] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleCloseDel = () => setShowdel(false);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculatePaginationMessage = () => {
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);
    return t("common.showEntries", { start: startRecord, end: endRecord, total: totalRecords });
  };

  const getBlogList = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("page_size", pageSize);

    const url = `${configWeb.GET_BLOG_LIST}?${params.toString()}`;
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setBlogListArray(res?.data || []);
          setTotalRecords(res?.total_records || 0);
        } else {
          setBlogListArray([]);
          setTotalRecords(0);
        }
      })
      .catch((error) => {
        notifyError(t("common.somethingWentWrongTryAgain"));
        setBlogListArray([]);
        setTotalRecords(0);
      })
      .finally(() => {
        setLoading(false);
        handleCloseDel();
      });
  };

  useEffect(() => {
    getBlogList();
  }, [currentPage, pageSize]);

  const deleteBlog = (id) => {
    setDeleteLoading(true);
    const url = configWeb.DELETE_BLOG(id);
    simpleDeleteCallAuth(url)
      .then((res) => {
        const failed = !!res?.error || Number(res?.statusCode) >= 400;

        if (!failed) {
          notifySuccess(t("common.deletedSuccessfully"));
          getBlogList();
          return;
        }

        const detail = Array.isArray(res?.message)
          ? res.message[0]
          : res?.message || t("common.somethingWentWrongTryAgain");
        notifyError(detail);
      })
      .catch((error) => {
        notifyError(t("common.somethingWentWrongTryAgain"));
      })
      .finally(() => {
        setDeleteLoading(false);
        handleCloseDel();
      });
  };

  const handleDelete = () => {
    deleteBlog(deleteID);
  };

  const handleEdit = (id) => {
    navigate(`/blog/edit-blog/${id}`);
  };

  const handleShowDel = (id) => {
    setDeleteID(id);
    setShowdel(true);
  };

  return (
    <Container className="rf-list-page">
      <div className="rf-page-header">
        <div className="rf-page-heading">
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {t("blog.title")}
          </h3>
          <p className="rf-page-sub">{calculatePaginationMessage()}</p>
        </div>
        <Link to="/blog/add-blog">
          <Button className="rf-add-btn">
            <span className="rf-add-plus">+</span> {t("blog.add")}
          </Button>
        </Link>
      </div>

      <Col>
        <div className="rf-table-wrap">
          <Table className="rf-table" style={{ whiteSpace: "nowrap" }}>
            <thead>
              <tr>
                <th width="8%" scope="col">#</th>
                <th width="18%" scope="col">{t("common.image")}</th>
                <th width="26%" scope="col">{t("blog.titleEnglish")}</th>
                <th width="14%" scope="col">{t("blog.source")}</th>
                <th width="14%" scope="col">{t("common.status")}</th>
                <th width="20%" scope="col" style={{ paddingRight: "30px" }}>
                  {t("common.action")}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="text-center" colSpan={100}>
                    <Spinner />
                  </td>
                </tr>
              ) : (
                Array.isArray(blogListArray) &&
                blogListArray.length > 0 &&
                blogListArray.map((item) => (
                  <tr key={item.id}>
                    <td scope="row">{item.id}</td>
                    <td className="text-center">
                      {item?.image ? (
                        <div className="car-listing-img-div">
                          <img
                            className="car-listing-img"
                            src={`${imageFileServer}admin/blog/${item.image}`}
                            alt={item?.image_alt || item.title_en}
                          />
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{item?.title_en}</td>
                    <td>
                      {item?.source === "searchatlas"
                        ? "SearchAtlas"
                        : t("blog.sourceManual")}
                    </td>
                    <td className="text-center">
                      <div
                        className={`px-4 py-2 font-size-14px ${item.status ? "active_box" : "inactive_box"}`}
                      >
                        {item.status ? t("blog.published") : t("blog.draft")}
                      </div>
                    </td>
                    <td>
                      <LuClipboardPen
                        onClick={() => handleEdit(item.id)}
                        className="me-4"
                        style={{
                          cursor: "pointer",
                          height: "1.5em",
                          width: "1.5em",
                          stroke: "orange",
                        }}
                      />
                      <ImBin
                        onClick={() => handleShowDel(item.id)}
                        style={{
                          cursor: "pointer",
                          height: "1.5em",
                          width: "1.5em",
                          fill: "#ff6b6b",
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
              {blogListArray?.length === 0 && !loading && (
                <tr className="text-center">
                  <td colSpan={100}>{t("common.noData")}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <CustomPagination
            recordsPerPage={pageSize}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
          <Col lg="2">
            <Form.Group className="mb-3">
              <Form.Select
                aria-label="Default select example"
                name="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </div>
      </Col>

      <Modal show={showdel} onHide={handleCloseDel}>
        <Modal.Header closeButton>
          <Modal.Title>{t("blog.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("Are you sure you want to delete this entry ?")}</Modal.Body>
        <Modal.Footer>
          <Button className="btn-def" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner size="sm" /> : t("common.delete")}
          </Button>
          <Button className="btn-def" onClick={handleCloseDel}>
            {t("common.cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Post;
