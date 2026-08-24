import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomPagination from "../../../../components/CustomPagination/CustomPagination";
import { ImBin } from "react-icons/im";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
} from "../../../../components/config.js/Setup";
import {
  notifyError,
  notifySuccess,
} from "../../../../components/notify/notify";
import configWeb from "../../../../components/config.js/ConfigWeb";
import { LuClipboardPen } from "react-icons/lu";
import listingCarExample from "../../../../assets/images/listingcarexample.png";

const Cardatabase = () => {
  const { t } = useTranslation();
  const imageFileServer = (process.env.REACT_APP_FILE_SERVER || "").replace(/\/*$/, "/");

  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationListArray, setLocationListArray] = useState([]);
  const [showdel, setShowdel] = useState(false);
  const navigate = useNavigate();
  const [deleteID, setDeleteID] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [carName, setCarName] = useState("");
  const [carGroup, setCarGroup] = useState("");
  const [carGroupArray, setCarGroupArray] = useState([]);
  const [carCartegoryArray, setCarCartegoryArray] = useState([]);

  const handleCloseDel = () => setShowdel(false);

  // Call this function whenever pageSize changes to update currentPage if necessary
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate the pagination message based on the current values
  const calculatePaginationMessage = () => {
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);
    return t("common.showEntries", { start: startRecord, end: endRecord, total: totalRecords });
  };

  const getCouponList = () => {
    setLoading(true);
    const body = JSON.stringify({});
    const params = new URLSearchParams();
    if (carName) params.append("name_en", carName);
    if (category) params.append("category_id", category);
    if (carGroup) params.append("group_id", carGroup);

    params.append("page", currentPage);
    params.append("page_size", pageSize);

    const url = `${configWeb.GET_CAR_LIST}?${params.toString()}`;
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setLocationListArray(res?.data || []);
          setTotalRecords(res?.total_records || 0);
        } else {
          setLocationListArray([]);
          setTotalRecords(0);
        }
      })
      .catch((error) => {
        notifyError("Something went wrong, please try again later");
        setLocationListArray([]);
        setTotalRecords(0);
      })
      .finally(() => {
        setLoading(false);
        handleCloseDel();
      });
  };

  useEffect(() => {
    getCouponList();
  }, [currentPage, pageSize]);

  const deleteLocation = (id) => {
    return new Promise((resolve, reject) => {
      setDeleteLoading(true);
      const url = configWeb.DELETE_CAR(id);
      simpleDeleteCallAuth(url)
        .then((res) => {
          // Treat "no error" as success rather than requiring an exact
          // status string. The delete really did happen server-side while this
          // branch matched nothing, so the row stayed on screen, no toast
          // appeared, and the operator clicked Delete again — which then failed
          // with 404 "Car not found" on the row they had already removed.
          const failed = !!res?.error || Number(res?.statusCode) >= 400;

          if (!failed) {
            notifySuccess("Deleted Successfully");
            getCouponList();
            resolve(true);
            return;
          }

          // Nest returns `message` as a string for a single error and an array
          // for validation failures; indexing blindly turned "Car not found"
          // into the letter "C".
          const detail = Array.isArray(res?.message)
            ? res.message[0]
            : res?.message || "Delete failed. Please try again.";
          notifyError(detail);
          resolve(false);
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError("Something went wrong. Please try again letter.");
          resolve(false);
        })
        .finally(() => {
          setDeleteLoading(false);
          handleCloseDel();
        });
    });
  };

  const handleDelete = () => {
    deleteLocation(deleteID);
  };

  const handleEdit = (id) => {
    navigate(`/car/edit-car/${id}`);
  };
  const handleShowDel = (id) => {
    setDeleteID(id);
    setShowdel(true);
  };
  const handleSearchList = () => {
    setCurrentPage(1);

    getCouponList();
  };

  const carGroupData = () => {
    const url = `${configWeb.GET_CAR_GROUPS}?page_size=9999`;

    simpleGetCallAuth(url)
      .then((res) => {
        setCarGroupArray(res?.data || []);
      })
      .catch((errr) => {
        console.log("errr", errr);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  const carCategoryData = () => {
    const url = `${configWeb.GET_CAR_CATEGORIES}?page_size=9999`;

    simpleGetCallAuth(url)
      .then((res) => {
        setCarCartegoryArray(res?.data || []);
      })
      .catch((errr) => {
        console.log("errr", errr);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  useEffect(() => {
    carGroupData();
    carCategoryData();
  }, []);
  return (
    <Container className="rf-list-page">
      <div className="rf-page-header">
        <div className="rf-page-heading">
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {t("cars.title")}
          </h3>
          <p className="rf-page-sub">{calculatePaginationMessage()}</p>
        </div>
        <Link to="/car/create-car">
          <Button className="rf-add-btn">
            <span className="rf-add-plus">+</span> {t("cars.add")}
          </Button>
        </Link>
      </div>

      <Row className="rf-filter-card mt-2 mb-4">
        <Col lg="2">
          <Form.Group className="mb-3">
            <Form.Label>{t("common.carName")}</Form.Label>
            <Form.Control
              aria-label="Default select example"
              type="text"
              name="carName"
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col lg="2">
          <Form.Group className="mb-3">
            <Form.Label>{t("common.category")}</Form.Label>
            <Form.Select
              aria-label="Default select example"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t("common.all")}</option>
              {carCartegoryArray?.map((item) => (
                <option key={item.id} value={item.id}>
                  {" "}
                  {item.name_en}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col lg="2">
          <Form.Group className="mb-3">
            <Form.Label>{t("common.group")}</Form.Label>
            <Form.Select
              aria-label="Default select example"
              name="carGroup"
              value={carGroup}
              onChange={(e) => setCarGroup(e.target.value)}
            >
              <option value="">{t("common.all")}</option>
              {carGroupArray?.length > 0 &&
                carGroupArray?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name_en}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col className="mt-auto mb-3">
          <Button className="rf-add-btn" type="button" onClick={handleSearchList}>
            Search
          </Button>
        </Col>
      </Row>

      <Col>
        <div className="rf-table-wrap">
        <Table
          className="rf-table"
          style={{ whiteSpace: "nowrap" }}
        >
          <thead className="">
            <tr>
              <th width="10%" scope="col">
                #
              </th>
              <th width="30%" scope="col">
                {t("common.image")}
              </th>
              {/* <th scope="col" >
              Address
              </th> */}
              <th width="20%" scope="col">
                {t("common.carName")}
              </th>
              <th width="20%" scope="col">
                {t("common.status")}
              </th>

              <th width="20%" scope="col" style={{ paddingRight: "30px" }}>
                {t("common.action")}
              </th>
            </tr>
          </thead>

          <tbody className="">
            {loading ? (
              <tr>
                <td className="text-center" colSpan={100}>
                  {" "}
                  <Spinner />
                </td>{" "}
              </tr>
            ) : (
              Array.isArray(locationListArray) &&
              locationListArray?.length > 0 &&
              locationListArray?.map((item, index) => (
                <tr key={item.id}>
                  <td scope="row">{item.id}</td>
                  <td className="text-center">
                    <div className="car-listing-img-div">
                      <img
                        className="car-listing-img"
                        src={`${imageFileServer}admin/car/car/${item?.image}`}
                        /* src={listingCarExample} */ alt={item.name_en}
                      />
                    </div>
                  </td>
                  <td>{item?.name_en}</td>
                  <td className="text-center">
                    <div
                      className={`px-4 py-2 font-size-14px ${item.status ? "active_box" : "inactive_box"}`}
                    >
                      {item.status ? t("common.active") : t("common.inactive")}
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
            {locationListArray?.length === 0 && !loading && (
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
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </div>
      </Col>
      <Modal show={showdel} onHide={handleCloseDel}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Car !</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this car ?</Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-def"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner /> : "Delete"}
          </Button>
          <Button className="btn-def" onClick={handleCloseDel}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Cardatabase;
