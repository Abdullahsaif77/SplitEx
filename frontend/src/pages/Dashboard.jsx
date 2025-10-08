import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import Home from "../pages/Home"
import Groups from "../pages/Groups"
import Expenses from "../pages/Expenses"
import Friends from "../pages/Users"
import Balances from "../pages/Balances"
import Settlements from "../pages/Settlements"
import { PageContext } from "../apis/Context";
import { useContext } from "react";


const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ActivePage } =  useContext(PageContext);

  const render = ()=>{
    if(ActivePage == "Home"){
      return <Home/>
    }else if(ActivePage == "Groups"){
      return <Groups/>
    }else if(ActivePage == "Expenses"){
      return <Expenses/>
    }else if(ActivePage == "Friends"){
      return <Friends/>
    }else if(ActivePage == "Balances"){
      return <Balances/>
    }else if(ActivePage == "Settlements"){
      return <Settlements/>
    }else{
      return <Home/>
    }
  }
 
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
   
    <div className="row g-0">
      <div className={`col-2 col-md-2 sidebar-container ${isSidebarOpen ? "open" : ""}`}>
        <Sidebar closeSidebar={closeSidebar} />
      </div>
      
      <div className="col">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="p-3">
         {render()};
        </div>
      </div>
    </div>
    
  );
};

export default Dashboard;
