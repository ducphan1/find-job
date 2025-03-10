import React from "react";
import { Pagination as AntPagination } from "antd";
import "../styles/NewJobPage.css";

const Pagination = ({
  totalJobs,
  jobsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPage = Math.ceil(totalJobs / jobsPerPage);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="pagination-container">
      <AntPagination
        current={currentPage}
        total={totalJobs}
        pageSize={jobsPerPage}
        onChange={handleChangePage}
        showSizeChanger={false}
      />
      <p>
        Trang {currentPage}/{totalPage}
      </p>
    </div>
  );
};

export default Pagination;
