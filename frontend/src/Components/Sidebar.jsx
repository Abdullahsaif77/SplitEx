import React, { useState } from "react";
import Logo from "../assets/Logo.png";
import home from "../assets/home.png";
import group from "../assets/group.png";
import Expenses from "../assets/expenses.png";
import Settlement from "../assets/Settlement.png";
import profileSetting from "../assets/profileSetting.png";
import logout from "../assets/logout.png";
import balance from "../assets/balance.png";
import users from "../assets/users.png";
import "../styles/sideBar.css";
import { useContext } from "react";
import { PageContext } from "../apis/Context";

const Sidebar = ({ closeSidebar }) => {

  const {setActivePage} = useContext(PageContext);

  return (
    <div className="sidebar d-flex flex-column p-3">
      <button
        className="btn btn-light d-md-none align-self-end mb-3"
        onClick={closeSidebar}>
        ✕
      </button>

      <div className="sidebar-logo mb-4 d-flex align-items-center">
        <img src={Logo} height="45" alt="Logo" />
      </div>

      <ul className="nav flex-column">
        <li className="nav-item hoverEffect" onClick={()=>setActivePage("Home")}>
          <img src={home} height="22" alt="home" className="me-2" />
          <span>Home</span>
        </li>
        <li className="nav-item hoverEffect" onClick={()=>setActivePage("Balances")}>
          <img src={balance} height="22" alt="balance" className="me-2" />
          <span>Balances</span>
        </li>
        <li className="nav-item hoverEffect" onClick={()=>setActivePage("Friends")}>
          <img src={users} height="22" alt="users" className="me-2" />
          <span>Friends</span>
        </li>
        <li className="nav-item hoverEffect" onClick={()=>setActivePage("Groups")}>
          <img src={group} height="22" alt="groups" className="me-2" />
          <span>Groups</span>
        </li>
        <li className="nav-item hoverEffect" onClick={()=>setActivePage("Expenses")}>
          <img src={Expenses} height="22" alt="expenses" className="me-2" />
          <span>Expenses</span>
        </li>
        <li className="nav-item hoverEffect mb-3" onClick={()=>setActivePage("Settlements")}>
          <img src={Settlement} height="22" alt="settlements" className="me-2" />
          <span>Settlements</span>
        </li>
      </ul>

      <hr />

      <ul className="nav flex-column mt-auto">
        <li className="nav-item hoverEffect">
          <img src={profileSetting} height="22" alt="settings" className="me-2" />
          <span>Profile Settings</span>
        </li>
        <li className="nav-item hoverEffect mt-2">
          <img src={logout} height="22" alt="logout" className="me-2" />
          <span>Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
