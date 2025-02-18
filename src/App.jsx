import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Home from "./Home";
import AddLeads from "./Add-leads";
import NewLeads from "./New-leads";
import OverDue from "./Over-due";
import TodayFollowUp from "./Today-Follow-up";
import FollowUp from "./FollowUp";
import InProcess from "./InProcess";
import Converted from "./Converted";
import Dead from "./Dead";
import Setting from "./Setting";
import LoginPage from "./LoginPage";
import MyProfilePage from "./MyProfilePage"; // Import the correct file
import { SearchProvider } from "./SearchContext"; // Import SearchProvider
import Report from "./Report";
import PaytmPayment from "./PaytmPayment";
import Loading from "./Component/Loading";
import { useSelector } from "react-redux";

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const [profileImage, setProfileImage] = useState(null);
  const loading = useSelector((state) => state.loader.loading);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

 
  const Layout = ({ children }) => {
    const location = useLocation();

 
    const isAuthenticated = true;

    const shouldShowSidebarAndHeader = location.pathname !== "/";

   
    if (!isAuthenticated && location.pathname !== "/") {
      return <Navigate to="/" />;
    }

    return (
      <div className="grid-container">
        {shouldShowSidebarAndHeader && (
          <>
            <Sidebar
              openSidebarToggle={openSidebarToggle}
              OpenSidebar={OpenSidebar}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
            <Header selectedItem={selectedItem} OpenSidebar={OpenSidebar} profileImage={profileImage} />
          </>
        )}
        {children}
      </div>
    );
  };

  return (
    <SearchProvider>
      <Loading loading={loading}/>
      <Router>
        <Layout>
          <Routes>
            {/* Login route */}
            <Route path="/" element={<LoginPage />} />

            {/* Protected routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/add-leads" element={<AddLeads />} />
            <Route path="/new-leads" element={<NewLeads  selectedItem={selectedItem}/>} />
            <Route path="/over-due" element={<OverDue selectedItem={selectedItem} />} />
            <Route path="/today-follow-up" element={<TodayFollowUp selectedItem={selectedItem}/>} />
            <Route path="/follow-up" element={<FollowUp selectedItem={selectedItem}/>} />
            <Route path="/in-process" element={<InProcess selectedItem={selectedItem}/>} />
            <Route path="/converted" element={<Converted selectedItem={selectedItem}/>} />
            <Route path="/dead" element={<Dead selectedItem={selectedItem}/>} />
            <Route path="/report" element={<Report />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/paytms" element={<PaytmPayment />} />

            <Route
            
              path="/my-profile"
              element={<MyProfilePage profileImage={profileImage} setProfileImage={setProfileImage} />}
            />
          </Routes>
        </Layout>
      </Router>
    </SearchProvider>
  );
}

export default App;
