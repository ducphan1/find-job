import React from "react";
import "../styles/LatestCandidates.css";

const candidates = [
  {
    id: 1,
    name: "Hồ Huỳnh Hồng Ngọc",
    job: "Nhân Viên Văn Phòng",
    education: "Đại học",
    experience: "Dưới 1 năm",
    salary: "5 - 7 triệu",
    time: "6 phút trước",
    rating: 2.5,
    avatar: "avatar1.jpg",
  },
  {
    id: 2,
    name: "Lê Bảo",
    job: "Nhân Viên",
    education: "Cao đẳng",
    experience: "Chưa có kinh nghiệm",
    salary: "5 - 7 triệu",
    time: "10 phút trước",
    rating: 3,
    avatar: "avatar2.jpg",
  },
  {
    id: 3,
    name: "Trương Thiện Ý",
    job: "Nhân Viên",
    education: "Phổ thông",
    experience: "Dưới 1 năm",
    salary: "7 - 10 triệu",
    time: "12 phút trước",
    rating: 1.5,
    avatar: "avatar3.jpg",
  },
  {
    id: 4,
    name: "Mai Đỗ Đan Trường",
    job: "Nhân Viên Xử Lý Dữ Liệu",
    education: "Đại học",
    experience: "Chưa có kinh nghiệm",
    salary: "5 - 7 triệu",
    time: "12 phút trước",
    rating: 2,
    avatar: "avatar4.jpg",
  },
  {
    id: 5,
    name: "Vy Khả",
    job: "Nhân Hành Chính Văn Phòng",
    education: "Cao đẳng",
    experience: "1 năm",
    salary: "10 - 12 triệu",
    time: "11 phút trước",
    rating: 3.5,
    avatar: "avatar5.jpg",
  },
  {
    id: 6,
    name: "Lê Thị Ngọc Diệp",
    job: "Nhân Viên Kế Toán",
    education: "Đại học",
    experience: "4 năm",
    salary: "7 - 10 triệu",
    time: "16 phút trước",
    rating: 4,
    avatar: "avatar6.jpg",
  },
  {
    id: 7,
    name: "Trịnh Thị Như Tâm",
    job: "Nhân Viên Văn Phòng",
    education: "Đại học",
    experience: "1 năm",
    salary: "7 - 10 triệu",
    time: "19 phút trước",
    rating: 3,
    avatar: "avatar7.jpg",
  },
  {
    id: 8,
    name: "Lê Nhật Cường",
    job: "Nhân Viên Lắp Đặt, Thiết Kế",
    education: "Đại học",
    experience: "1 năm",
    salary: "Thỏa thuận",
    time: "20 phút trước",
    rating: 4.5,
    avatar: "avatar8.jpg",
  },
  {
    id: 9,
    name: "Huỳnh Văn Nhớ",
    job: "Nhân Viên",
    education: "Đại học",
    experience: "1 năm",
    salary: "10 - 12 triệu",
    time: "24 phút trước",
    rating: 3.5,
    avatar: "avatar9.jpg",
  },
  {
    id: 10,
    name: "Nguyễn Minh Nhật",
    job: "Nhân Viên",
    education: "Đại học",
    experience: "Dưới 1 năm",
    salary: "5 - 7 triệu",
    time: "29 phút trước",
    rating: 2,
    avatar: "avatar10.jpg",
  },
  {
    id: 11,
    name: "Trần Công Danh",
    job: "Nhân Viên Vận Hành",
    education: "Đại học",
    experience: "5 năm",
    salary: "Thỏa thuận",
    time: "31 phút trước",
    rating: 4,
    avatar: "avatar11.jpg",
  },
  {
    id: 12,
    name: "Phan Thị Thu Thảo",
    job: "Development PHP/C#",
    education: "Đại học",
    experience: "Dưới 1 năm",
    salary: "7 - 10 triệu",
    time: "41 phút trước",
    rating: 3.5,
    avatar: "avatar12.jpg",
  },
  {
    id: 13,
    name: "Nguyễn Ngọc Lâm",
    job: "Marketing, Nhân Viên Kinh Doanh",
    education: "Đại học",
    experience: "2 năm",
    salary: "Thỏa thuận",
    time: "31 phút trước",
    rating: 4,
    avatar: "avatar13.jpg",
  },
  {
    id: 14,
    name: "Xa Đại Tiến",
    job: "Nhân Viên IT",
    education: "Đại học",
    experience: "Dưới 1 năm",
    salary: "5 - 7 triệu",
    time: "13 phút trước",
    rating: 2.5,
    avatar: "avatar14.jpg",
  },
  {
    id: 15,
    name: "Trần Lê Cao Trí",
    job: "Lập Trình Viên",
    education: "Cao đẳng",
    experience: "1 năm",
    salary: "7 - 10 triệu",
    time: "43 phút trước",
    rating: 3,
    avatar: "avatar15.jpg",
  },
];

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <span className="stars">
      {"★".repeat(fullStars)}
      {halfStar && "☆"}
      {"☆".repeat(emptyStars)}
    </span>
  );
};

const LatestCandidates = () => {
  return (
    <div className="latest-candidates">
      <div className="header">
        <h2>HỒ SƠ ỨNG VIÊN MỚI NHẤT</h2>
        <a href="#" className="view-all">
          Xem tất cả »
        </a>
      </div>
      <div className="candidates-grid">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <img
              src={`/assets/${candidate.avatar}`}
              alt={candidate.name}
              className="avatar"
            />
            <div className="candidate-info">
              <p className="job-title">🔗 {candidate.job}</p>
              <p className="name">{candidate.name}</p>
              <p className="detail">
                🎓 {candidate.education} | ⭐ {candidate.experience}
              </p>
              <p className="salary">💰 {candidate.salary}</p>
              <p className="time">⏳ {candidate.time}</p>
              <p className="rating">{renderStars(candidate.rating)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestCandidates;
