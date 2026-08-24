import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
// import { Viewer, Worker } from "@react-pdf-viewer/core";
// import "@react-pdf-viewer/core/lib/styles/index.css";


const ViewDocumentPopup = ({ show, handleClose, link, isPDF }) => {
  const { t } = useTranslation();
  return (
    <Modal size="lg" show={show} onHide={handleClose} centered>
      <Modal.Header closeButton dir='ltr' >
        <Modal.Title>{t("View Document")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="view-document-container">
       
        
          {isPDF ? (
    //        <iframe
    //   src={link}
    //   className="view-doc-img"
    // />
  //   <Worker
  //   workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
  // >
  //   <Viewer fileUrl={link} /* fileUrl="http://www.pdf995.com/samples/pdf.pdf" */ />
  // </Worker>
   <object data={link} type="application/pdf" width="100%" height="600px">
  <p>Your browser does not support PDFs. <a href={link} target="_blank">Download it instead</a>.</p>
</object>
//  <a href={link}target="_blank" rel="noopener noreferrer"/> 
 

    ) : (   <img className="view-doc-img" src={link} alt="img not found" />)}
    
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ViewDocumentPopup;
