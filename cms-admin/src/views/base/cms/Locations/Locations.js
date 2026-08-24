import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
  InputGroup,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomPagination from "../../../../components/CustomPagination/CustomPagination";
import { LuClipboardPen } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
} from "../../../../components/config.js/Setup";
import {
  notifyError,
  notifySuccess,
} from "../../../../components/notify/notify";
import configWeb from "../../../../components/config.js/ConfigWeb";
import { IoFilter, IoAdd } from "react-icons/io5";
import "./Locations.css";

const LocationList = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [locationListArray, setLocationListArray] = useState([]);
  const [showdel, setShowdel] = useState(false);
  const navigate = useNavigate();
  const [deleteID, setDeleteID] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [virtualFilter, setVirtualFilter] = useState(null); // null = all, true = virtual, false = non-virtual
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleCloseDel = () => setShowdel(false);


  const getCouponList = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", 1);
    params.append("page_size", 1000);
    
    // Add virtual filter if selected
    if (virtualFilter !== null) {
      params.append("is_virtual", virtualFilter);
    }

    const url = `${configWeb.GET_LOCATION_LIST}?${params.toString()}`;
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setLocationListArray(res?.data || []);
        } else {
          setLocationListArray([]);
        }
      })
      .catch((error) => {
        notifyError(t("common.somethingWentWrong"));
        setLocationListArray([]);
      })
      .finally(() => {
        setLoading(false);
        handleCloseDel();
      });
  };

  useEffect(() => {
    getCouponList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualFilter]);

  const deleteLocation = (id) => {
    return new Promise((resolve, reject) => {
      setDeleteLoading(true);
      const url = configWeb.DELETE_DISCOUNT_COUPON(id);
      simpleDeleteCallAuth(url)
        .then((res) => {
          if (res?.status === "success") {
            notifySuccess(t("common.deletedSuccessfully"));

            getCouponList();
            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError(t("common.somethingWentWrongTryAgain"));
          resolve(false);
        })
        .finally(() => {
          setDeleteLoading(false);
        });
    });
  };


  const handleEdit = (row) => {
    navigate(`/cms/edit-location/${row.id}`);
  };

  const handleVirtualFilterChange = (value) => {
    setVirtualFilter(value);
  };

  const handleDelete = (row) => {
    setDeleteID(row.id);
    setShowdel(true);
  };

  const confirmDelete = () => {
    if (deleteID) {
      deleteLocation(deleteID);
    }
  };

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = [...locationListArray];
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        (item.name_en && item.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.name_ar && item.name_ar.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.timing_detail_en && item.timing_detail_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.timing_detail_ar && item.timing_detail_ar.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.id && String(item.id).includes(searchTerm))
      );
    }
    
    return filtered;
  }, [locationListArray, searchTerm]);

  // Pagination
  const totalRecords = filteredData.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, virtualFilter]);

  return (
    <Container>
      <Row>
        <Col
          lg="12"
          className="mt-4 d-flex justify-content-end align-items-center gap-3"
        >
          <div className="virtual-filter-container">
            <IoFilter className="filter-icon" />
            <span className="filter-label">{t("locationsList.filter")}</span>
            <button
              className={`filter-btn ${virtualFilter === null ? 'active' : ''}`}
              onClick={() => handleVirtualFilterChange(null)}
              title={t("locationsList.allLocationsTitle")}
            >
              {t("locationsList.all")}
            </button>
            <button
              className={`filter-btn ${virtualFilter === true ? 'active virtual-active' : ''}`}
              onClick={() => handleVirtualFilterChange(true)}
              title={t("locationsList.virtualLocationsTitle")}
            >
              {t("locationsList.virtual")}
            </button>
            <button
              className={`filter-btn ${virtualFilter === false ? 'active non-virtual-active' : ''}`}
              onClick={() => handleVirtualFilterChange(false)}
              title={t("locationsList.nonVirtualLocationsTitle")}
            >
              {t("locationsList.nonVirtual")}
            </button>
          </div>
          <Link to="/cms/create-location" className="fab-button-link">
            <button className="fab-button" title={t("locationsList.addLocation")}>
              <IoAdd className="fab-icon" />
            </button>
          </Link>
        </Col>
      </Row>

      <Col className="w-100">
        {/* Search Bar */}
        <Row className="mb-3">
          <Col lg="4">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={t("locationsList.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col lg="2" className="d-flex align-items-center">
            <div className="d-flex align-items-center">
              <span className="me-2">{t("common.show")}</span>
              <Form.Select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{ width: '80px' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
              <span className="ms-2">{t("common.entries")}</span>
            </div>
          </Col>
        </Row>

        {/* Table */}
        <div className="table-responsive">
          <Table striped bordered hover className="w-100">
            <thead className="table-light">
              <tr>
                <th>{t("locationsList.colId")}</th>
                <th>{t("locationsList.colName")}</th>
                <th>{t("locationsList.colTiming")}</th>
                <th>{t("locationsList.colStatus")}</th>
                <th>{t("locationsList.colIsVirtual")}</th>
                <th>{t("locationsList.colAction")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <div>{row.name_en || ""}</div>
                      <div>{row.name_ar || ""}</div>
                    </td>
                    <td>
                      <div>{row.timing_detail_en || ""}</div>
                      <div>{row.timing_detail_ar || ""}</div>
                    </td>
                    <td className="text-center">
                      <div className={`px-4 py-2 font-size-14px text-center ${row.status ? "active_box" : "inactive_box"}`}>
                        {row.status ? t("common.active") : t("common.inactive")}
                      </div>
                    </td>
                    <td className="text-center">{row.is_virtual ? t("locationsList.yes") : t("locationsList.no")}</td>
                    <td className="text-center">
                      <LuClipboardPen
                        onClick={() => handleEdit(row)}
                        style={{
                          cursor: 'pointer',
                          height: '1.5em',
                          width: '1.5em',
                          stroke: 'orange',
                        }}
                        title={t("common.edit")}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && totalRecords > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              {t("common.showing")} {startIndex + 1} {t("common.to")} {Math.min(startIndex + pageSize, totalRecords)} {t("common.of")} {totalRecords} {t("common.entries")}
            </div>
            <CustomPagination
              recordsPerPage={pageSize}
              totalRecords={totalRecords}
              onPageChange={handlePageChange}
              currentPage={currentPage}
            />
          </div>
        )}
      </Col>
      <Modal show={showdel} onHide={handleCloseDel}>
        <Modal.Header closeButton>
          <Modal.Title>{t("locationsList.deleteTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("locationsList.deleteConfirm")}</Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-def"
            onClick={confirmDelete}
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

export default LocationList;
