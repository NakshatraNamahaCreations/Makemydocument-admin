import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  BsFillGearFill,
  BsPlusCircle,
  BsPersonPlus,
  BsClockHistory,
  BsCalendar2Event,
  BsPersonLinesFill,
  BsArrowRepeat,
  BsCheckCircle,
  BsXCircle,
  BsHouseDoor,
  BsList,
} from "react-icons/bs";
import styled from "styled-components";
import logo from "./images/logo.svg.svg"; // Adjust path if necessary

const SidebarContainer = styled.aside`
  width: 250px;
  height: 100vh;
  background-color: #fff;
  color: #000;
  position: fixed;
  left: 0;
  top: 0;
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
  padding-top: 20px;
  border-right: 1px solid #ddd;
  z-index: 1100;

  @media (max-width: 768px) {
    width: 80%;
    max-width: 250px;
    transform: ${({ isOpen }) => (isOpen ? "translateX(0)" : "translateX(-100%)")};
  }
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 7px 20px;
  margin-bottom: 10px; /* Add space between items */
  transition: background 0.3s ease;
  cursor: pointer;
  border-radius: 5px; /* Optional for rounded edges */

  &:hover {
    background: #f5f5f5;
  }

  &:last-child {
    margin-bottom: 0; /* Prevent extra margin on the last item */
  }
`;


const SidebarLink = styled(Link)`
  text-decoration: none;
  color: #000;
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
`;

const SidebarIcon = styled.span`
  margin-right: 10px;
  font-size: 18px;
`;

const SidebarLabel = styled.span`
  flex-grow: 1;
`;

const MobileMenuButton = styled.button`
  position: fixed;
  top: 15px;
  left: 15px;
  background: #fff;
  border: 1px solid #ddd;
  color: #000;
  padding: 10px;
  cursor: pointer;
  z-index: 1200;
  border-radius: 5px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${({ show }) => (show ? "block" : "none")};
`;

function Sidebar({ selectedItem, setSelectedItem }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(!isMobile);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false); 
    }
  }, [location.pathname, isMobile]); // Ensure sidebar closes on navigation

  const menuItems = [
    { id: 1, label: "Dashboard", path: "/home", icon: <BsHouseDoor /> },
    { id: 2, label: "Add Leads", path: "/add-leads", icon: <BsPlusCircle /> },
    { id: 3, label: "New Leads", path: "/new-leads", icon: <BsPersonPlus /> },
    { id: 4, label: "Over Due", path: "/over-due", icon: <BsClockHistory /> },
    { id: 5, label: "Today's Follow-up", path: "/today-follow-up", icon: <BsCalendar2Event /> },
    { id: 6, label: "Follow-up", path: "/follow-up", icon: <BsPersonLinesFill /> },
    { id: 7, label: "In Process", path: "/in-process", icon: <BsArrowRepeat /> },
    { id: 8, label: "Converted", path: "/converted", icon: <BsCheckCircle /> },
    { id: 9, label: "Dead", path: "/dead", icon: <BsXCircle /> },
    { id: 10, label: "Settings", path: "/setting", icon: <BsFillGearFill /> },
  ];
  const handleNavigation = (path) => {
    if (location.pathname === path) {
      navigate(0); // Forces a full reload
    } else {
      navigate(path); // Navigates normally
      setIsOpen(false);
    }
  };

  const adminData = JSON.parse(sessionStorage.getItem("admin"));


  const filteredMenuItems =
    adminData && adminData.role === "admin"
      ? menuItems
      : menuItems.filter(
          (item) => item.label !== "Settings" && item.label !== "Add Leads"
        );

  useEffect(() => {
    const activeItem = filteredMenuItems.find(
      (item) => item.path === location.pathname
    );
    if (activeItem) {
      setSelectedItem(activeItem.label);
    }
  }, [location.pathname, filteredMenuItems, setSelectedItem]);

  return (
    <>
      {/* Mobile Toggle Button (Always Visible) */}
      {isMobile && (
        <MobileMenuButton onClick={() => setIsOpen(!isOpen)}>
          <BsList size={24} />
        </MobileMenuButton>
      )}

      {/* Sidebar */}
      <SidebarContainer isOpen={isOpen}>
      <SidebarList>
        {filteredMenuItems.map((item) => (
          <SidebarListItem key={item.id}>
            <SidebarLink
              to={item.path}
              onClick={(e) => {
                e.preventDefault(); // Prevent default React Router behavior
                handleNavigation(item.path);
              }}
            >
              <SidebarIcon>{item.icon}</SidebarIcon>
              <SidebarLabel>{item.label}</SidebarLabel>
            </SidebarLink>
          </SidebarListItem>
        ))}
      </SidebarList>
    </SidebarContainer>

      {/* Overlay to Close Sidebar on Mobile Click */}
      <Overlay show={isMobile && isOpen} onClick={() => setIsOpen(false)} />
    </>
  );
}

export default Sidebar;
