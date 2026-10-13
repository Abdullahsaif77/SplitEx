import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import Home from "../pages/Home";
import Groups from "../pages/Groups";
import Expenses from "../pages/Expenses";
import Friends from "../pages/Users";
import Balances from "../pages/Balances";
import Settlements from "../pages/Settlements";
import { PageContext } from "../apis/Context";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ActivePage } = useContext(PageContext);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close the sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [ActivePage, isMobile]);

  // Escape closes sidebar on mobile
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const closeSidebar = () => setIsSidebarOpen(false);

  const renderPage = () => {
    const pages = {
      Home: <Home />,
      Groups: <Groups />,
      Expenses: <Expenses />,
      Friends: <Friends />,
      Balances: <Balances />,
      Settlements: <Settlements />,
    };
    return pages[ActivePage] || <Home />;
  };

  return (
    <div className="dashboard-layout">
      {/* Editorial paper texture — replaces blurred gradient circles */}
      <div className="paper-grain" aria-hidden="true" />

      {/* Mobile overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-container ${isSidebarOpen ? "sidebar-open" : ""}`}
        aria-hidden={isMobile && !isSidebarOpen}
      >
        <Sidebar closeSidebar={closeSidebar} />
      </aside>

      {/* Main content */}
      <div className={`main-content-area ${isMobile ? "mobile-view" : ""}`}>
        <Navbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="content-wrapper">
          <div className="page-content" key={ActivePage}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;