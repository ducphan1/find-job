import React from "react";
import { Input, Select, Button } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import "../styles/JobSearchBar.css";

const { Option } = Select;

const JobSearchBar = () => {
  return (
    <div className="job-search-container">
      <div className="search-section">
        <div className="search-filters">
          <Input
            placeholder="Tiêu đề công việc, vị trí..."
            prefix={<SearchOutlined />}
            className="search-input"
          />

          <Select
            defaultValue="Lọc theo ngành nghề"
            className="filter-select"
            suffixIcon={<FilterOutlined />}
          >
            <Option value="it">IT - Công nghệ</Option>
            <Option value="marketing">Marketing</Option>
            <Option value="finance">Tài chính - Kế toán</Option>
          </Select>

          <Select
            defaultValue="Lọc theo địa điểm"
            className="filter-select"
            suffixIcon={<FilterOutlined />}
          >
            <Option value="hanoi">Hà Nội</Option>
            <Option value="hochiminh">TP. Hồ Chí Minh</Option>
            <Option value="danang">Đà Nẵng</Option>
          </Select>

          <Button type="primary" className="search-button">
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>

        <div className="job-stats">
          <span className="employer-count">
            <strong>567</strong> Cty đang tuyển dụng
          </span>
          <span className="applicant-count">
            <strong>29.140</strong> Hồ sơ ứng viên
          </span>
        </div>
      </div>

      <div className="advanced-filter-section">
        <Button className="filter-button">
          <FilterOutlined /> Lọc nâng cao
        </Button>
      </div>
    </div>
  );
};

export default JobSearchBar;
