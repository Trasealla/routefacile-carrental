import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/account.css";
import { Spinner, Col, Row } from "react-bootstrap";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import { simpleDeleteCallAuth, simpleGetCallAuth } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { useSelector } from "react-redux";
import DocumentPopup from "./DocumentPopup";
import ViewDocumentPopup from "./ViewDocumentPopup";
import AreYouSurePopup from "../../SharedComponent/AreYouSurePopup";
import { useTranslation } from "react-i18next";
const UserDocumentss = ({ user_id }) => {
  const imageFileServer = process.env.REACT_APP_FILE_SERVER;
  const navigate = useNavigate();
  const [showdel, setShowdel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newDocFlag, setNewDocFlag] = useState(false);
  const [showModalDoc, setShowModalDoc] = useState(false);
  const { t } = useTranslation();

  const [isPDF, setIsPDF] = useState(false);
  const [viewDocLink, setViewDocLink] = useState("");
  const [docType, setDocType] = useState("");
  const [drlist, setDrlist] = useState([]);
  const [document_id, set_document_id] = useState(null);
  const [delete_driver_loading, set_delete_driver_loading] = useState(false);

  const handleDelete = () => {
    DeleteUserDocument();
  };
  const handleCloseDel = () => setShowdel(false);

  const language = useSelector((state) => state.language.language);

  const DeleteUserDocument = () => {
    return new Promise((resolve, reject) => {
      const body = {
        id: document_id,
      };
      set_delete_driver_loading(true);
      const url = configWeb.DELETE_USER_DOCUMENTS(document_id);
      simpleDeleteCallAuth(url, JSON.stringify(body))
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Deleted successfully"));
            set_document_id(null);
            getUserDocumentsList();
            resolve(true);
            handleCloseDel();
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_delete_driver_loading(false);
        });
    });
  };

  const getUserDocumentsList = () => {
    console.log("i am triggered");
    const url = configWeb.GET_USER_DOCUMENTS_NEW(user_id);
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setDrlist(res || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  useEffect(() => {
    getUserDocumentsList();
  }, []);

  const handleEditDriver = (doc_type) => {
    setNewDocFlag(false);
    setDocType(doc_type);
    setShowModal(true);
  };
  function isPdfUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.toLowerCase().endsWith("pdf");
    } catch (error) {
      return false;
    }
  }
  const handleViewDocument = (link) => {
    setViewDocLink(link);
    setShowModalDoc(true);
    const isPDF = isPdfUrl(link);
    setIsPDF(isPDF);
  };

  const cancelAdditionalDriver = () => {
    setNewDocFlag(true);
    setShowModal(true);
  };

  const handleDeleteDriver = (id) => {
    setShowdel(true);
    set_document_id(id);
  };

  const handleViewUploadDocuments = (id) => {
    navigate(`/${language}/MyAccount/DiverDocuments/${id}`);
  };

  function formatDocumentName(str) {
    return str
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  }
  return (
    <div className="row align-items-start border rounded-3 p-2  shadow">
      <div className="col-6">
        <h3 className="additional-driver text-nowrap">{t("DOCUMENTS")}</h3>
      </div>
      <div className="col-6 d-flex justify-content-end align-items-center">
        <button className="defButtonAddnew" onClick={cancelAdditionalDriver}>
          {t("Add New Document")}
        </button>
      </div>

      <div className="row mt-3">
        <div className="row" style={{ margin: "auto" }}>
          <table className="table table-bordered table-responsive additional-table text-center ">
            <thead>
              <tr>
                <td>{t("Name")}</td>
                <td>{t("Document")}</td>
                {/* <td>Back Image</td> */}
                <td>{t("Action")}</td>
              </tr>
            </thead>
            <tbody>
              {drlist?.length > 0 &&
                drlist?.map((item, index) => (
                  <tr key={item.id}>
                    <td>{t(formatDocumentName(item.doc_type))}</td>

                    <td>
                      <spna
                        className="view-doc-txt"
                        onClick={() => handleViewDocument(item.front_image)}
                      >
                        {t("View Document")}
                      </spna>{" "}
                    </td>
                    {/* <td>
                      <spna
                        className="view-doc-txt"
                        onClick={() => handleViewDocument(item.back_image)}
                      >
                        View Document
                      </spna>
                    </td> */}
                    <td>
                      <button
                        className="btn btn-outline-warning"
                        style={{ scale: "0.8" }}
                        onClick={() => handleEditDriver(item.doc_type)}
                      >
                        {t("Update")}
                      </button>
                      <button
                        className="defButton-- btn btn-outline-danger mx-2"
                        style={{ scale: "0.8" }}
                        onClick={() => handleDeleteDriver(item.id)}
                      >
                        {" "}
                        {/* {delete_driver_loading && document_id === item.id ? (
                          <Spinner />
                        ) : ( */}
                        {t("Delete")}
                        {/* )} */}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <DocumentPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        docType={docType}
        user_id={user_id}
        newDocFlag={newDocFlag}
        getUserDocumentsList={getUserDocumentsList}
      />
      <ViewDocumentPopup
        show={showModalDoc}
        handleClose={() => setShowModalDoc(false)}
        link={viewDocLink}
        isPDF={isPDF}
      />
      <AreYouSurePopup
        showdel={showdel}
        handleCloseDel={handleCloseDel}
        title="Delete Document"
        body="Are you sure you want to delete this ?"
        handleDelete={handleDelete}
        loading={delete_driver_loading}
        btnTxt="Delete"
      />
    </div>
  );
};

export default UserDocumentss;
