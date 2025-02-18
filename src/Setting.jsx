import React, { useState, useEffect } from "react";
import axios from "axios";
import userIcon from "../src/images/user.svg";
import usericon from "../src/images/profileuser.svg";
import editIcon from "../src/images/edit.svg";
import deleteIcon from "../src/images/delete.svg";
import { FaCheck } from "react-icons/fa"; // Importing icons

const Setting = () => {
  const [showTable, setShowTable] = useState(false); // State to control table visibility
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [selectedDate, setSelectedDate] = useState("");
  const [comment, setComment] = useState("");
  const [submittedComment, setSubmittedComment] = useState("");
  const [tableData, setTableData] = useState([]); // State to hold API data
  const [currentTableData, setCurrentTableData] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleStatusToggle = (id, status) => {
    console.log(`Toggling status for ID: ${id}, current status: ${status}`);
    
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/api/user/updateUser/`,
        {
          id: id,
          status: status === "active" ? "inactive" : "active",
        }
      )
      .then((response) => {
        console.log("API Response:", response.data);
  
        // Check for status 'success' in the API response
        if (response.data.status === "success") {
          const updatedData = currentTableData.map((row) =>
            row._id === id
              ? { ...row, status: status === "active" ? "inactive" : "active" }
              : row
          );
          setCurrentTableData(updatedData);
        } else {
          console.error("Failed to update status:", response.data.message);
          alert("Failed to update status: " + (response.data.message || "Unknown error"));
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error.response || error.message);
        alert("Error updating status. Please try again.");
      });
  };
  
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/user/getUsers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        // Check if response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        // Parse the JSON response
        const result = await response.json();
        // setTableData(result);
        setCurrentTableData(result.users)
  
        // if (result.status === "success" && result.data) {
        //   setTableData(result.data); // Update table data if API returns success
        // } else {
        //   console.error("Failed to fetch data: ", result.message);
        //   alert("Failed to fetch data: " + result.message);
        // }
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users. Please try again later.");
      }
    };
  
    // Fetch only when showTable is true
    if (showTable) {
      fetchUsers();
    }
  }, [showTable]);
  
  const [editingData, setEditingData] = React.useState(null);
  const handleEditClick = (id) => {
  
    if (!id) {
      console.error("Error: User ID is missing in handleEditClick");
      return;
    }
  
    // Find the user data by ID
    const rowToEdit = currentTableData.find((row) => row._id === id);
  
    if (rowToEdit) {
      console.log("Row to Edit:", rowToEdit); // Debugging
  
      setEditingData({ ...rowToEdit, id: id }); // Ensure ID is set
      setShowForm(true);
      setShowTable(false);
    } else {
      console.error("Error: Row with ID not found in tableData.");
    }
  };
  // console.log(editingData._id);

  const handleSubmit = async (event) => {
    event.preventDefault();

    
  
    const name = event.target.name.value;
    const username = event.target.username.value;
    const role = event.target.role.value;
    const email = event.target.email.value;
    const mobile = event.target.mobile.value.toString();
    const password = event.target.password.value;
  
    try {
      if (editingData && !editingData.id) {
        throw new Error("User ID is missing in editingData.");
      }
  
      // Prepare JSON payload
      const payload = {
        id: editingData ? editingData.id : undefined, 
        name,
        username,
        role,
        email,
        mobileNumber: mobile,
        password,
      };
  
      let url = `${process.env.REACT_APP_API_URL}/api/auth/signup`;
      let method = "POST";
  
      if (editingData) {
        console.log("Editing User Data:", editingData); 
  
        url = `${process.env.REACT_APP_API_URL}/api/user/editUser/${editingData.id}`; //${userId}
        method = "PUT"; 
      }
  
      console.log("Sending Request:",  payload ); 
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      console.log("API Response:", data); // Debugging
  
      if (data.status === "error") {
        throw new Error(data.message);
      }
  
      alert(editingData ? "Admin updated successfully!" : "New Admin created successfully!");
  
      setTableData((prevData) =>
        editingData
          ? prevData.map((row) =>
              row.id === editingData.id ? { ...row, ...payload } : row
            )
          : [...prevData, { id: data.id, ...payload }]
      );
  
      setEditingData(null);
      setShowForm(false);
      setShowTable(true);
    } catch (error) {
      console.error("Error in handleSubmit:", error.message);
      alert(error.message || "An error occurred while processing the request.");
    }
  };
  
  
  
  

  const handleUserIconClick = () => {
    setShowTable(true);
  };

  const handleNewAdminClick = () => {
    setShowTable(false);
    setShowForm(true);
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  
  //   const name = event.target.name.value;
  //   const username = event.target.username.value;
  //   const role = event.target.role.value;
  //   const email = event.target.email.value;
  //   const mobile = event.target.mobile.value.toString();
  //   const password = event.target.password.value;
  
  //   try {
  //     // Prepare JSON payload
  //     const payload = {
  //       name,
  //       username,
  //       role,
  //       email,
  //       mobilenumber: mobile,
  //       password,
  //     };
  
  //     let url = "https://makemydocuments.nakshatranamahacreations.in/create-user.php";
  //     let method = "POST";
  
  //     if (editingData) {
  //       if (!editingData.id) {
  //         throw new Error("User ID is missing in editingData.");
  //       }
  //       payload.id = editingData.id;
  //       url = `https://makemydocuments.nakshatranamahacreations.in/edit-user.php?id=${editingData.id}`;
  //     }
  
  //     const response = await fetch(url, {
  //       method,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload), // Convert payload to JSON
  //     });
  
  //     const data = await response.json();
  
  //     if (data.status === "error") {
  //       throw new Error(data.message);
  //     }
  
  //     alert(editingData ? "Admin updated successfully!" : "New Admin created successfully!");
  
  //     setTableData((prevData) =>
  //       editingData
  //         ? prevData.map((row) =>
  //             row.id === editingData.id ? { ...row, ...payload } : row
  //           )
  //         : [...prevData, { id: data.id, ...payload }]
  //     );
  
  //     setEditingData(null);
  //     setShowForm(false);
  //     setShowTable(true);
  //   } catch (error) {
  //     console.error("Error:", error.message);
  //     alert(error.message || "An error occurred while processing the request.");
  //   }
  // };
  
  
  
  
  
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  // const rowsPerPage = 5; // Number of rows per page
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentTableData(
      tableData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      )
    );
  }, [tableData, currentPage, rowsPerPage]);

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const totalPages = Math.ceil(tableData.length / rowsPerPage);


