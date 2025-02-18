import React, { useEffect, useState, useRef  } from "react";
import { Link, useNavigate } from "react-router-dom";
import userlogo from "../src/images/logo.svg.svg";
import axios from "axios";
import ProfileImg from "./Assests/profile.jpg";

function Header({ selectedItem }) {
  const [isOffcanvasVisible, setOffcanvasVisible] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const offcanvasRef = useRef(null);
  const userProfileRef = useRef(null);
console.log ( selectedItem ,"selectedItem");

  const adminData = sessionStorage.getItem("admin");
  let parsedAdminData = null;

 
  if (adminData && adminData !== "undefined") {
    try {
      parsedAdminData = JSON.parse(adminData);

      
    } catch (error) {
      console.error("Error parsing admin data:", error);
    }
  }
  const toggleOffcanvas = () => {
    setOffcanvasVisible(!isOffcanvasVisible);
  };
  const handleClickOutside = (event) => {
    if (
      offcanvasRef.current && !offcanvasRef.current.contains(event.target) &&
      userProfileRef.current && !userProfileRef.current.contains(event.target)
    ) {
      setOffcanvasVisible(false);
    }
  };
  useEffect(() => {
  
    document.addEventListener("mousedown", handleClickOutside);
    
   
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleSearch = async () => {
    if (!localQuery.trim()) {
      setError("Search term is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/search`,
        { search: localQuery.trim() }
      );

      if (response.data.status === "success") {
        const { data } = response;
        navigate("/report", { state: { searchData: data } });
      } else {
        setError("No results found.");
      }
    } catch (error) {
      console.error("An error occurred while fetching the search results:", error);
      setError("Failed to fetch search results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem("admin"); 
    window.location.href = "/"; 
    // try {
    //   const response = await axios.get(
    //     "https://makemydocuments.nakshatranamahacreations.in/logout.php"
    //   );

    //   if (response.status === 200) {
    //     localStorage.removeItem("authToken");
    //     sessionStorage.removeItem("authToken");
    //     navigate("/new-leads");
    //   } else {
    //     console.error("Failed to sign out");
    //   }
    // } catch (error) {
    //   console.error("Error during sign out", error);
    // }
  };

  return (
    <header
      className="header"
      style={{
        fontFamily: "Poppins, sans-serif",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div className="header-left d-none d-lg-block">
        <h2  style={{ fontSize: "20px", marginLeft: "1%" }}>{selectedItem}</h2 >
      </div>
      <div className="search-input">
        <input
          type="text"
          placeholder="Search..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "5px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginLeft: "-108%",
            width: "150%",
          }}
        />
      </div>
      <div className="user-profile">
        <div className="header-right" onClick={toggleOffcanvas} ref={userProfileRef}>
          <img
              src= { parsedAdminData?.profile_picture || ProfileImg }
            alt="User Logo"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%", 
              display: "block",
              border: "1px solid #ddd",
             cursor:'pointer',
              objectFit: "cover",
             
            }}
          />
        </div>
      </div>

      {/* Offcanvas Menu */}
      {isOffcanvasVisible && (
        <div
        ref={offcanvasRef}
          className="offcanvas-menu"
          style={{
            position: "absolute",
            top: "100%", // Places it directly below the header
            right: "10px",
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            width: "250px",
          }}
        >
          <div
            className="offcanvas-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
            }}
          >
            <img
              src= { parsedAdminData?.profile_picture || ProfileImg }
              alt="User Logo"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%", 
                display: "block",
                border: "1px solid #ddd",
                objectFit: "cover",
                // border: "1px solid #000",
              }}
            />
            <div style={{ marginLeft: "10px" }}>
              <p
                style={{
                  color: "#222",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
            
            
                {parsedAdminData?.name }
              </p>
              <p
                style={{
                  color: "#222",
                  fontSize: "10px",
                  marginBottom: "0px",
                }}
              >
              
              
                {parsedAdminData?.username }
              </p>
            </div>
          </div>

          <div
            className="offcanvas-options"
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            <Link to="/my-profile" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                }}
              >
                <p
                  style={{
                    color: "#000",
                    fontSize: "14px",
                    margin: "0",
                    textAlign: "left",
                  }}
                >
                  Profile
                </p>
                <p
                  style={{
                    color: "#000",
                    fontSize: "14px",
                    margin: "0",
                    textAlign: "right",
                  }}
                >
                  &gt;
                </p>
              </div>
            </Link>
            <div
              style={{
                height: "1px",
                backgroundColor: "#ccc",
                marginBottom: "16px",
              }}
            ></div>
            <button
              className="btn signout-btn"
              onClick={handleSignOut}
              style={{
                backgroundColor: "#056DB8",
                color: "#fff",
                padding: "10px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "none",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
