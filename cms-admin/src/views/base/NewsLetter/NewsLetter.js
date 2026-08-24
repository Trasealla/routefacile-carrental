import React from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import Table from 'react-bootstrap/Table'
import { useTranslation } from 'react-i18next'

const NewsLetter = () => {
  const { t } = useTranslation()
  return (
    <Row className="py-3">
      <Row className="mb-3">
        <Col xs="12" sm="12" md="6" lg="4">
          <Form.Group className="mb-3">
            <Form.Label>{t('Email')}</Form.Label>
            <Form.Control type="email" placeholder={t('enter email')} />
          </Form.Group>
        </Col>
        <Col xs="12" sm="12" md="6" lg="4">
          <Form.Label>{t('Status')}</Form.Label>
          <Form.Select aria-label="Default select example">
            <option>{t('Open this select menu')}</option>
            <option value="1">{t('One')}</option>
            <option value="2">{t('Two')}</option>
            <option value="3">{t('Three')}</option>
          </Form.Select>
        </Col>
        <Col xs="2" sm="2" md="2" lg="2" className="mt-auto mb-3 ">
          <div className="d-flex mt-3 mt-lg-0">
            <Button className='btn-def'>{t('Search')}</Button>
            <Button className="btn-def mx-3">{t('Export')}</Button>
          </div>
        </Col>
      </Row>

      <Table className="table table-responsive">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{t('Email')}</th>
            <th scope="col">{t('Add Date')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td scope="row">1</td>
            <td>Mark</td>
            <td>Otto</td>
          </tr>
        </tbody>
      </Table>
    </Row>
  )
}

export default NewsLetter