// Handle delete click
const handleDeleteClick = (id) => {
  // Check if the ID is valid before sending the request
  if (!id) {
    console.log("Error: User ID is required");
    return; // Exit if ID is not valid
  }

  console.log("Delete icon clicked for ID:", id);


  fetch(`${process.env.REACT_APP_API_URL}/api/user/deleteUser/${id}`, {
    method: 'DELETE', 
  })
  .then(response => response.json())
  .then(data => {
  
    if (data.status === 'success') {
      alert("User Deleted Successfully");

      // Remove the deleted user from the current table data
      setCurrentTableData(prevData => prevData.filter(row => row._id !== id));
    } else {
      console.log('Error deleting user:', data.message || 'Unknown error');
    }
  })
  .catch(error => {
    // Handle errors if the fetch fails
    console.error('Error:', error);
  });
};


  

  const handleBackClick = () => {
    setEditingData(null);
    setShowForm(false);
    setShowTable(true);
  };

  return (
    <>
    <div style={styles.container} className="d-none d-lg-block">
      {/* Conditionally render User Icon Button */}
      {!showTable && !showForm && (
        <button style={styles.button} onClick={handleUserIconClick}>
          <img src={userIcon} alt="User Icon" style={styles.image} />
        </button>
      )}

      {showTable && (
  <>
    <div style={styles.buttonContainer}>
      <button
        style={styles.newAdminButton}
        onClick={handleNewAdminClick}
      >
        <span style={{ fontSize: "16px" }}>+</span> Add New User
      </button>
    </div>
    <div
      className="new-leads-container"
      style={{ width: "380%", marginLeft: "227px" }}
    >
      <table className="leads-table" style={{ width: "100%" }}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeader}>Sl. No</th>
            <th style={styles.tableHeader}>Name</th>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTableData.map((row, index) => (
            <tr key={row.id || index} style={styles.tableRow}>
              <td style={styles.tableData}>
                {index + 1 + (currentPage - 1) * rowsPerPage}
              </td>
              <td style={styles.tableData}>{row.name || "N/A"}</td>
              <td style={styles.tableData}>{row.email || "N/A"}</td>
              <td style={{ padding: "10px" }}>
                {row.status === "active" ? (
                  <FaCheck style={{ color: "green" }} />
                ) : (
                  <span style={{ color: "red", fontSize: "20px" }}>
                    ×
                  </span>
                )}
                {row.status === "active" ? "Active" : "Inactive"}
              </td>
              <td style={styles.actions}>
                <div>
                  {console.log("the row",row._id)
                  }
                <img
                  src={editIcon}
                  alt="Edit Icon"
                  style={styles.actionIcon}
                  onClick={() => handleEditClick(row._id)}
                />
                </div>
                <br/>
                <div>
                  <img
                    src={deleteIcon}
                    alt="Delete Icon"
                    style={styles.actionIcon}
                    onClick={() => handleDeleteClick(row._id)} 
                  />
                </div>
                <br/>
                <div>
                <input
                  type="checkbox"
                  checked={row.status === "active"}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevent conflict with parent elements
                    handleStatusToggle(row._id, row.status);
                  }}
                  style={{ marginLeft: "-40%" }}
                />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        {/* Pagination row inside the table */}
        <tfoot>
          <tr>
            <td colSpan={5} style={styles.paginationContainer}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={styles.paginationButton}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  style={{
                    ...styles.paginationButton,
                    backgroundColor:
                      currentPage === i + 1 ? "#007bff" : "#f5f5f5",
                    color: currentPage === i + 1 ? "#fff" : "#000",
                  }}
                >
                  {i + 1} 
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={styles.paginationButton}
              >
                Next
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </>
)}
      {/* Display New Admin Form */}
      {showForm && (
  <form onSubmit={handleSubmit} style={styles.form}>
    <h3>{editingData ? "Edit " : "Add New User"}</h3>

    {/* First Row: Name, Username, and Email */}
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={styles.inputGroup}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          style={styles.input}
          required
          defaultValue={editingData?.name || ""} // Pre-fill if editingData exists
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Username</label>
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          style={styles.input}
          required
          defaultValue={editingData?.username || ""} // Pre-fill if editingData exists
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          style={styles.input}
          required
          defaultValue={editingData?.email || ""}
        />
      </div>
    </div>

    {/* Second Row: Mobile Number, Role, and Password */}
    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
      <div style={styles.inputGroup}>
        <label>Mobile Number</label>
        <input
          type="tel"
          name="mobile"
          placeholder="Enter Mobile Number"
          style={styles.input}
          required
          defaultValue={
            Array.isArray(editingData?.mobileNumber)
              ? editingData.mobileNumber.join(", ")
              : editingData?.mobileNumber || ""
          }
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Role</label>
        <select
          name="role"
          style={styles.input}
          defaultValue={editingData?.role || ""}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      <div style={styles.inputGroup}>
        <label>Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter Password"
            style={styles.input}
            required
            defaultValue={
              Array.isArray(editingData?.password)
                ? editingData.password.join(", ")
                : editingData?.password || ""
            }
          />
          <span
            onClick={togglePasswordVisibility}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div
      style={{
        justifyContent: "space-between",
        display: "flex",
        marginTop: "20px",
      }}
    >
      <button
        type="button"
        onClick={handleBackClick}
        style={styles.backButton}
      >
        Back
      </button>
      <button type="submit" style={styles.submitButton}>
        {editingData ? "Update" : "Submit"}
      </button>
    </div>
  </form>
)}

    </div>

    
    <div className="container d-block d-lg-none">
      <div style={{ padding: "15px", maxWidth: "400px", margin: "0 auto" }}>
        {!showTable && !showForm && (
          <button style={{ background: "none", border: "none" }} onClick={handleUserIconClick}>
            <img src={userIcon} alt="User Icon" style={{ width: "193px" }} />
          </button>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ textAlign: "center" }}>{editingData ? "Edit User" : "Add New User"}</h3>
            <label>Name</label>
            <input style={{ padding: "10px", fontSize: "16px" }} type="text" name="name" placeholder="Enter Name" required defaultValue={editingData?.name} />
            <label>Username</label>
            <input style={{ padding: "10px", fontSize: "16px" }} type="text" name="username" placeholder="Enter Username" required defaultValue={editingData?.username} />
            <label>Email</label>
            <input style={{ padding: "10px", fontSize: "16px" }} type="email" name="email" placeholder="Enter Email" required defaultValue={editingData?.email} />
            <label>Mobile Number</label>
            <input style={{ padding: "10px", fontSize: "16px" }} type="tel" name="mobile" placeholder="Enter Mobile Number" required defaultValue={editingData?.mobilenumber} />
            <label>Role</label>
            <select style={{ padding: "10px", fontSize: "16px" }} name="role" required defaultValue={editingData?.role}>
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ padding: "10px", fontSize: "16px", width: "100%" }}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                required
                defaultValue={editingData?.password || ""}
              />
              <span onClick={togglePasswordVisibility} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="submit" style={{ padding: "10px", fontSize: "16px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px" }}>{editingData ? "Update" : "Submit"}</button>
              <button type="button" style={{ padding: "10px", fontSize: "16px", backgroundColor: "gray", color: "white", border: "none", borderRadius: "5px" }} onClick={handleBackClick}>Back</button>
            </div>
          </form>
        ) : (
          showTable && (
            <div style={{ textAlign: "center" }}>
              <button style={{ padding: "10px", fontSize: "16px", backgroundColor: "#1eade7", color: "white", border: "none", borderRadius: "5px" }} onClick={() => setShowForm(true)}>
                + Add New User
              </button>
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table className="leads-table" style={{ width: "100%", borderCollapse: "collapse", overflowX: "auto", display: "block" }}>
                  <thead>
                    <tr>
                      <th>Sl. No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
              
                    {currentTableData.map((row, index) => (
                      <tr key={row.id || index}>
                        <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                        <td>{row.name || "N/A"}</td>
                        <td>{row.email || "N/A"}</td>
                        <td>{row.status === "active" ? <FaCheck style={{ color: "green" }} /> : "Inactive"}</td>
                        <td>
                          <img src={editIcon} alt="Edit" onClick={() => handleEditClick(row._id)} style={{ cursor: "pointer", marginRight: "10px", width:'24%' }} />
                          <img src={deleteIcon} alt="Delete" onClick={() => handleDeleteClick(row._id)} style={{ cursor: "pointer", width:'24%'}} />
                          <input type="checkbox" checked={row.status === "active"} onChange={() => handleStatusToggle(row._id, row.status)} style={{ marginLeft: "10px" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
    </>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
  },
  image: {
    width: "100%",
    marginLeft: "125%",
    marginTop: "130px",
    height: "100%",
  },

  inputGroup: {
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  buttonContainer: {
    textAlign: "left",
    marginTop: "80px",
    marginLeft: "114%",
  },
  newAdminButton: {
    padding: "8px 10px",
    backgroundColor: "#1eade7",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  table: {
    marginLeft: "150%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    backgroundColor: "#fff",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
    width: "500%",
    borderRadius: "10px",
  },
  tableHead: {
    backgroundColor: "#10386c",
    color: "white",
  },
  tableHeaderCell: {
    padding: "10px",
    textAlign: "center",
    fontWeight: "bold",
  },
  tableRow: {
    borderBottom: "1px solid #ddd",
    ":hover": {
      backgroundColor: "#f9f9f9",
    },
  },
  tableData: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  statusButton: {
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    color: "#fff",
    cursor: "pointer",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // Add spacing between elements
  },
  actionIcon: {
    cursor: "pointer",
    width: "20px",
    height: "20px",
  },
  paginationContainer: {
    textAlign: "center",
    padding: "10px",
    backgroundColor: "#f9f9f9",
  },
  paginationButton: {
    margin: "0 5px",
    padding: "5px 10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    cursor: "pointer",
  },
  form: {
    margin: "100px 190%",
    padding: "20px",
    width: "300%",
    backgroundColor: "#f4f4f4",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  inputGroup: {
    flex: "1", // Ensures each input takes equal space
    display: "flex",
    textAlign: "left",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
  },
  tableHeaderRow: {
    backgroundColor: "#10386c",
    color: "white",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
  },
  tableHeader: {
    padding: "12px 16px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Setting;
