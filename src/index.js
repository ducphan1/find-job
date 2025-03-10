import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // Import Provider từ react-redux
import store from "./store";
import App from "./App";
import "@ant-design/v5-patch-for-react-19";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      {/* Bao bọc App trong Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
