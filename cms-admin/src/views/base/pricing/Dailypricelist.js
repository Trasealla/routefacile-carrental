import React, { useEffect, useState } from "react";

import {
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import {simpleGetCallAuth} from "../../../components/config.js/Setup"
import { notifyError, notifySuccess } from "../../../components/notify/notify";

import { Link } from "react-router-dom";
import configWeb from "../../../components/config.js/ConfigWeb";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import { formatDateTimeUAE } from "../CustomHooks/reusableFunctions";
import { FaCloudUploadAlt, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaLayerGroup, FaCar, FaTable } from "react-icons/fa";
import { MdPriceChange } from "react-icons/md";
import { useTranslation } from "react-i18next";

const Dailypricelist = () => {
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

  
const [loading, setLoading] = useState(false);

const [citiesArray, setCitiesArray] = useState([]);
const [carGroupArray, setCarGroupArray] = useState([]);
const [carArray, setCarArray] = useState([]);
const [priceListArray, setPriceListArray] = useState([]);
const [year, setYear] = useState("");
const [cityID, setCityID] = useState("");
const [carGroup, setCarGroup] = useState("");
const [carName, setCarName] = useState("");
const [pageSize, setPageSize] = useState(25);
const [totalRecords, setTotalRecords] = useState(0);
const [currentPage, setCurrentPage] = useState(1);
const years = [
 
  {value: 2024, name: "2024" },
  {value: 2025, name: "2025" },
  {value: 2026, name: "2026" },
  {value: 2027, name: "2027" },
  {value: 2028, name: "2028" },
  {value: 2029, name: "2029" },
  {value: 2030, name: "2030" },
]

const citiesData = () => {
  const url = `${configWeb.GET_CITIES}?page_size=9999`
  
  simpleGetCallAuth(url)
    .then((res) => {
      setCitiesArray(res?.data || []) ;
    })
    .catch((errr) => {
      console.log("errr", errr);
    })
    .finally(() => {
      // set_loading(false);
    });
};
const carGroupData = () => {
  const url = `${configWeb.GET_CAR_GROUPS}?page_size=9999`;
  
  simpleGetCallAuth(url)
    .then((res) => {
      setCarGroupArray(res?.data || []) ;
    })
    .catch((errr) => {
      console.log("errr", errr);
    })
    .finally(() => {
      // set_loading(false);
    });
};
const carData = () => {
  const url = `${configWeb.GET_CAR}?page_size=9999`;
  
  simpleGetCallAuth(url)
    .then((res) => {
      setCarArray(res?.data || []) ;
    })
    .catch((errr) => {
      console.log("errr", errr);
    })
    .finally(() => {
      // set_loading(false);
    });
};
useEffect(()=>{
  citiesData();
  carGroupData();
  carData();
},[])
const getPriceList =()=>{
  // return new Promise((resolve, reject)=>{
    setLoading(true);
    const body = JSON.stringify({

    })
    const params = new URLSearchParams();
    // Add parameters only if they exist
    if (carName) params.append("car_id", carName);
    if (year) params.append("year", year);
    if (carGroup) params.append("group_id", carGroup);
    if (cityID) params.append("city_id", cityID);
    params.append("page", currentPage)
    params.append("page_size", pageSize)
  
    const url = `${configWeb.GET_DAILY_PRICE}?${params.toString()}`;
   

    simpleGetCallAuth(url)
    .then((res)=>{
      if(!res?.error){
        setPriceListArray(res?.data || []);
        setTotalRecords(res?.total_records || 0);
      }else{
        setPriceListArray([]);
        setTotalRecords(0);
      }

    })
.catch((error) => {
          notifyError("Something went wrong, please try again later");
          setPriceListArray([]);
          setTotalRecords(0);
        })
        .finally(() => {
          setLoading(false);
        });
    // });
  };

  useEffect(()=>{
  
getPriceList();
  },[currentPage, pageSize])

const handleSearchList = ()=>{
  setCurrentPage(1);
 
   getPriceList();
}

const calculateTotal = (item) => {
  return (
    (item.rate || 0) +
    (item.cdw || 0) +
    (item.scdw || 0) +
    (item.pai || 0) +
    (item.driver || 0) +
    (item.baby_seat || 0) +
    (item.gps || 0)
  );
};

const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
};

const calculatePaginationMessage = () => {
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);
  return `${t('pricingList.showing')} ${startRecord} ${t('pricingList.to')} ${endRecord} ${t('pricingList.of')} ${totalRecords} ${t('pricingList.entries')}`;
};




