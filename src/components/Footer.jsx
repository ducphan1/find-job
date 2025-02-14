import React from "react";
import { Layout } from "antd";
import "../styles/Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import logo from "../assets/zalo.png";

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="site-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>DÀNH CHO NHÀ TUYỂN DỤNG</h3>
          <ul>
            <li>
              <a href="#">Tìm hồ sơ ứng viên</a>
            </li>
            <li>
              <a href="#">Bảng giá đăng tin VIP</a>
            </li>
            <li>
              <a href="#">Hướng dẫn đăng ký VIP</a>
            </li>
            <li>
              <a href="#">Liên hệ - Tư vấn - Hỗ trợ</a>
            </li>
            <li>
              <a href="#">Hướng dẫn thanh toán VNPAY</a>
            </li>
            <li>
              <a href="#">Chính sách hoàn hủy</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>DÀNH CHO ỨNG VIÊN</h3>
          <ul>
            <li>
              <a href="#">Công Ty Nổi Bật</a>
            </li>
            <li>
              <a href="#">Việc Làm Đà Nẵng</a>
            </li>
            <li>
              <a href="#">Việc Làm Tây Nam Bộ</a>
            </li>
            <li>
              <a href="#">Nội thất the one Cần Thơ</a>
            </li>
            <li>
              <a href="#">Các dịch vụ Cần Thơ</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>THÔNG TIN LIÊN HỆ</h3>
          <p>📞 Đăng tuyển: 09777.85032</p>
          <p>📞 Tìm việc: 0977.785.032</p>
          <p>📞 Phone: 02926.282.383</p>
          <p>📱 Zalo: 0977785032</p>
          <p>
            📧 Email:{" "}
            <a href="mailto:cantho@vietnamhr.vn">cantho@vietnamhr.vn</a>
          </p>
        </div>

        <div className="footer-section">
          <h3>THEO DÕI CHÚNG TÔI</h3>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>

            <a href="#" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>

            <a href="#" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>

            <a href="#" aria-label="TikTok">
              <FontAwesomeIcon icon={faTiktok} />
            </a>

            <a href="#" aria-label="Zalo">
              <img src={logo} alt="Zalo" style={{ width: 20, height: 20 }} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Tuyển dụng Việc Làm Cần Thơ - Quản lý bởi Công Ty TNHH Metawork <br />
          MST: 1501149845 - Nơi cấp: Sở Kế Hoạch Và Đầu Tư Tỉnh Vĩnh Long <br />
          Địa chỉ: Số 4660, Thuận An, Bình Minh, Tỉnh Vĩnh Long | Phone:
          02926.282.383 | Email: metawork247@gmail.com
        </p>
        <p>
          <a href="#">Quy chế hoạt động</a> |{" "}
          <a href="#">Chính sách bảo mật thông tin</a> |
          <a href="#">Cơ chế giải quyết tranh chấp</a> |{" "}
          <a href="#">Điều khoản sử dụng</a>
        </p>
        <p>©Copyright by Metawork</p>
      </div>
    </AntFooter>
  );
};

export default Footer;
