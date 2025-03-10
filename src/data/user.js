// data/user.js

// Mảng chứa danh sách người dùng (mock data).
// Lưu ý: dữ liệu này chỉ tồn tại trong bộ nhớ của ứng dụng,
// khi reload trang sẽ mất vì không có cơ sở dữ liệu thực.
let users = [
  {
    id: 1,
    email: "user@gmail.com",
    password: "123456",
    role: "candidate",
    fullName: "Phan Huỳnh Đức",
  },
  {
    id: 2,
    email: "employer@gmail.com",
    password: "123456",
    role: "employer",
    fullName: "Công ty TNHH ABC",
  },
];

/**
 * Hàm kiểm tra đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns {object|null} Trả về user nếu thông tin khớp, ngược lại trả về null.
 */
export const checkLogin = (email, password) => {
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  return user || null;
};

/**
 * Hàm thêm (đăng ký) người dùng mới vào mảng users.
 * @param {object} newUser - { email, password, role, fullName }
 * @returns {object} user mới được thêm.
 */
export const addUser = (newUser) => {
  newUser.id = Date.now(); // Sinh id tạm thời
  users.push(newUser);
  return newUser;
};

/**
 * Hàm lấy danh sách tất cả user (nếu cần)
 */
export const getAllUsers = () => {
  return users;
};

export default users;
