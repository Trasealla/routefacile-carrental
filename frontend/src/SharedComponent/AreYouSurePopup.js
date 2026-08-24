import React from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { useTranslation } from "react-i18next";

const AreYouSurePopup = ({showdel,handleCloseDel,title,body,handleDelete,loading,btnTxt}) => {
  const { t } = useTranslation();
  return (
    <Modal show={showdel} onHide={handleCloseDel}>
    <Modal.Header closeButton dir='ltr'>
      <Modal.Title>{t(title)} !</Modal.Title>
    </Modal.Header>
    <Modal.Body>{t(body)}</Modal.Body>
    <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseDel}>
        {t("Cancel")}
      </Button>
      <button
       className="enquire-btn-chauffeur"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? <Spinner /> : t(btnTxt)}
      </button>
     
    </Modal.Footer>
  </Modal>
  )
}

export default AreYouSurePopup