import React, { useState, useRef } from "react";
import axios from "axios";
import './profilepage.css';
import ProfileImg from "./Assests/profile.jpg";
import { useNavigate } from "react-router-dom";

function MyProfilePage() {
  const adminData = JSON.parse(sessionStorage.getItem("admin"));
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobilenumber, setMobile] = useState("");
  const [password, setPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 
  const [profileImage, setProfileImage] = useState(adminData?.profile_picture);

  const fileInputRef = useRef(null);
  const navigate = useNavigate(); 
 
  const [editingData, setEditingData] = useState(adminData);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChangePassword = (event) => {
    event.preventDefault();
    handleTogglePassword(); 
  };

  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setProfileImage(reader.result); 
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file); // Set the file object for the profile image
    }
  };
  
  
  
  // Handle Change Photo Button
  const handleChangePhoto = () => {
    fileInputRef.current.click();
  };
  
  const handleSave = async () => {
    try {
      if (!adminData || !adminData.id) {
        alert("User ID is missing.");
        return;
      }
  
      // Validate fields
      if (!name && !username && !email && !mobilenumber && !password && !profileImage) {
        alert("No fields to update.");
        return;
      }
  
      const formData = new FormData();
      
      // Append updated fields to FormData
      formData.append("id", adminData.id);
      formData.append("name", name || adminData.name);
      formData.append("username", username || adminData.username);
      formData.append("email", email || adminData.email);
      formData.append("mobilenumber", mobilenumber || adminData.mobilenumber);
      formData.append("password", newPassword || password || adminData.password);
  
      // If there's a profile image, append it
      if (profileImage) {
        formData.append("profile_picture", profileImage);
      }
  
      // Send FormData to the server
      const response = await axios.put(
       `${process.env.REACT_APP_API_URL}/api/user/editUser/${adminData.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", 
          },
        }
      );
  
      if (response.data && response.data.status === "success") {
        alert("Profile updated successfully");
        const data = response.data.user;
console.log(response.data.user);

        sessionStorage.setItem("admin", JSON.stringify(data));
  
        setEditingData((prevData) => ({
          ...prevData,
          name: data.name,
          username: data.username,
          email: data.email,
          mobilenumber: data.mobilenumber,
          password: data.password,
          profileImage: data.profile_picture,
        }));
  
        setName(data.name);
        setUsername(data.username);
        setEmail(data.email);
        setMobile(data.mobilenumber);
        setPassword(data.password);
        setProfileImage(data.profile_picture);
      } else {
        console.error("Backend response error:", response.data);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("An error occurred while updating the profile. Please try again.");
    }
  };
  
  
  
  const handleCancel = () => {
    navigate("/home");
  };


  // const handleSave = async () => {
  //   try {
  //     const updatedData = {
  //       id: adminData.id,
  //       name,
  //       username,
  //       email,
  //       mobilenumber,
  //       password: newPassword || password,
  //       profile_picture: profileImage, 
  //     };
  
  //     console.log("updatedData", updatedData);
  
  //     const response = await axios.post(
  //       `https://makemydocuments.nakshatranamahacreations.in/edit-user.php?id=${editingData.id}`,
  //       updatedData
  //     );
  
  //     console.log('Backend Response:', response);
  
  //     if (response.data && response.data.status === 'success') {
  //       alert("Profile updated successfully");
  
  //       console.log("response.data.data", response.data.data);
  //       localStorage.setItem("admin", JSON.stringify(response.data.data));
  
  //       const data = response.data.data;
  
  //       setEditingData((prevData) => ({
  //         ...prevData,
  //         name: data.name,
  //         username: data.username,
  //         email: data.email,
  //         mobilenumber: data.mobilenumber,
  //         password: data.password,
  //         profileImage: data.profileImage,
  //       }));
  
  //       setName(data.name);
  //       setUsername(data.username);
  //       setEmail(data.email);
  //       setMobile(data.mobilenumber);
  //       setPassword(data.password);
  //       setProfileImage(data.profileImage);
  //     } else {
  //       console.error("Backend response error:", response.data);
  //       alert("Failed to update profile. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating profile", error);
  //     alert("An error occurred while updating the profile. Please try again.");
  //   }
  // };
  
 

  return (
    <>
    <div className="new-leads-container d-none d-lg-block" style={{ width: "380%", marginLeft: "227px", marginTop: "106px" }}>
      <div style={styles.profileContainer}>
        <h2>My Profile</h2>
        <form style={styles.profileForm}>
          {/* Profile Image Section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ marginBottom: "10px" }}>
      <img
      src={
        profileImage instanceof File
          ? URL.createObjectURL(profileImage) // Use Object URL if the image is a file from FormData
          : adminData?.profile_picture?.startsWith("http")
          ? adminData.profile_picture 
          : adminData?.profile_picture || ProfileImg
      }
        alt="User Logo"
        style={{
          width: "100px",
          height: "auto",
          objectFit: "cover",
          border: "1px solid #000",
        }}
      />
    </div>

    {/* File Input for Image Upload */}
    <input
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      style={{ display: "none" }}
      ref={fileInputRef}
    />

    {/* Change Photo Button */}
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        type="button"
        onClick={handleChangePhoto}
        style={{
          padding: "5px 10px",
          backgroundColor: "#007BFF",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Change Photo
      </button>
    </div>
  </div>


          {/* Input Fields */}
          <div style={styles.inputRow}>
            <div style={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name || editingData.name || ""}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username || editingData.username || ""}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputRow}>
            <div style={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email || editingData.email || ""}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="text"
                id="mobile"
                value={mobilenumber || editingData.mobileNumber || ""}
                onChange={(e) => setMobile(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Password Section */}
          <div style={styles.formGroup}>
  <label htmlFor="password">Password</label>
  <div style={styles.passwordWrapper}>
    <input
      type={showPassword ? "text" : "password"} // Toggle between text and password type
      id="password"
      value={password || editingData.password} // Use password from state or editingData
      onChange={(e) => setPassword(e.target.value)} // Handle password input change
      placeholder="Enter your password"
      style={styles.input}
    />
     <span onClick={handleTogglePassword} style={styles.passwordIcon}>
      {showPassword ? "🙈" : "👁️"} 
    </span>
   
  </div>

  <button onClick={handleChangePassword} style={{width: "150px", 
      padding: "10px", 
      borderRadius: "8px", 
      border: "1px solid #ccc", 
      backgroundColor: "#f0f0f0", 
      color: "#333", 
      cursor: "pointer", 
      fontSize: "14px",
      marginTop: "10px",}}>Change Password</button>

</div>

          {/* Form Buttons */}
          <div style={styles.formButtons}>
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} style={styles.saveBtn}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
    <div className="profile-container d-block d-lg-none" >
      <div className="profile-card">
        <h2>My Profile</h2>

        {/* Profile Image Section */}
        <div className="profile-image-section">
          <img
            src={
              profileImage instanceof File
                ? URL.createObjectURL(profileImage) 
                : adminData?.profile_picture || "default-profile-picture.jpeg"
            }
            alt="User Logo"
            className="profile-image"
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} ref={fileInputRef} />
          <button className="change-photo-btn" onClick={handleChangePhoto}>Change Photo</button>
        </div>

        {/* Input Fields */}
        <div className="input-group">
          <label>Name</label>
          <input type="text" value={name || editingData.name || ""} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Username</label>
          <input type="text" value={username || editingData.username || ""} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email"  value={email || editingData.email || ""} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Mobile Number</label>
          <input type="text" value={mobilenumber || editingData.mobilenumber || ""} onChange={(e) => setMobile(e.target.value)} />
        </div>

        {/* Password Section */}
        <div className="input-group password-group">
          <label>Password</label>
          <div className="password-input">
            <input type={showPassword ? "text" : "password"}    value={password || editingData.password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password"/>
            <span onClick={handleTogglePassword} className="toggle-password">
              {showPassword ? "🙈" : "👁️"} 
            </span>
          </div>
          <button className="change-password-btn" onClick={handleChangePassword}>Change Password</button>
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
    </>
  );
}

const styles = {
  profileContainer: {
    maxWidth: "900px",
    width: "100%",
    padding: "20px",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  profileForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    width: "48%",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  passwordWrapper: {
    position: "relative",
  },
  passwordIcon: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "20px", // Icon size
  },
  formButtons: {
    display: "flex",
    justifyContent: "space-between",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    width: "20%",
    backgroundColor: "#f5f5f5",
    color: "#333",
  },
  saveBtn: {
    padding: "10px 20px",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    width: "20%",
    backgroundColor: "#28a745",
    color: "white",
  },
};

export default MyProfilePage;






  