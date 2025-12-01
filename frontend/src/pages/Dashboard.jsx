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
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ActivePage } = useContext(PageContext);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const renderPage = () => {
    const pages = {
      Home: <Home />,
      Groups: <Groups />,
      Expenses: <Expenses />,
      Friends: <Friends />,
      Balances: <Balances />,
      Settlements: <Settlements />
    };
    return pages[ActivePage] || <Home />;
  };

  return (
    <div className="dashboard-layout">
      {/* Background Elements */}
      <div className="background-gradients">
        <div className="gradient-circle-1"></div>
        <div className="gradient-circle-2"></div>
        <div className="gradient-circle-3"></div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      {/* Main Content Area */}
      <div className={`main-content-area ${isMobile ? 'mobile-view' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Content wrapper */}
        <div className="content-wrapper">
          <div className="page-content">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;