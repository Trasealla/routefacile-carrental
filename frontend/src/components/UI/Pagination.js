import React, { useState, useEffect } from "react";
import Pagination from "react-bootstrap/Pagination";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";

const CustomPagination = ({
  totalRecords,
  recordsPerPage,
  onPageChange,
  currentPage,
}) => {
  // const [currentPage, setCurrentPage] = useState(1); // Default active page
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil((totalRecords || 0) / (recordsPerPage || 1)))
  );
  const { t } = useTranslation();
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil((totalRecords || 0) / (recordsPerPage || 1))));
  }, [totalRecords, recordsPerPage]);

  // const handlePageClick = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  //   if (onPageChange) {
  //     onPageChange(pageNumber); // Call the callback function with the new page number
  //   }
  // };

  const handlePageClick = (pageNumber) => {
    if (onPageChange) {
      onPageChange(pageNumber); // Call the callback function with the new page number
    }
  };

  const renderPageItems = () => {
    let items = [];
    // for (let number = 1; number <= totalPages; number++) {
    //   items.push(
    //     <Pagination.Item
    //       key={number}
    //       className="mx-2"
    //       active={currentPage === number}
    //       onClick={() => handlePageClick(number)}
    //     >
    //       {number}
    //     </Pagination.Item>
    //   );
    // }
    // return items;


    if (totalPages <= 10) {
      // Render all pages if totalPages is 10 or less
      for (let number = 1; number <= totalPages; number++) {
        items.push(
          <Pagination.Item
            key={number}
            className="mx-2"
            active={currentPage === number}
            onClick={() => handlePageClick(number)}
          >
            {number || 1}
          </Pagination.Item>
        );
      }
    } else {
      // Handle the case where totalPages > 10
      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);

      // Always show the first page
      items.push(
        <Pagination.Item
          key={1}
          className="mx-2"
          active={currentPage === 1}
          onClick={() => handlePageClick(1)}
        >
          1
        </Pagination.Item>
      );

      // Show ellipsis if the current page range doesn't start with the second page
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }

      // Show middle pages
      for (let number = startPage; number <= endPage; number++) {
        items.push(
          <Pagination.Item
            key={number}
            className="mx-2"
            active={currentPage === number}
            onClick={() => handlePageClick(number)}
          >
            {number}
          </Pagination.Item>
        );
      }

      // Show ellipsis if the current page range doesn't end with the last page
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }

      // Always show the last page
      items.push(
        <Pagination.Item
          key={totalPages}
          className="mx-2"
          active={currentPage === totalPages}
          onClick={() => handlePageClick(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  
  };

  return (
    totalPages <= 1 ? null : (
    <div className="d-flex justify-content-center">
      <Pagination className="pagination">
        {/* Plain Items rather than Pagination.Prev/Next: those render the label
            twice — the children plus react-bootstrap's own visually-hidden
            English "Previous"/"Next" — which reads as a duplicate and is never
            translated. One translated label each is what we actually want. */}
        <Pagination.Item
          className="mx-2"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={t("Previous")}
        >
          {t("Previous")}
        </Pagination.Item>
        {renderPageItems()}
        <Pagination.Item
          className="mx-2"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={t("Next")}
        >
          {t("Next")}
        </Pagination.Item>
      </Pagination>
    </div>
    )
  );
};

export default CustomPagination;



