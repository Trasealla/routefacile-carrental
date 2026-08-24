import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import '../../styles/booking-report.css';
import logo from '../../assets/new-logo/Car Rental Platform Logos/logo-1009_191.png';
import configWeb from '../../config.js/configWeb';
import Helmet from '../../components/Helmet/Helmet';
import { ensureArabicFontLoaded, drawArabicText } from './pdfArabicHelper';

const ENUM_LABELS = {
  daily: 'Daily',
  monthly: 'Monthly',
  self: 'Self',
  delivery: 'Delivery',
  collection: 'Collection',
  now: 'Pay Now',
  later: 'Pay Later',
};

const BookingReport = () => {
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const isArabic = language === 'ar' || language === 'ae';
  const dateLocale = isArabic ? 'ar-MA-u-nu-latn' : language === 'fr' ? 'fr-FR' : 'en-US';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [bookingId, setBookingId] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const handleSearchClick = () => {
    if (!bookingId.trim()) {
      setError(t('Please enter a booking ID'));
      return;
    }
    setShowVerificationModal(true);
    setVerificationEmail('');
    setVerificationError('');
  };

  const handleVerification = () => {
    if (!verificationEmail.trim()) {
      setVerificationError(t('Please enter your email address'));
      return;
    }

    if (!verificationEmail.includes('@routefacilecarrental.com')) {
      setVerificationError(t('Email must contain @routefacilecarrental.com'));
      return;
    }

    setShowVerificationModal(false);
    setVerificationError('');
    fetchBookingData();
  };

  const fetchBookingData = async () => {
    setLoading(true);
    setError('');
    setBookingData(null);

    try {
      const response = await axios.get(
        `${configWeb.BASE_URL}booking/by-number/${bookingId}`
      );

      if (response.data.success) {
        setBookingData(response.data.data);
      } else {
        setError(t('Failed to fetch booking data'));
      }
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to fetch booking data. Please check the booking ID.'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('N/A');
    return new Date(dateString).toLocaleString(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return t('N/A');
    return `MAD ${parseFloat(amount).toFixed(2)}`;
  };

  const translateEnum = (value) => {
    if (!value) return t('N/A');
    const label = ENUM_LABELS[String(value).toLowerCase()];
    return label ? t(label) : String(value).toUpperCase();
  };

  const formatDocumentType = (type) => {
    if (!type) return t('N/A');
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\bId\b/g, 'ID')
      .replace(/\bGps\b/g, 'GPS');
  };

  // ---------------------------------------------------------------------
  // PDF generation — English / French (jsPDF renders Latin script natively)
  // ---------------------------------------------------------------------
  const buildLatinPdf = (doc, startY) => {
    let yPosition = startY;

    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.setFont(undefined, 'bold');
    doc.text(t('Booking Details'), 15, yPosition);

    yPosition += 8;
    const bookingDetails = [
      [t('Booking Type'), translateEnum(bookingData.type)],
      [t('Payment Type'), translateEnum(bookingData.payment_type)],
      [t('Car'), bookingData.car_name_en || t('N/A')],
      [t('Car Group'), bookingData.car_group_name_en || t('N/A')],
      [`${t('Pickup')} ${t('Type')}`, translateEnum(bookingData.pickup_type)],
      [`${t('Pickup')} ${t('Date/Time')}`, formatDate(bookingData.pickup_date_time)],
      [`${t('Pickup')} ${t('City')}`, bookingData.pickup_city_name_en || t('N/A')],
      [`${t('Dropoff')} ${t('Type')}`, translateEnum(bookingData.dropoff_type)],
      [`${t('Dropoff')} ${t('Date/Time')}`, formatDate(bookingData.dropoff_date_time)],
      [`${t('Dropoff')} ${t('Location')}`, bookingData.dropoff_location_name_en || t('N/A')]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: bookingDetails,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: { top: 4, right: 4, bottom: 4, left: 4 } },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, textColor: [52, 73, 94] },
        1: { cellWidth: 120, textColor: [44, 62, 80] }
      }
    });

    if (bookingData.car_extras && bookingData.car_extras.length > 0) {
      yPosition = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.setFont(undefined, 'bold');
      doc.text(t('Car Extras'), 15, yPosition);

      yPosition += 8;
      const extrasData = bookingData.car_extras.map(extra => [
        translateEnum(extra.type) !== extra.type?.toUpperCase() ? translateEnum(extra.type) : extra.type.toUpperCase(),
        `${extra.quantity}`,
        formatCurrency(extra.rate)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [[t('Type'), t('Quantity'), t('Rate')]],
        body: extrasData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: { top: 5, right: 5, bottom: 5, left: 5 } },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 50, halign: 'right' }
        }
      });
    }

    if (bookingData.user_documents && bookingData.user_documents.length > 0) {
      yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPosition + 15;
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.setFont(undefined, 'bold');
      doc.text(t('User Documents'), 15, yPosition);

      yPosition += 8;
      const documentsData = bookingData.user_documents.map(docItem => [
        formatDocumentType(docItem.doc_type),
        docItem.front_image ? t('Yes') : t('No'),
        docItem.back_image ? t('Yes') : t('No'),
        formatDate(docItem.created_at)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [[t('Document Type'), t('Front Image'), t('Back Image'), t('Uploaded Date')]],
        body: documentsData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: { top: 5, right: 5, bottom: 5, left: 5 } },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 60 }
        }
      });
    }

    yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPosition + 15;
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.setFont(undefined, 'bold');
    doc.text(t('Charges Summary'), 15, yPosition);

    yPosition += 8;
    const chargesData = [
      [t('Surge Amount'), formatCurrency(bookingData.surge_amount)],
      [t('Inter Cities Charges'), formatCurrency(bookingData.inter_cities_charges)],
      [t('Pickup Parking Charges'), formatCurrency(bookingData.pickup_parking_charges)],
      [t('Dropoff Parking Charges'), formatCurrency(bookingData.dropoff_parking_charges)],
      ['VMD Charges', formatCurrency(bookingData.vmd_charges)],
      [t('Delivery Charges'), formatCurrency(bookingData.delivery_charges)],
      [t('Collection Charges'), formatCurrency(bookingData.collection_charges)],
      [t('Sub Amount'), formatCurrency(bookingData.sub_amount)],
      [t('Total Amount'), formatCurrency(bookingData.total_amount || bookingData.actual_total_amount)]
    ];

    const totalLabel = t('Total Amount');
    const totalRowIndex = chargesData.findIndex(row => row[0] === totalLabel);

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: chargesData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: { top: 4, right: 4, bottom: 4, left: 4 } },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70, textColor: [52, 73, 94] },
        1: { cellWidth: 110, halign: 'right', textColor: [44, 62, 80] }
      },
      willDrawCell: (data) => {
        if (data?.row?.index === totalRowIndex && data.section === 'body' && data.column?.index === 0 && data.cell) {
          const startX = data.cell.x || 15;
          const rowY = data.cell.y || 0;
          const rowHeight = data.cell.height || 6;
          let tableWidth = 180;
          if (data.table?.columns?.length > 0) {
            tableWidth = 0;
            data.table.columns.forEach(col => { tableWidth += col.width || 0; });
          } else if (data.cell.width) {
            tableWidth = data.cell.width * 2;
          }
          doc.setFillColor(240, 248, 255);
          doc.rect(startX, rowY, tableWidth, rowHeight, 'F');
        }
      },
      didDrawCell: (data) => {
        if (data?.row?.index === totalRowIndex && data.section === 'body' &&
            data.column && data.table?.columns && data.column.index === data.table.columns.length - 1 && data.cell) {
          let startX = data.cell.x || 15;
          if (data.table.columns && data.column.index > 0) {
            for (let i = 0; i < data.column.index; i++) {
              startX -= (data.table.columns[i]?.width || 0);
            }
          }
          const rowY = data.cell.y || 0;
          const rowHeight = data.cell.height || 6;
          let tableWidth = 180;
          if (data.table.columns?.length > 0) {
            tableWidth = 0;
            data.table.columns.forEach(col => { tableWidth += col.width || 0; });
          } else if (data.cell.width) {
            tableWidth = data.cell.width * 2;
          }
          doc.setDrawColor(41, 128, 185);
          doc.setLineWidth(0.5);
          doc.rect(startX, rowY, tableWidth, rowHeight, 'S');
        }
      }
    });

    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 15;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, 'normal');
    doc.text(`${t('Generated on')}: ${new Date().toLocaleString(dateLocale)}`, 105, footerY, null, null, 'center');

    doc.save(`booking_report_${bookingData.booking_number}.pdf`);
  };

  const buildLatinPdfHeader = (doc) => {
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.setFont(undefined, 'bold');
    doc.text(t('Booking Report'), 105, 25, null, null, 'center');

    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.setFont(undefined, 'normal');
    doc.text(`${t('Booking Number')}: ${bookingData.booking_number}`, 105, 40, null, null, 'center');

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    let yPosition = 55;
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.setFont(undefined, 'bold');
    doc.text(t('Customer Information'), 15, yPosition);

    yPosition += 8;
    const customerData = [
      [t('Name'), `${bookingData.user_first_name} ${bookingData.user_last_name}`],
      [t('Email'), bookingData.user_email],
      [t('Phone'), `+${bookingData.user_phone_code} ${bookingData.user_phone_number}`],
      [t('Booking Date'), formatDate(bookingData.booking_date)]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: customerData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: { top: 4, right: 4, bottom: 4, left: 4 } },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: [52, 73, 94] },
        1: { cellWidth: 130, textColor: [44, 62, 80] }
      }
    });

    buildLatinPdf(doc, doc.lastAutoTable.finalY + 15);
  };

  // ---------------------------------------------------------------------
  // PDF generation — Arabic (rasterized text, right-to-left layout)
  // ---------------------------------------------------------------------
  const PAGE_RIGHT = 195;
  const PAGE_LEFT = 15;

  const drawArabicSectionTitle = (doc, title, y) => {
    drawArabicText(doc, title, PAGE_RIGHT, y, { fontSizePt: 14, bold: true, color: '#2980b9' });
    return y + 8;
  };

  const drawArabicRows = (doc, rows, startY) => {
    let y = startY;
    rows.forEach(([label, value]) => {
      drawArabicText(doc, `${label} :`, PAGE_RIGHT, y, { fontSizePt: 10, bold: true, color: '#34495e' });
      drawArabicText(doc, value, PAGE_RIGHT - 60, y, { fontSizePt: 10, bold: false, color: '#2c3e50' });
      y += 8;
    });
    return y + 6;
  };

  const drawArabicGridTable = (doc, headers, rows, startY) => {
    const colWidth = (PAGE_RIGHT - PAGE_LEFT) / headers.length;
    let y = startY;

    doc.setFillColor(41, 128, 185);
    doc.rect(PAGE_LEFT, y, PAGE_RIGHT - PAGE_LEFT, 8, 'F');
    headers.forEach((header, i) => {
      const cellRight = PAGE_RIGHT - i * colWidth;
      drawArabicText(doc, header, cellRight - 2, y + 4, { fontSizePt: 9, bold: true, color: '#ffffff' });
    });
    y += 8;

    doc.setDrawColor(220, 220, 220);
    rows.forEach((row) => {
      doc.rect(PAGE_LEFT, y, PAGE_RIGHT - PAGE_LEFT, 8, 'S');
      row.forEach((cell, i) => {
        const cellRight = PAGE_RIGHT - i * colWidth;
        drawArabicText(doc, cell, cellRight - 2, y + 4, { fontSizePt: 9, bold: false, color: '#2c3e50' });
      });
      y += 8;
    });

    return y + 12;
  };

  const buildArabicPdf = (doc) => {
    doc.setFillColor(255, 255, 255);
    drawArabicText(doc, t('Booking Report'), PAGE_RIGHT, 22, { fontSizePt: 20, bold: true, color: '#2c3e50' });
    drawArabicText(doc, `${t('Booking Number')}: ${bookingData.booking_number}`, PAGE_RIGHT, 38, { fontSizePt: 12, color: '#34495e' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(PAGE_LEFT, 45, PAGE_RIGHT, 45);

    let y = 55;
    y = drawArabicSectionTitle(doc, t('Customer Information'), y);
    y = drawArabicRows(doc, [
      [t('Name'), `${bookingData.user_first_name} ${bookingData.user_last_name}`],
      [t('Email'), bookingData.user_email],
      [t('Phone'), `+${bookingData.user_phone_code} ${bookingData.user_phone_number}`],
      [t('Booking Date'), formatDate(bookingData.booking_date)]
    ], y);

    y = drawArabicSectionTitle(doc, t('Booking Details'), y);
    y = drawArabicRows(doc, [
      [t('Booking Type'), translateEnum(bookingData.type)],
      [t('Payment Type'), translateEnum(bookingData.payment_type)],
      [t('Car'), bookingData.car_name_en || t('N/A')],
      [t('Car Group'), bookingData.car_group_name_en || t('N/A')],
      [`${t('Pickup')} ${t('Type')}`, translateEnum(bookingData.pickup_type)],
      [`${t('Pickup')} ${t('Date/Time')}`, formatDate(bookingData.pickup_date_time)],
      [`${t('Pickup')} ${t('City')}`, bookingData.pickup_city_name_en || t('N/A')],
      [`${t('Dropoff')} ${t('Type')}`, translateEnum(bookingData.dropoff_type)],
      [`${t('Dropoff')} ${t('Date/Time')}`, formatDate(bookingData.dropoff_date_time)],
      [`${t('Dropoff')} ${t('Location')}`, bookingData.dropoff_location_name_en || t('N/A')]
    ], y);

    if (doc.internal.pageSize.height - y < 40) { doc.addPage(); y = 20; }

    if (bookingData.car_extras && bookingData.car_extras.length > 0) {
      y = drawArabicSectionTitle(doc, t('Car Extras'), y);
      const extrasRows = bookingData.car_extras.map(extra => [
        translateEnum(extra.type),
        `${extra.quantity}`,
        formatCurrency(extra.rate)
      ]);
      y = drawArabicGridTable(doc, [t('Type'), t('Quantity'), t('Rate')], extrasRows, y);
    }

    if (bookingData.user_documents && bookingData.user_documents.length > 0) {
      if (doc.internal.pageSize.height - y < 40) { doc.addPage(); y = 20; }
      y = drawArabicSectionTitle(doc, t('User Documents'), y);
      const docsRows = bookingData.user_documents.map(docItem => [
        formatDocumentType(docItem.doc_type),
        docItem.front_image ? t('Yes') : t('No'),
        docItem.back_image ? t('Yes') : t('No'),
        formatDate(docItem.created_at)
      ]);
      y = drawArabicGridTable(doc, [t('Document Type'), t('Front Image'), t('Back Image'), t('Uploaded Date')], docsRows, y);
    }

    if (doc.internal.pageSize.height - y < 60) { doc.addPage(); y = 20; }

    y = drawArabicSectionTitle(doc, t('Charges Summary'), y);
    const chargesRows = [
      [t('Surge Amount'), formatCurrency(bookingData.surge_amount)],
      [t('Inter Cities Charges'), formatCurrency(bookingData.inter_cities_charges)],
      [t('Pickup Parking Charges'), formatCurrency(bookingData.pickup_parking_charges)],
      [t('Dropoff Parking Charges'), formatCurrency(bookingData.dropoff_parking_charges)],
      ['VMD Charges', formatCurrency(bookingData.vmd_charges)],
      [t('Delivery Charges'), formatCurrency(bookingData.delivery_charges)],
      [t('Collection Charges'), formatCurrency(bookingData.collection_charges)],
      [t('Sub Amount'), formatCurrency(bookingData.sub_amount)],
    ];
    y = drawArabicRows(doc, chargesRows, y);

    // Highlight total row
    doc.setFillColor(240, 248, 255);
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.rect(PAGE_LEFT, y - 6, PAGE_RIGHT - PAGE_LEFT, 9, 'FD');
    drawArabicText(doc, `${t('Total Amount')} :`, PAGE_RIGHT - 2, y - 1.5, { fontSizePt: 11, bold: true, color: '#2980b9' });
    drawArabicText(doc, formatCurrency(bookingData.total_amount || bookingData.actual_total_amount), PAGE_RIGHT - 62, y - 1.5, { fontSizePt: 11, bold: true, color: '#2980b9' });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, 'normal');
    doc.text(`${t('Generated on')}: ${new Date().toLocaleString(dateLocale)}`, 105, pageHeight - 15, null, null, 'center');

    doc.save(`booking_report_${bookingData.booking_number}.pdf`);
  };

  // ---------------------------------------------------------------------
  const generatePDFReport = async () => {
    setPdfLoading(true);
    try {
      if (isArabic) {
        await ensureArabicFontLoaded();
        const doc = new jsPDF();
        buildArabicPdf(doc);
        return;
      }

      const doc = new jsPDF();
      const img = new Image();
      img.src = logo;

      await new Promise((resolve) => {
        img.onload = () => {
          const logoWidth = 50;
          const aspectRatio = img.width / img.height;
          const logoHeight = logoWidth / aspectRatio;
          doc.addImage(img, 'PNG', 15, 10, logoWidth, logoHeight);
          resolve();
        };
        img.onerror = () => resolve();
      });

      buildLatinPdfHeader(doc);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <>
      <Helmet title={t('Booking Report')} />
      <section className="booking-report-section" style={{ minHeight: '100vh', padding: '80px 0', backgroundColor: '#f8f9fa' }}>
        <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="booking-report-header" style={{ padding: '20px', backgroundColor: '#fff', marginBottom: '20px' }}>
              <h1 className="text-center" style={{ color: '#2c3e50' }}>{t('Booking Report')}</h1>
              <p className="text-center text-muted">
                {t('Enter your booking ID to view and download the booking report')}
              </p>
            </div>

            <Card className="booking-search-card">
              <Card.Body>
                <Form>
                  <Row className="align-items-end">
                    <Col md={8}>
                      <Form.Group className="mb-3 mb-md-0">
                        <Form.Label>{t('Booking ID')}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., ARC2024072443896505"
                          value={bookingId}
                          onChange={(e) => setBookingId(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="booking-id-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button
                        variant="primary"
                        onClick={handleSearchClick}
                        disabled={loading}
                        className="w-100 search-btn"
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            {t('Searching...')}
                          </>
                        ) : (
                          t('Search Booking')
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {error && (
                  <Alert variant="danger" className="mt-3">
                    <i className="ri-error-warning-line me-2"></i>
                    {error}
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Verification Modal */}
            <Modal
              show={showVerificationModal}
              onHide={() => setShowVerificationModal(false)}
              centered
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  <i className="ri-shield-check-line me-2"></i>
                  {t('Verification Required')}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p className="mb-3">
                  {t('Please enter your Route Facile email address to access booking information.')}
                </p>
                <Form.Group className="mb-3">
                  <Form.Label>{t('Email Address')}</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="your.name@routefacilecarrental.com"
                    value={verificationEmail}
                    onChange={(e) => {
                      setVerificationEmail(e.target.value);
                      setVerificationError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleVerification();
                      }
                    }}
                    isInvalid={!!verificationError}
                    autoFocus
                  />
                  {verificationError && (
                    <Form.Control.Feedback type="invalid">
                      {verificationError}
                    </Form.Control.Feedback>
                  )}

                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowVerificationModal(false)}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleVerification}
                >
                  <i className="ri-check-line me-2"></i>
                  {t('Verify & Search')}
                </Button>
              </Modal.Footer>
            </Modal>

            {bookingData && (
              <Card className="booking-details-card mt-4">
                <Card.Header className="booking-card-header">
                  <h4 className="mb-0">{t('Booking Details')}</h4>
                  <span className="booking-number">{bookingData.booking_number}</span>
                </Card.Header>
                <Card.Body>
                  {/* Customer Information */}
                  <div className="detail-section">
                    <h5 className="section-title">
                      <i className="ri-user-line me-2"></i>{t('Customer Information')}
                    </h5>
                    <Row>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Name')}:</span>
                          <span className="detail-value">
                            {bookingData.user_first_name} {bookingData.user_last_name}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Email')}:</span>
                          <span className="detail-value">{bookingData.user_email}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Phone')}:</span>
                          <span className="detail-value">
                            +{bookingData.user_phone_code} {bookingData.user_phone_number}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Booking Date')}:</span>
                          <span className="detail-value">
                            {formatDate(bookingData.booking_date)}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Vehicle Information */}
                  <div className="detail-section">
                    <h5 className="section-title">
                      <i className="ri-car-line me-2"></i>{t('Vehicle Information')}
                    </h5>
                    <Row>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Car')}:</span>
                          <span className="detail-value">{bookingData.car_name_en || t('N/A')}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Car Group')}:</span>
                          <span className="detail-value">{bookingData.car_group_name_en || t('N/A')}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Booking Type')}:</span>
                          <span className="detail-value badge-type">
                            {translateEnum(bookingData.type)}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="detail-item">
                          <span className="detail-label">{t('Payment Type')}:</span>
                          <span className="detail-value badge-payment">
                            {translateEnum(bookingData.payment_type)}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Pickup & Dropoff Information */}
                  <div className="detail-section">
                    <h5 className="section-title">
                      <i className="ri-map-pin-line me-2"></i>{t('Pickup & Dropoff Details')}
                    </h5>
                    <Row>
                      <Col md={6}>
                        <div className="location-card pickup-card">
                          <h6><i className="ri-map-pin-2-line me-2"></i>{t('Pickup')}</h6>
                          <div className="detail-item">
                            <span className="detail-label">{t('Type')}:</span>
                            <span className="detail-value">{translateEnum(bookingData.pickup_type)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{t('Date/Time')}:</span>
                            <span className="detail-value">{formatDate(bookingData.pickup_date_time)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{t('City')}:</span>
                            <span className="detail-value">{bookingData.pickup_city_name_en || t('N/A')}</span>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="location-card dropoff-card">
                          <h6><i className="ri-map-pin-5-line me-2"></i>{t('Dropoff')}</h6>
                          <div className="detail-item">
                            <span className="detail-label">{t('Type')}:</span>
                            <span className="detail-value">{translateEnum(bookingData.dropoff_type)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{t('Date/Time')}:</span>
                            <span className="detail-value">{formatDate(bookingData.dropoff_date_time)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{t('Location')}:</span>
                            <span className="detail-value">{bookingData.dropoff_location_name_en || t('N/A')}</span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Car Extras */}
                  {bookingData.car_extras && bookingData.car_extras.length > 0 && (
                    <div className="detail-section">
                      <h5 className="section-title">
                        <i className="ri-add-circle-line me-2"></i>{t('Car Extras')}
                      </h5>
                      <Table responsive className="extras-table">
                        <thead>
                          <tr>
                            <th>{t('Type')}</th>
                            <th>{t('Quantity')}</th>
                            <th>{t('Rate')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingData.car_extras.map((extra, index) => (
                            <tr key={index}>
                              <td>{translateEnum(extra.type)}</td>
                              <td>{extra.quantity}</td>
                              <td>{formatCurrency(extra.rate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {/* User Documents */}
                  {bookingData.user_documents && bookingData.user_documents.length > 0 && (
                    <div className="detail-section">
                      <h5 className="section-title">
                        <i className="ri-file-text-line me-2"></i>{t('User Documents')}
                      </h5>
                      <Table responsive className="extras-table">
                        <thead>
                          <tr>
                            <th>{t('Document Type')}</th>
                            <th>{t('Front Image')}</th>
                            <th>{t('Back Image')}</th>
                            <th>{t('Uploaded Date')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingData.user_documents.map((docItem, index) => (
                            <tr key={index}>
                              <td>
                                <span className="badge bg-info">
                                  {formatDocumentType(docItem.doc_type)}
                                </span>
                              </td>
                              <td>
                                {docItem.front_image ? (
                                  <a
                                    href={docItem.front_image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary"
                                  >
                                    <i className="ri-image-line me-1"></i>{t('View')}
                                  </a>
                                ) : (
                                  <span className="text-muted">{t('N/A')}</span>
                                )}
                              </td>
                              <td>
                                {docItem.back_image ? (
                                  <a
                                    href={docItem.back_image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary"
                                  >
                                    <i className="ri-image-line me-1"></i>{t('View')}
                                  </a>
                                ) : (
                                  <span className="text-muted">{t('N/A')}</span>
                                )}
                              </td>
                              <td>{formatDate(docItem.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {/* Charges Summary */}
                  <div className="detail-section charges-section">
                    <h5 className="section-title">
                      <i className="ri-money-dollar-circle-line me-2"></i>{t('Charges Summary')}
                    </h5>
                    <div className="charges-grid">
                      <div className="charge-item">
                        <span className="charge-label">{t('Surge Amount')}:</span>
                        <span className="charge-value">{formatCurrency(bookingData.surge_amount)}</span>
                      </div>
                      <div className="charge-item">
                        <span className="charge-label">{t('Inter Cities Charges')}:</span>
                        <span className="charge-value">{formatCurrency(bookingData.inter_cities_charges)}</span>
                      </div>
                      <div className="charge-item">
                        <span className="charge-label">{t('Pickup Parking Charges')}:</span>
                        <span className="charge-value">{formatCurrency(bookingData.pickup_parking_charges)}</span>
                      </div>
                      <div className="charge-item">
                        <span className="charge-label">{t('Dropoff Parking Charges')}:</span>
                        <span className="charge-value">{formatCurrency(bookingData.dropoff_parking_charges)}</span>
                      </div>
                      <div className="charge-item">
                        <span className="charge-label">{t('Delivery Charges')}:</span>
                        <span className="charge-value">{formatCurrency(bookingData.delivery_charges)}</span>
                      </div>
                      <div className="charge-item">
                        <span className="charge-label">{t('Collection Charges')}:</span>
                        <span className="charge-value">{formatCurrency(bookingData.collection_charges)}</span>
                      </div>
                      <div className="charge-item">
                        <span className="charge-label">{t('Sub Amount')}:</span>
                        <span className="charge-value">{formatCurrency(bookingData.sub_amount)}</span>
                      </div>
                      {/* No VAT is charged, so the line is only rendered for
                          historical bookings that actually carry a VAT amount. */}
                      {Number(bookingData.vat_amount) > 0 && (
                        <div className="charge-item">
                          <span className="charge-label">{t('VAT')} ({bookingData.vat_percentage || 0}%):</span>
                          <span className="charge-value">{formatCurrency(bookingData.vat_amount)}</span>
                        </div>
                      )}
                      <div className="charge-item total-charge">
                        <span className="charge-label">{t('Total Amount')}:</span>
                        <span className="charge-value">
                          {formatCurrency(bookingData.total_amount || bookingData.actual_total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="text-center mt-4">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={generatePDFReport}
                      disabled={pdfLoading}
                      className="download-btn"
                    >
                      {pdfLoading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      ) : (
                        <i className="ri-download-2-line me-2"></i>
                      )}
                      {t('Download PDF Report')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </section>
    </>
  );
};

export default BookingReport;
