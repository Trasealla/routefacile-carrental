import React, { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { ImBin } from "react-icons/im";
import { LuClipboardPen } from "react-icons/lu";
import { useTranslation } from "react-i18next";
const Tag = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [showdel, setShowdel] = useState(false);
  const [showdcat, setShowdcat] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCloseDel = () => setShowdel(false);
  const handleShowDel = () => setShowdel(true);

  const handleCloseCat = () => setShowdcat(false);
  const handleShowCat = () => setShowdcat(true);
  return (
    <Container>
      <Row className="justify-content-between">
        <Row>
          <Col
            lg="12"
            className="mt-2 d-flex justify-content-end align-items-center"
          >
            <Button className="btn-def" onClick={handleShowCat}>
              {t("Add Tag")}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col lg="4">
            <Form.Group className="mb-3">
              <Form.Label>{t("Status")}</Form.Label>
              <Form.Select aria-label="Default select example">
                <option>{t("Open this select menu")}</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col className="mt-auto mb-3">
            <Button className="btn-def ">{t("Search")}</Button>
          </Col>
        </Row>
        <Col>
          <Table className="table table-responsive">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{t("Tag Name (en)")}</th>
                <th scope="col">{t("Tag Name (ar)")}</th>
                <th scope="col">{t("Status")}</th>
                <th scope="col">{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td scope="row">1</td>
                <td>Mark</td>
                <td>Otto</td>
                <td>
                  <Button className="btn-def" size="sm">
                    {t("Active")}
                  </Button>
                </td>
                <td>
                  <LuClipboardPen onClick={handleShow} className="me-2" />
                  <ImBin onClick={handleShowDel} />
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t("Tag")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t("Tag Name (English)")}</Form.Label>
            <Form.Control type="text" placeholder={t("enter email")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("Tag Name (Arabic)")}</Form.Label>
            <Form.Control type="text" placeholder={t("enter email")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("Status")}</Form.Label>
            <Form.Select>
              <option>{t("Active")}</option>
              <option>{t("Inactive")}</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-def" onClick={handleClose}>
            {t("Save Changes")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showdel} onHide={handleCloseDel}>
        <Modal.Header closeButton>
          <Modal.Title>{t("Tag")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("Are you sure you want to delete this entry ?")}</Modal.Body>
        <Modal.Footer>
          <Button className="btn-def" onClick={handleClose}>
            {t("OK")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showdcat} onHide={handleCloseCat}>
        <Modal.Header closeButton>
          <Modal.Title>{t("Tag")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t("Tag Name (English)")}</Form.Label>
            <Form.Control type="text" placeholder={t("enter email")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("Tag Name (Arabic)")}</Form.Label>
            <Form.Control type="text" placeholder={t("enter email")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("Status")}</Form.Label>
            <Form.Select>
              <option>{t("Active")}</option>
              <option>{t("Inactive")}</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-def" onClick={handleCloseCat}>
            {t("Save Changes")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Tag;
