import React from "react";
import { Layout } from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/PublicLayout.css";

const { Content } = Layout;

const PublicLayout = ({ children }) => {
  return (
    <Layout className="public-layout">
      <Header />
      <Content className="content">{children}</Content>
      <Footer />
    </Layout>
  );
};

export default PublicLayout;
