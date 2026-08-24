import React from "react";
import { Modal } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const ViewDocumentPopup = ({
  show,
  handleClose,
  link,
  isPDF,
  documentName,
}) => {
  const { t } = useTranslation();
  return (
    <Modal size="lg" show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{documentName} {" "} <a href={link} target="_blank" download title={t("Download")}><FaDownload /></a></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="view-document-container">
          {true ? (
            <object
              data={link}
              type="application/pdf"
              width="100%"
              height="600px"
            >
              <p>
                {t("Failed to load PDF.")}{" "}
                <a href={link} target="_blank" rel="noreferrer">
                  {t("View it in another tab.")}
                </a>
                .
              </p>
            </object>
          ) : (
            <img className="view-doc-img" src={link} alt={t("img not found")} />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ViewDocumentPopup;