// Call this function whenever pageSize changes to update currentPage if necessary
const handlePageSizeChange = (newPageSize) => {
  // Calculate the new current page based on existing records range
  // const newCurrentPage = Math.ceil(((currentPage - 1) * pageSize + 1) / newPageSize);
  setPageSize(newPageSize);
  // setCurrentPage(newCurrentPage);
};


  return (
    <div className="rf-list-page">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <FaTable size={22} style={{ color: 'var(--rf-orange)', marginRight: 8 }} />
            {t('pricingList.pageTitle')}
          </h2>
          <p style={{ margin: '4px 0 0 14px', color: '#8492a6', fontSize: '0.85rem', fontWeight: 500 }}>
            {t('pricingList.pageSubtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.82rem' }}>
              <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: 'var(--rf-orange)', textDecoration: 'none' }}>{t('nav.Dashboard')}</Link></li>
              <li className="breadcrumb-item"><span style={{ color: '#8492a6' }}>{t('nav.Pricing')}</span></li>
              <li className="breadcrumb-item active" style={{ color: '#1a202c' }}>{t('nav.Daily Pricing List')}</li>
            </ol>
          </nav>
          <Link to="/pricing/upload-daily-pricing">
            <button className="rf-add-btn" style={{ borderRadius: 10, height: 40, padding: '0 18px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              <FaCloudUploadAlt size={15} /> {t('pricingList.uploadPrice')}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Filter Card ─────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '20px 24px', marginBottom: 24 }}>
        <Row className="g-3 align-items-end">

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <FaCalendarAlt size={12} style={{ color: 'var(--rf-orange)' }} /> {t('pricingList.year')}
            </Form.Label>
            <Form.Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', background: '#fafbfc' }}
            >
              <option value="">{t('pricingList.selectYear')}</option>
              {years?.map((y) => <option key={y.value} value={y.value}>{y.name}</option>)}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <FaMapMarkerAlt size={12} style={{ color: 'var(--rf-orange)' }} /> {t('common.city')}
            </Form.Label>
            <Form.Select
              value={cityID}
              onChange={(e) => setCityID(e.target.value)}
              style={{ height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', background: '#fafbfc' }}
            >
              <option value="">{t('pricingList.selectCity')}</option>
              {citiesArray?.map((item) => <option key={item.id} value={item.id}>{item.name_en}</option>)}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <FaLayerGroup size={12} style={{ color: 'var(--rf-orange)' }} /> {t('pricingList.group')}
            </Form.Label>
            <Form.Select
              value={carGroup}
              onChange={(e) => setCarGroup(e.target.value)}
              style={{ height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', background: '#fafbfc' }}
            >
              <option value="">{t('pricingList.selectGroup')}</option>
              {carGroupArray?.map((item) => <option key={item.id} value={item.id}>{item.name_en}</option>)}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <FaCar size={12} style={{ color: 'var(--rf-orange)' }} /> {t('pricingList.car')}
            </Form.Label>
            <Form.Select
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              style={{ height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', background: '#fafbfc' }}
            >
              <option value="">{t('pricingList.selectCar')}</option>
              {carArray?.map((item) => <option key={item.id} value={item.id}>{item.name_en}</option>)}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={2} lg={2}>
            <button
              type="button"
              onClick={handleSearchList}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                height: 42, padding: '0 22px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, var(--rf-orange) 0%, var(--rf-orange-dark) 100%)',
                color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(218,40,38,0.30)',
                transition: 'all .2s', opacity: loading ? 0.7 : 1, width: '100%', justifyContent: 'center',
              }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch size={13} /> {t('common.search')}</>}
            </button>
          </Col>

        </Row>
      </div>

      {/* ── Table Card ──────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(13,27,42,0.06)', overflow: 'hidden' }}>

        {/* Table toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f2f5', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            {loading ? t('pricingList.loading') : calculatePaginationMessage()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#a0aec0', fontWeight: 500 }}>{t('pricingList.rowsPerPage')}</span>
            <Form.Select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{ height: 34, width: 76, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.82rem', padding: '0 8px' }}
            >
              {[10, 25, 50, 100, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
            </Form.Select>
          </div>
        </div>

        {/* Table */}
        <div className="rf-table-wrap" style={{ borderRadius: 0 }}>
          <table className="rf-table table">
            <thead>
              <tr>
                <th>{t('pricingList.year')}</th>
                <th>{t('common.city')}</th>
                <th>{t('pricingList.group')}</th>
                <th>{t('pricingList.colMonth')}</th>
                <th>{t('pricingList.colCarName')}</th>
                <th>{t('pricingList.colRate')}</th>
                <th>{t('pricingList.colCdw')}</th>
                <th>{t('pricingList.colScdw')}</th>
                <th>{t('pricingList.colPai')}</th>
                <th>{t('pricingList.colDriverFee')}</th>
                <th>{t('pricingList.colBabySeat')}</th>
                <th>{t('pricingList.colGps')}</th>
                <th>{t('pricingList.colDate')}</th>
                <th>{t('pricingList.colCreatedBy')}</th>
                <th>{t('pricingList.colCreatedAt')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={15} style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spinner animation="border" style={{ color: 'var(--rf-orange)' }} />
                  </td>
                </tr>
              ) : priceListArray?.length > 0 ? (
                priceListArray.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(218,40,38,0.07)', color: 'var(--rf-orange)', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: '0.82rem' }}>
                        {item.year}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#2d3748' }}>{item.city?.name_en}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(13,27,42,0.07)', color: '#0D1B2A', borderRadius: 8, padding: '2px 10px', fontWeight: 600, fontSize: '0.82rem' }}>
                        {item.car_group?.name_en}
                      </span>
                    </td>
                    <td style={{ color: '#718096', fontWeight: 500 }}>{item.month}</td>
                    <td style={{ fontWeight: 600, color: '#2d3748', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.car?.name_en}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{item.rate}</td>
                    <td>{item.cdw}</td>
                    <td>{item.scdw}</td>
                    <td>{item.pai}</td>
                    <td>{item.driver}</td>
                    <td>{item.baby_seat}</td>
                    <td>{item.gps}</td>
                    <td style={{ color: '#718096', fontSize: '0.82rem' }}>{item.date}</td>
                    <td style={{ fontWeight: 500 }}>{item?.created_by_admin?.first_name}</td>
                    <td style={{ color: '#a0aec0', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDateTimeUAE(item?.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} style={{ textAlign: 'center', padding: '60px 0', color: '#a0aec0' }}>
                    <MdPriceChange size={48} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                    {t('pricingList.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid #f0f2f5' }}>
          <CustomPagination
            recordsPerPage={pageSize}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>
      </div>

    </div>
  )
}


export default Dailypricelist
