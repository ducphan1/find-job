// src/actions/authActions.js
import axios from "axios";

export const login = (email, password) => async (dispatch) => {
  try {
    console.log("login - Sending request with:", { email, password });
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    const { token, user } = response.data;
    console.log("login - API response:", { token, user });

    if (!token || !user) throw new Error("Invalid login response");

    localStorage.setItem("token", token);
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { user, token },
    });
    console.log("login - Dispatched LOGIN_SUCCESS with:", { user, token });
  } catch (error) {
    console.error("login - Error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const loadUser = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  console.log("loadUser - Token from localStorage:", token);
  if (!token) return;

  try {
    console.log("loadUser - Fetching user data with token:", token);
    const response = await axios.get("http://localhost:5000/api/auth/getme", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("loadUser - API response:", response.data);
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { user: response.data.user, token },
    });
    console.log("loadUser - Dispatched LOGIN_SUCCESS");
  } catch (error) {
    console.error("loadUser - Error:", error.response?.data || error.message);
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    dispatch({ type: "LOGOUT" });
  }
};

export const logout = () => (dispatch) => {
  console.log("logout - Clearing localStorage and dispatching LOGOUT");
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
  dispatch({ type: "LOGOUT" });
};
