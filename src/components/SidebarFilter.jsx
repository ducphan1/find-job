import React from "react";
import { Checkbox, Radio } from "antd";
import "../styles/NewJobPage.css";

const SidebarFilter = () => {
  return (
    <div className="sidebar-filter">
      <div>
        <h3>BỘ LỌC NÂNG CAO</h3>
      </div>

      <div>
        <h4>Lọc theo mức lương</h4>
        <Checkbox>3-5 triệu</Checkbox>
        <Checkbox>5-7 triệu</Checkbox>
        <Checkbox>7-10 triệu</Checkbox>
        <Checkbox>Trên 10 triệu</Checkbox>
      </div>

      <div>
        <h4>Lọc theo thời gian</h4>
        <Checkbox>Toàn thời gian</Checkbox>
        <Checkbox>Bán thời gian</Checkbox>
        <Checkbox>Thực tập</Checkbox>
      </div>

      <div>
        <h4>Lọc theo trình độ</h4>
        <Radio.Group direction="vertical">
          <Radio value="cao_dang">Cao đẳng</Radio>
          <Radio value="dai_hoc">Đại học</Radio>
          <Radio value="sau_dai_hoc">Sau đại học</Radio>
        </Radio.Group>
      </div>
    </div>
  );
};

export default SidebarFilter;
