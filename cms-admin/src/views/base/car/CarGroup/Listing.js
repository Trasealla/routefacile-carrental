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
import { Link, useNavigate, useParams } from "react-router-dom";
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

const Listing = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [carGroupListArray, setCarGroupListArray] = useState([]);
  const [showdel, setShowdel] = useState(false);
  const navigate = useNavigate();
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
    return `${t("common.showing")} ${startRecord} ${t("common.to")} ${endRecord} ${t("common.of")} ${totalRecords} ${t("common.entries")}`;
  };

  const getCarGroupList = () => {
    setLoading(true);
    const body = JSON.stringify({});
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("page_size", pageSize);

    const url = `${configWeb.GET_CAR_GROUP_LIST}?${params.toString()}`;
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setCarGroupListArray(res?.data || []);
          setTotalRecords(res?.total_records || 0);
        } else {
          setCarGroupListArray([]);
          setTotalRecords(0);
        }
      })
      .catch((error) => {
        notifyError(t("common.somethingWentWrong"));
        setCarGroupListArray([]);
        setTotalRecords(0);
      })
      .finally(() => {
        setLoading(false);
        handleCloseDel();
      });
  };

  useEffect(() => {
    getCarGroupList();
  }, [currentPage, pageSize]);

  const deleteCarGroup = (id) => {
    return new Promise((resolve, reject) => {
      setDeleteLoading(true);
      const url = configWeb.DELETE_CAR_GROUP(id);
      simpleDeleteCallAuth(url)
        .then((res) => {
          if (res?.status === "success") {
            notifySuccess(t("common.deletedSuccessfully"));

            getCarGroupList();
            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError(t("common.somethingWentWrong"));
          resolve(false);
        })
        .finally(() => {
          setDeleteLoading(false);
          handleCloseDel();
        });
    });
  };

  const handleDelete = () => {
    deleteCarGroup(deleteID);
  };

  const handleEdit = (id) => {
    navigate(`/car/edit-group/${id}`);
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
            <span className="rf-title-bar" /> {t("carGroup.title")}
          </h3>
          <p className="rf-page-sub">{calculatePaginationMessage()}</p>
        </div>
        <Link to="/car/create-group">
          <Button className="rf-add-btn">
            <span className="rf-add-plus">+</span> {t("carGroup.addButton")}
          </Button>
        </Link>
      </div>

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
                {t("common.name")}
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
              Array.isArray(carGroupListArray) &&
              carGroupListArray?.length > 0 &&
              carGroupListArray?.map((item, index) => (
                <tr key={item.id}>
                  <td scope="row">{item.id}</td>
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
            {carGroupListArray?.length === 0 && !loading && (
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
          <Modal.Title>{t("carGroup.deleteConfirmTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("carGroup.deleteConfirmBody")}</Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-def"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner /> : t("common.delete")}
          </Button>
          <Button className="btn-def" onClick={handleCloseDel}>
            {t("common.cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Listing;
