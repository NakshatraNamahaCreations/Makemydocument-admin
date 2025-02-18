import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import { FaTrash, FaFilter } from 'react-icons/fa';
import { Helmet } from "react-helmet";
import { useDispatch } from "react-redux";


function InProcess({ selectedItem }) {
  const [leads, setLeads] = useState([]); // Initialize leads with an empty array
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [submittedComment, setSubmittedComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
    const [assignValues, setAssignValues] = useState(
      leads.map((lead) => lead.assign || "Select lead user")
    );
  const [comment, setComment] = useState("");
  const [users, setUsers] = useState([]);
  const [lead, setLead] = useState({ assign: "" });
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const adminData = JSON.parse(sessionStorage.getItem("admin"));
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data1 = { assign: adminData.name };

        // Fetch the leads from the API
        const response = await fetch(
          // "https://makemydocuments.nakshatranamahacreations.in/lead-in-process.php", 
          `${process.env.REACT_APP_API_URL}/api/get-inprogress-leads?assign=${adminData.name}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Check if the response is successful
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response JSON
        const data = await response.json();

        // Reverse the order of the leads if necessary
        const reversedLeads = data.data.reverse();
        setLeads(reversedLeads); // Update the state with the reversed data

      } catch (error) {
        console.error("Error fetching in-process leads:", error);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchLeads();
  }, [adminData.name]);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    slNo: null,
    date: null,
    name: null,
    district: null,
    service: null,
    paymentStatus: null,
  });


  const handleFilterClick = (column) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      switch (column) {
        case "date":
          newFilters.date =
            newFilters.date === "today"
              ? "yesterday"
              : newFilters.date === "yesterday"
                ? null
                : "today";
          break;
        case "name":
        case "district":
        case "service":
        case "mobileNumber":
          newFilters[column] = newFilters[column] === "asc" ? "desc" : "asc";
          break;
        default:
          break;
      }

      return newFilters;
    });
  };

  const applyFilters = (leads) => {
    let filteredLeads = [...leads];

    // Apply date filter (today or yesterday)
    if (filters.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      filteredLeads = filteredLeads.filter((lead) => {
        const leadDate = new Date(lead.date);
        leadDate.setHours(0, 0, 0, 0);

        if (filters.date === "today") return leadDate.getTime() === today.getTime();
        if (filters.date === "yesterday") return leadDate.getTime() === yesterday.getTime();

        return true;
      });
    }

    // Sorting function
    const sortLeads = (key, order) => {
      if (!order) return;

      filteredLeads.sort((a, b) => {
        let valueA = a[key] ? a[key].toString().toLowerCase() : "";
        let valueB = b[key] ? b[key].toString().toLowerCase() : "";

        if (key === "mobileNumber") {
          valueA = parseInt(a.mobilenumber.replace(/\D/g, ""), 10) || 0;
          valueB = parseInt(b.mobilenumber.replace(/\D/g, ""), 10) || 0;
        }

        if (valueA < valueB) return order === "asc" ? -1 : 1;
        if (valueA > valueB) return order === "asc" ? 1 : -1;
        return 0;
      });
    };

    // Apply sorting filters
    sortLeads("name", filters.name);
    sortLeads("district", filters.district);
    sortLeads("service", filters.service);
    sortLeads("mobileNumber", filters.mobileNumber);

    return filteredLeads;
  };

  // **✅ First apply filters**
  const filteredLeads = applyFilters(leads).filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.mobilenumber?.toLowerCase().includes(query) ||
      lead.service?.toLowerCase().includes(query) ||
      lead.district?.toLowerCase().includes(query)
    );
  });

  // **✅ Now apply pagination**
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);




  // Calculate the indices for the current page
  const handleAssignChange = (index, value) => {
    const updatedLeads = [...leads];
    updatedLeads[index].assign = value;
    setLeads(updatedLeads);
    sessionStorage.setItem("leads", JSON.stringify(updatedLeads));
    console.log(updatedLeads);

    const leadId = updatedLeads[index]?._id;

    // if (!leadId) {
    //   console.error("Invalid data: leadId or value is missing");
    //   return;
    // }

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/api/lead/updateAssign`,
        {
          id: leadId,
          assign: value,
        }
      )
      .then((response) => {
        const data = response.data;
        if (data.status === "success") {
          console.log("Assignment updated successfully");
        } else {
          console.error("Failed to update assignment:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error during the API call:", error.message);
      });
  };

  const handleRowClick = (lead) => {
    setSelectedLead({
      ...lead,
    });
  };

  const closeLeadDetails = () => {
    setSelectedLead(null);
  };

  const handleAddComment = () => {
    setShowCommentInput(true);
  };

  const handleDelete = () => {
    if (selectedLead && selectedLead._id) {
      if (window.confirm("Are you sure you want to delete this lead?")) {

        // `https://makemydocuments.nakshatranamahacreations.in/delete-lead.php?id=${selectedLead.id}`
        axios
          .delete(`${process.env.REACT_APP_API_URL}/api/lead/deleteLead/${selectedLead._id}`)
          .then((response) => {
            if (response.data.status === "success") {
              alert("Lead deleted successfully!");
              window.location.reload(); // Reload the page after success
            } else {
              alert(`Error: ${response.data.message}`);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("There was an error with the deletion.");
          });
      }
    } else {
      alert("Admin data or lead ID is missing.");
    }
  };


  const updateStatus = async (id, status, assignedUser) => {
    if (!id) {
      alert("Invalid lead ID.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/updateStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            id: id, // Pass the lead ID
            status: status, // Pass the selected status

          }),
        }
      );

      if (response.ok) {
        console.log("response", response);

        // window.location.reload();
        alert(
          `Status updated to ${status} and assigned to ${assignedUser} successfully!`
        );
      } else {
        console.error("Failed to update status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value); // Update the comment as the user types
  };
  useEffect(() => {
    // Check if a comment has been fetched already and if selectedLead exists
    if (selectedLead?.id && !submittedComment?.comment) {
      fetchCommentData(selectedLead.id);
    }
  }, [selectedLead?.id, submittedComment?.comment]);

  const fetchCommentData = async (leadId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/getComment?document_id=${leadId}`,

      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Check the response format
      if (data.status === "success" && Array.isArray(data.data)) {
        setSelectedLead((prev) => ({
          ...prev,
          comments: data.data, // Use the correct key: data.data
        }));
      } else {
        console.error("Invalid comments format. Using fallback:", data);
        setSelectedLead((prev) => ({
          ...prev,
          comments: [], // Fallback to an empty array
        }));
      }
    } catch (error) {
      console.error("Error fetching comment data:", error);
    }
  };

  const handleCommentSubmit = async () => {
    console.log("Selected Lead:", selectedLead);

    try {
      if (!selectedLead?._id || !comment.trim()) {
        console.error("Both Lead ID and Comment are required.");
        return;
      }

      const data = {
        id: selectedLead._id,
        comment: comment,
        assign: adminData?.name || "Unassigned",
      };


      setSelectedLead((prev) => ({
        ...prev,
        comments: [
          ...(prev?.comments || []),
          {
            comment: comment,
            date: new Date().toISOString(),
            assign: adminData?.name || "Unassigned",
            _id: Math.random().toString(36).substr(2, 9),
          },
        ],
      }));


      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/addComment`,
        data
      );

      if (response.data.status === "error") {
        console.error("Error from server:", response.data.message);
        return;
      }

      console.log("Comment submitted successfully:", response.data);


      await fetchCommentData(selectedLead._id);

      setComment("");
      setShowCommentInput(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Check if it's a valid date
    if (isNaN(date)) return ""; // Return empty if the date is invalid
    return date.toLocaleDateString("en-GB").split("/").join("-"); // Format as dd-mm-yyyy
  };



  const [selectedDate, setSelectedDate] = useState(""); // Store selected date
  const [selectedTime, setSelectedTime] = useState(""); // Store selected time

  // Function to handle Follow Up button click
  const handleFollowUp = (lead) => {
    setSelectedLead(lead); // Set the selected lead
    setShowPopup(true); // Show the popup for date and time selection
  };

  // Handle date change in popup
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value); // Update the selected date
  };


  const filteredByAppliedFilters = applyFilters(currentLeads);


  const handleDateSubmit = async () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }
  
    if (!selectedLead?._id) {
      alert("Please select a valid lead.");
      return;
    }
  
    const followUpTime = selectedDate;
    const assign = assignValues[selectedLead.index] || "Unassigned";
  
    const requestBody = {
      status: "followup",
      followupDate: new Date(followUpTime).toISOString(), 
      assign: assign,
      id: selectedLead._id, 
    };
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lead/follow-up`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        console.log("Follow-up time saved successfully!", response.data);
        alert("Follow-up time and status updated successfully!");
        setShowPopup(false); 
        window.location.reload();
      } else {
        console.error("API Error:", response.data);
        alert("Failed to save follow-up time and status.");
      }
    } catch (error) {
      console.error("Error saving follow-up time:", error);
      alert("An error occurred while saving the follow-up time.");
    }
  };
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/user/getActiveUser`)
      .then((response) => response.json())
      .then((data) => {
    
        if (data && data.user && Array.isArray(data.user)) {
          setUsers(data.user); 
        } else {
          console.error("Invalid API response format");
        }
      })
      .catch((error) => {
        console.error("Error fetching users data:", error);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>In Process - Make my Documents</title>


        <meta name="author" content="https://leads.makemydocuments.in/in-process" />


      </Helmet>
      <div
        className="new-leads-container d-none d-lg-block"
        style={{ width: "470%", marginLeft: "235px", marginTop: "106px", fontFamily: "Poppins, sans-serif", }}
      >
        {!selectedLead ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "250px",
                }}
              />
            </div>
            <table className="leads-table" style={{ width: "100%", fontSize: "14px", }}>
              <thead>
                <tr style={{ fontSize: "14px" }}>
                  <th >Sl.No</th>
                  <th style={styles.tableHeader}>Date <FaFilter style={styles.icon} onClick={() => handleFilterClick('date')} /></th>
                  <th style={styles.tableHeader}>Name <FaFilter style={styles.icon} onClick={() => handleFilterClick('name')} /></th>
                  <th style={styles.tableHeader}>Mobile Number <FaFilter style={styles.icon} onClick={() => handleFilterClick('mobileNumber')} /></th>
                  <th style={styles.tableHeader}>Service <FaFilter style={styles.icon} onClick={() => handleFilterClick('service')} /></th>
                  <th style={styles.tableHeader}>District <FaFilter style={styles.icon} onClick={() => handleFilterClick('district')} /></th>

                  <th style={styles.tableHeader}>Paid Amount <FaFilter style={styles.icon} /></th>
                  <th style={styles.tableHeader}>Status <FaFilter style={styles.icon} /></th>
                  {adminData?.role === "admin" && (
                    <th style={styles.tableHeader}>Assign</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr
                    key={index}
                    // onClick={() => handleRowClick(lead)}
                    style={styles.tableRow}
                  >
                    <td
                      style={styles.tableCell}
                      onClick={() => handleRowClick(lead)}
                    >
                      {index + 1 + (currentPage - 1) * leadsPerPage}
                    </td>
                    <td
                      style={{ ...styles.tableCell, whiteSpace: 'nowrap' }}
                      onClick={() => handleRowClick(lead)}
                    >
                      {lead.date}
                    </td>
                    <td
                      style={styles.tableCell}
                      onClick={() => handleRowClick(lead)}
                    >
                      {lead.name}
                    </td>
                    <td
                      style={styles.tableCell}
                      onClick={() => handleRowClick(lead)}
                    >
                      {lead.mobilenumber}
                    </td>
                    <td
                      style={styles.tableCell}
                      onClick={() => handleRowClick(lead)}
                    >
                      {lead.service}
                    </td>
                    <td
                      style={styles.tableCell}
                      onClick={() => handleRowClick(lead)}
                    >
                      {lead.district}
                    </td>

                    <td
                      style={styles.tableCell}
                      onClick={() => handleRowClick(lead)}
                    >
                      {lead.paidAmount || "0.00"}
                    </td>
                    <td
                      style={styles.tableCell}
                      onClick={() => handleRowClick(lead)} // Ensure the row click works regardless
                    >
                      <button
                        style={{
                          ...styles.statusButton,
                          backgroundColor: lead.paymentStatus.trim().toLowerCase() === "paid" ? "#4CAF50" : "#ff9800",
                        }}
                        disabled={lead.paymentStatus.trim().toLowerCase() === "paid"}
                      >
                        {lead.paymentStatus ? lead.paymentStatus : "unpaid"}
                      </button>

                    </td>

                    <td>
                      {adminData?.role === "admin" ? (
                        <select
                          value={lead.assign || "Select lead user"}
                          onChange={(e) => handleAssignChange(indexOfFirstLead + index, e.target.value)}
                          style={styles.select}
                        >
                          <option value="Select lead user">Select lead user</option>
                          {users.map((user, userIndex) => (
                            <option key={userIndex} value={user.name}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div
              className="pagination"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ marginRight: "10px" }}
              >
                Prev
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage * leadsPerPage >= leads.length}
                style={{ marginLeft: "10px" }}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.details}>
            <h2 style={styles.title}>Lead Details</h2>
            <div style={styles.row}>
              <div style={styles.col}>
                <strong>Date:</strong>
                <input
                  type="text"
                  value={selectedLead?.date}
                  style={styles.input}
                />
              </div>
              <div style={styles.col}>
                <strong>Time:</strong>
                <input
                  type="text"
                  value={selectedLead?.time}
                  style={styles.input}
                />
              </div>
              <div style={styles.col}>
                <strong>Order Id:</strong>
                <input
                  type="text"
                  value={selectedLead?.orderId}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <strong>Name:</strong>
                <input
                  type="text"
                  value={selectedLead.name}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
              <div style={styles.col}>
                <strong>Service:</strong>
                <input
                  type="text"
                  value={selectedLead.service}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
              {selectedLead?.source && (
                <div style={styles.col}>
                  <strong>Source:</strong>
                  <input
                    type="text"
                    value={selectedLead.source}
                    style={{ ...styles.input, textTransform: "uppercase" }}
                  />
                </div>
              )}

              {(selectedLead?.service !== "MSME" &&
                selectedLead?.service !== "SeniorCitizen" &&
                selectedLead?.service !== "Food License(FSSAI)" &&
                selectedLead?.applying_for) && (
                  <div style={styles.col}>
                    <strong>Applying For:</strong>
                    <input
                      type="text"
                      value={selectedLead.applying_for.toUpperCase()}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                )}

            </div>
            <div style={styles.row}>
              <div style={styles.col}>
                <strong>Amount:</strong>
                <input
                  type="text"
                  value={selectedLead.paidAmount || "N/A"}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
              <div style={styles.col}>
                <strong>Status:</strong>
                <input
                  type="text"
                  value={selectedLead.paymentStatus || "N/A"}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>

              <div style={styles.col}>
                <strong>Assigned User:</strong>
                <input
                  type="text"
                  value={selectedLead.assign || "Not Assigned"}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>

            </div>


            <div style={styles.row}>
              <div style={styles.col}>
                <strong>Address:</strong>
                <input
                  type="text"
                  value={selectedLead.address}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
              <div style={styles.col}>
                <strong>State:</strong>
                <input
                  type="text"
                  value={selectedLead?.state}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
              <div style={styles.col}>
                <strong>District</strong>
                <input
                  type="text"
                  value={selectedLead?.district}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.col}>
                <strong>Pin Code:</strong>
                <input
                  type="text"
                  value={selectedLead?.pincode}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
              <div style={styles.col}>
                <strong>Email ID:</strong>
                <input
                  type="text"
                  value={selectedLead?.email}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
              <div style={styles.col}>
                <strong>Mobile Number:</strong>
                <input
                  type="text"
                  value={selectedLead?.mobilenumber}
                  style={{ ...styles.input, textTransform: "uppercase" }}
                />
              </div>
            </div>

            {/* Render detailed info for "Pancard" */}
            {selectedLead?.service === "Pancard" && (
              <>
                <div style={styles.row}>
                  {selectedLead?.applying_for !== "newPanCard" && (
                    <div style={styles.col}>
                      <strong>Existing Pan Card Number:</strong>
                      <input
                        type="text"
                        value={selectedLead?.existingpancardnumber}
                        style={{ ...styles.input, textTransform: "uppercase" }}
                      />
                    </div>
                  )}
                  <div style={styles.col}>
                    <strong>Aadhar Number:</strong>
                    <input
                      type="text"
                      value={selectedLead?.adharnumber}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>

                  <div style={styles.col}>
                    <strong>Date of Birth:</strong>
                    <input
                      type="text"

                      value={selectedLead?.dob}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Father Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.fathername}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>

                  <div style={styles.col}>
                    <strong>Mother Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.mothername}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Print on PAN Card:</strong>
                    <input
                      type="text"
                      value={selectedLead?.printOnPanCard}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}

            {selectedLead?.service === "TwoWheeler Insurance" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Registration Date:</strong>
                    <input
                      type="text"
                      value={selectedLead?.registrationDate}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>

                  <div style={styles.col}>
                    <strong>Registration Number:</strong>
                    <input
                      type="text"
                      value={selectedLead?.registrationNumber}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Four Wheeler Insurance" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Registration Date:</strong>
                    <input
                      type="text"
                      value={selectedLead?.registrationDate}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>

                  <div style={styles.col}>
                    <strong>Registration Number:</strong>
                    <input
                      type="text"
                      value={selectedLead?.registrationNumber}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Commercial Vehicle" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Registration Date:</strong>
                    <input
                      type="text"
                      value={selectedLead?.registrationDate}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>

                  <div style={styles.col}>
                    <strong>Registration Number:</strong>
                    <input
                      type="text"
                      value={selectedLead?.registrationNumber}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Health Insurance" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>

                  <div style={styles.col}>
                    <strong>Age:</strong>
                    <input
                      type="text"
                      value={selectedLead?.age}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Disease:</strong>
                    <input
                      type="text"
                      value={selectedLead?.disease}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Life Insurance" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Dateof Birth:</strong>
                    <input
                      type="text"
                      value={selectedLead?.dob}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Travel Visa" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Travelling Date:</strong>
                    <input
                      type="text"
                      value={selectedLead?.travellingDate}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Returning Date:</strong>
                    <input
                      type="text"
                      value={selectedLead?.returningDate}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Rental Agreement" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>I am:</strong>
                    <input
                      type="text"
                      value={selectedLead?.identityOption}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Required Stamp Paper:</strong>
                    <input
                      type="text"
                      value={selectedLead?.stampPaper}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Owner Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownername}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Owner Address:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownerAddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Owner District:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownerDistrict}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Owner Pincode:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownerPincode}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Tenant Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantName}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Tenant Addess:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantaddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Tenant District:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantDistrict}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Tenant Pincode:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantPincode}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Shifting Date:</strong>
                    <input
                      type="text"
                      value={selectedLead?.shiftingdate}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Shifting Address:</strong>
                    <input
                      type="text"
                      value={selectedLead?.shiftingaddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Monthly Rent:</strong>
                    <input
                      type="text"
                      value={selectedLead?.monthlyrent}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Water Charges:</strong>
                    <input
                      type="text"
                      value={selectedLead?.waterCharges}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Painting Charges:</strong>
                    <input
                      type="text"
                      value={selectedLead?.paintingCharges}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Accommodation:</strong>
                    <input
                      type="text"
                      value={selectedLead?.accommodation}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Appliances/Fittings Details:</strong>
                    <input
                      type="text"
                      value={selectedLead?.appliancesFittings}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Shipping Address:</strong>
                    <input
                      type="text"
                      value={selectedLead?.shippingaddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Lease Agreement" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>I am:</strong>
                    <input
                      type="text"
                      value={selectedLead?.identityOption}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Required Stamp Paper:</strong>
                    <input
                      type="text"
                      value={selectedLead?.stampPaper}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Owner Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownername}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Owner Address:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownerAddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Owner District:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownerDistrict}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Owner Pincode:</strong>
                    <input
                      type="text"
                      value={selectedLead?.ownerPincode}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Tenant Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantName}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Tenant Addess:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantaddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Tenant District:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantDistrict}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Tenant Pincode:</strong>
                    <input
                      type="text"
                      value={selectedLead?.tenantPincode}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Shifting Date:</strong>
                    <input
                      type="text"
                      value={selectedLead?.shiftingdate}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Shifting Address:</strong>
                    <input
                      type="text"
                      value={selectedLead?.shiftingaddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Monthly Rent:</strong>
                    <input
                      type="text"
                      value={selectedLead?.monthlyrent}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Water Charges:</strong>
                    <input
                      type="text"
                      value={selectedLead?.waterCharges}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Painting Charges:</strong>
                    <input
                      type="text"
                      value={selectedLead?.paintingCharges}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Accommodation:</strong>
                    <input
                      type="text"
                      value={selectedLead?.accommodation}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Appliances/Fittings Details:</strong>
                    <input
                      type="text"
                      value={selectedLead?.appliancesFittings}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Shipping Address:</strong>
                    <input
                      type="text"
                      value={selectedLead?.shippingaddress}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "PassPort" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong> Type of Application:</strong>
                    <input
                      type="text"
                      value={selectedLead?.applicationType}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Type of Passport Booklet:</strong>
                    <input
                      type="text"
                      value={selectedLead?.passportBookletType}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Date of Birth:</strong>
                    <input
                      type="text"
                      value={selectedLead?.dob}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Qualification:</strong>
                    <input
                      type="text"
                      value={selectedLead?.qualification}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Employment Type:</strong>
                    <input
                      type="text"
                      value={selectedLead?.employmentType}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Marital Status:</strong>
                    <input
                      type="text"
                      value={selectedLead?.maritalStatus}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Father Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.fathername}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Mother Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.mothername}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Spouse's Given Name:</strong>
                    <input
                      type="text"
                      value={selectedLead?.spouseName}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Police Verification Certificate" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong> Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Date of Birth:</strong>
                    <input
                      type="text"
                      value={selectedLead?.dob}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Employment Type:</strong>
                    <input
                      type="text"
                      value={selectedLead?.employmentType}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Education Qualification:</strong>
                    <input
                      type="text"
                      value={selectedLead?.qualification}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Date of Birth:</strong>
                    <input
                      type="text"
                      value={selectedLead?.dob}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "MSME" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Aadhaar Number:</strong>
                    <input
                      type="text"
                      value={selectedLead?.adharnumber}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Name of Enterprise/Business:</strong>
                    <input
                      type="text"
                      value={selectedLead?.businessName}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Type of Organisation:</strong>
                    <input
                      type="text"
                      value={selectedLead?.organisationType}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Date of Incorporation / Registration:</strong>
                    <input
                      type="text"
                      value={selectedLead?.dateOfIncorporation}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Business PAN Number</strong>
                    <input
                      type="text"
                      value={selectedLead?.panNumber}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "SeniorCitizen" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong> Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Date of Birth:</strong>
                    <input
                      type="text"
                      value={selectedLead?.dob}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Blood Group:</strong>
                    <input
                      type="text"
                      value={selectedLead?.bloodgroup}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedLead?.service === "Police Clearance Certificate" && (
              <>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong> Gender:</strong>
                    <input
                      type="text"
                      value={selectedLead?.gender}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Date of Birth:</strong>
                    <input
                      type="text"
                      value={selectedLead?.dob}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                  <div style={styles.col}>
                    <strong>Employment Type:</strong>
                    <input
                      type="text"
                      value={selectedLead?.employmentType}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.col}>
                    <strong>Education Qualification:</strong>
                    <input
                      type="text"
                      value={selectedLead?.qualification}
                      style={{ ...styles.input, textTransform: "uppercase" }}
                    />
                  </div>

                </div>
              </>
            )}

            {/* Action Buttons */}
            <div style={styles.actions}>
              {!showCommentInput && !showPopup && (
                <>
                  <button style={styles.comment} onClick={handleShow}>
                    Add Comment
                  </button>
                  <button
                    onClick={() => setShowPopup(true)}
                    style={styles.followUp}
                  >
                    Follow Up
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Do you want to send the 'Converted' status?"
                        )
                      ) {
                        updateStatus(selectedLead._id, "converted");

                      }
                    }}
                    style={styles.converted}
                  >
                    Converted
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm("Do you want to send the 'Dead' status?")
                      ) {
                        updateStatus(selectedLead._id, "dead");

                      }
                    }}
                    style={styles.dead}
                  >
                    Dead
                  </button>



                  <a href={`tel:${selectedLead?.mobilenumber}`} style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.5rem",
                      }}
                    >
                      📞
                    </button>
                  </a>

                  {adminData?.role === "admin" && ( // Check if the role is admin
                    <button
                      onClick={handleDelete}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "red",
                        fontSize: "1.5rem",
                      }}
                    >
                      <FaTrash />
                    </button>

                  )}
                </>
              )}

              <Modal show={show} onHide={handleClose} className="d-none d-lg-block">
                <Modal.Header closeButton>
                  <Modal.Title>Comment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)} // Ensure this updates the state
                    placeholder="Add your comment here"
                    style={styles.commentInput}
                  ></textarea>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowCommentInput(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleCommentSubmit();
                      handleClose();
                    }}
                  >
                    Submit
                  </Button>
                </Modal.Footer>
              </Modal>


              {showPopup && (
                <Modal show={showPopup} onHide={() => setShowPopup(false)} className="d-none d-lg-block">
                  <Modal.Header closeButton>
                    <Modal.Title>Select Follow-up Date</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      style={styles.dateInput}
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setShowPopup(false)}
                    >
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleDateSubmit}>
                      Submit
                    </Button>
                  </Modal.Footer>
                </Modal>
              )}
            </div>
            <br />
            {/* Display Submitted Comment */}
            {selectedLead?.comments && selectedLead.comments.length > 0 ? (
              <table style={styles.commentTable}>
                <thead>
                  <tr>
                    <th style={styles.commentTableTh}>Comment</th>
                    <th style={styles.commentTableTh}>Date</th>
                    <th style={styles.commentTableTh}>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLead.comments.map((comment, index) => (
                    <tr key={index}>
                      <td style={styles.commentTableTd}>{comment.comment || "N/A"}</td>
                      <td style={styles.commentTableTd}>
                        {comment.created_date ? comment.created_date : "N/A"}
                      </td>
                      <td style={styles.commentTableTd}>{comment.assign || "Unassigned"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}



            {/* Close Button */}
            {/* <div style={styles.buttons}>
                                     <button onClick={closeLeadDetails} style={styles.closeBtn}>
                                       Close
                                     </button>
                                   </div> */}
          </div>
        )}
      </div>
      <div
        className="mobile-leads-container d-block d-lg-none"
        style={{
          width: "100%",
          margin: "10px",
          fontFamily: "Poppins, sans-serif",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Search Box */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
            width: "100%",
          }}
        >

          <h2 style={{ fontSize: "20px", marginLeft: "1%" }}>{selectedItem}</h2 >
        </div>

        {/* Table or Details View */}
        {!selectedLead ? (
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "650px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "10px",
              // backgroundColor: "#fff",
            }}
          >
            <table
              className="mobile-leads-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid black" }}>
                  <th style={{ padding: "10px", textAlign: "left", borderRight: "1px solid #ddd" }}>Sl.No</th>
                  <th style={{ padding: "10px", textAlign: "left", borderRight: "1px solid #ddd" }}>Date  <FaFilter style={styles.icon} onClick={() => handleFilterClick('date')} /></th>
                  <th style={{ padding: "10px", textAlign: "left", borderRight: "1px solid #ddd" }}>Name <FaFilter style={styles.icon} onClick={() => handleFilterClick('name')} /></th>
                  <th style={{ padding: "10px", textAlign: "left", borderRight: "1px solid #ddd" }}>Service <FaFilter style={styles.icon} onClick={() => handleFilterClick('service')} /></th>
                  <th style={{ padding: "10px", textAlign: "left", borderRight: "1px solid #ddd" }}>Status <FaFilter style={styles.icon} onClick={() => handleFilterClick('status')} /></th>
                  <th style={{ padding: "10px", textAlign: "left", borderRight: "1px solid #ddd" }}>Assign</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #ddd" }} >
                    <td style={{ padding: "10px", borderRight: "1px solid #ddd" }} onClick={() => setSelectedLead(lead)}>  {index + 1 + (currentPage - 1) * leadsPerPage}</td>
                    <td style={{ padding: "10px", whiteSpace: "nowrap", borderRight: "1px solid #ddd" }} onClick={() => setSelectedLead(lead)}>{lead.date}</td>
                    <td style={{ padding: "10px", borderRight: "1px solid #ddd" }} onClick={() => setSelectedLead(lead)}>{lead.name}</td>
                    <td style={{ padding: "10px", borderRight: "1px solid #ddd" }} onClick={() => setSelectedLead(lead)}>{lead.service}</td>
                    <td style={{ padding: "10px", borderRight: "1px solid #ddd" }} onClick={() => setSelectedLead(lead)}>
                      <button
                        style={{
                          padding: "1px 6px",
                          border: "none",
                          borderRadius: "5px",
                          backgroundColor:
                            lead.paymentStatus.trim().toLowerCase() === "paid"
                              ? "#4CAF50"
                              : "#ff9800",
                          color: "white",
                        }}
                        disabled={lead.paymentStatus.trim().toLowerCase() === "paid"}
                      >
                        {lead.paymentStatus ? lead.paymentStatus : "unpaid"}
                      </button>
                    </td>
                    <td style={{ padding: "10px" }}>
                      {adminData?.role === "admin" ? (
                        <select
                          value={lead.assign}
                          onChange={(e) => handleAssignChange(index, e.target.value)}
                          style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ccc", width: "200%" }}
                        >
                          <option value="Select lead user">Select lead User</option>
                          {users.map((user, userIndex) => (
                            <option key={userIndex} value={user.name}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        lead.assign || "Not Assigned"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="pagination"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ marginRight: "10px" }}
              >
                Prev
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage * leadsPerPage >= leads.length}
                style={{ marginLeft: "10px" }}
              >
                Next
              </button>
            </div>
          </div>
        ) : (

          <div
            style={{
              padding: "20px",
              maxWidth: "1200px",
              margin: "auto",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              height: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Sticky Header */}
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "15px",
                textAlign: "center",
                // position: "sticky",
                top: "0",
                backgroundColor: "#fff",
                padding: "10px",
                zIndex: "1000",
              }}
            >
              Lead Details
            </h2>

            {/* Date & Time Row */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
              {["Date", "Time"].map((label, index) => (
                <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                  <strong>{label}:</strong>
                  <input
                    type="text"
                    value={selectedLead?.[label.toLowerCase()]}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "16px",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* General Info */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
            {[
    { label: "Order Id", key: "orderId" },
    { label: "Name", key: "name" },
    { label: "Service", key: "service" }
  ].map(({ label, key }, index) => (
    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
      <strong>{label}:</strong>
      <input
        type="text"
        value={selectedLead?.[key] || ""}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
          textTransform: "uppercase",
        }}
      />
    </div>
  ))}
              <div style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                <strong>Assigned User:</strong>
                <input
                  type="text"
                  value={selectedLead?.assign || "Not Assigned"}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    textTransform: "uppercase",
                  }}
                />
              </div>


              {/* Conditionally render Source field only if it exists */}
              {selectedLead?.source && (
                <div style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                  <strong>Source:</strong>
                  <input
                    type="text"
                    value={selectedLead.source}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "16px",
                      textTransform: "uppercase",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Address & Contact Info */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
              {["Address", "State", "District", "Pin Code", "Email", "Mobile Number"].map((label, index) => (
                <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                  <strong>{label}:</strong>
                  <input
                    type="text"
                    value={selectedLead?.[label.toLowerCase().replace(" ", "")]}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "16px",
                      textTransform: "uppercase",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Conditional Fields Based on Service Type */}
            {selectedLead?.service === "Pancard" && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {/* Conditionally Show Existing PAN Card Number */}
                  {selectedLead?.applying_for !== "newPanCard" && (
                    <div style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>Existing Pan Card Number:</strong>
                      <input
                        type="text"
                        value={selectedLead?.existingpancardnumber || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  )}

                  {[
                    { key: "adharnumber", label: "Aadhar Number" },
                    { key: "dob", label: "Date of Birth" },
                    { key: "fathername", label: "Father Name" },
                    { key: "mothername", label: "Mother Name" },
                    { key: "printOnPanCard", label: "Print on PAN Card" },
                    { key: "gender", label: "Gender" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}



            {/* Two-Wheeler, Four-Wheeler & Commercial Vehicle Insurance */}
            {["TwoWheeler Insurance", "Four Wheeler Insurance", "Commercial Vehicle"].includes(selectedLead?.service) && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "registrationDate", label: "Registration Date" },
                    { key: "registrationNumber", label: "Registration Number" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Health Insurance */}
            {selectedLead?.service === "Health Insurance" && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "gender", label: "Gender" },
                    { key: "age", label: "Age" },
                    { key: "disease", label: "Pre-Existing Disease" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Life Insurance */}
            {selectedLead?.service === "Life Insurance" && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "gender", label: "Gender" },
                    { key: "dob", label: "Date of Birth" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}


            {selectedLead?.service === "Travel Visa" && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "gender", label: "Gender" },
                    { key: "travellingDate", label: "Travelling Date" },
                    { key: "returningDate", label: "Returning Date" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedLead?.service === "PassPort" && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "applicationType", label: "Type of Application" },
                    { key: "passportBookletType", label: "Type of Passport Booklet" },
                    { key: "gender", label: "Gender" },
                    { key: "dob", label: "Date of Birth" },
                    { key: "qualification", label: "Qualification" },
                    { key: "employmentType", label: "Employment Type" },
                    { key: "maritalStatus", label: "Marital Status" },
                    { key: "fathername", label: "Father Name" },
                    { key: "mothername", label: "Mother Name" },
                    { key: "spouseName", label: "Spouse's Given Name" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {["Rental Agreement", "Lease Agreement"].includes(selectedLead?.service) && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "identityOption", label: "I am" },
                    { key: "stampPaper", label: "Required Stamp Paper" },
                    { key: "ownername", label: "Owner Name" },
                    { key: "ownerAddress", label: "Owner Address" },
                    { key: "ownerDistrict", label: "Owner District" },
                    { key: "ownerPincode", label: "Owner Pincode" },
                    { key: "tenantName", label: "Tenant Name" },
                    { key: "tenantaddress", label: "Tenant Address" },
                    { key: "tenantDistrict", label: "Tenant District" },
                    { key: "tenantPincode", label: "Tenant Pincode" },
                    { key: "shiftingdate", label: "Shifting Date" },
                    { key: "shiftingaddress", label: "Shifting Address" },
                    { key: "monthlyrent", label: "Monthly Rent" },
                    { key: "waterCharges", label: "Water Charges" },
                    { key: "paintingCharges", label: "Painting Charges" },
                    { key: "accommodation", label: "Accommodation" },
                    { key: "appliancesFittings", label: "Appliances/Fittings Details" },
                    { key: "shippingaddress", label: "Shipping Address" },
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedLead?.service === "Police Verification Certificate" && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "gender", label: "Gender" },
                    { key: "dob", label: "Date of Birth" },
                    { key: "employmentType", label: "Employment Type" },
                    { key: "qualification", label: "Education Qualification" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedLead?.service === "MSME" && (
              <>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "adharnumber", label: "Aadhaar Number" },
                    { key: "businessName", label: "Name of Enterprise/Business" },
                    { key: "organisationType", label: "Type of Organisation" },
                    { key: "dateOfIncorporation", label: "Date of Incorporation / Registration" },
                    { key: "panNumber", label: "Business PAN Number" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedLead?.service === "SeniorCitizen" && (
              <>


                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "gender", label: "Gender" },
                    { key: "dob", label: "Date of Birth" },
                    { key: "bloodgroup", label: "Blood Group" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedLead?.service === "Police Clearance Certificate" && (
              <>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "10px" }}>
                  {[
                    { key: "gender", label: "Gender" },
                    { key: "dob", label: "Date of Birth" },
                    { key: "employmentType", label: "Employment Type" },
                    { key: "qualification", label: "Education Qualification" }
                  ].map((field, index) => (
                    <div key={index} style={{ flex: "1", minWidth: "48%", margin: "5px" }}>
                      <strong>{field.label}:</strong>
                      <input
                        type="text"
                        value={selectedLead?.[field.key] || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          textTransform: "uppercase",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}


            {/* Sticky Footer with Buttons in a Single Line */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                // position: "sticky",
                bottom: "0",
                backgroundColor: "#fff",
                padding: "10px",
                zIndex: "1000",
                boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              {[
                { label: "Add Comment", color: "#007BFF", action: handleShow },
                { label: "Follow Up", color: "#28A745", action: () => setShowPopup(true) },
                // { label: "In Process", color: "#FFC107", action: () => updateStatus(selectedLead.id, "In Process") },
                { label: "Converted", color: "#17A2B8", action: () => updateStatus(selectedLead._id, "Converted") },
                { label: "Dead", color: "#DC3545", action: () => updateStatus(selectedLead._id, "Dead") },
              ].map((button, index) => (
                <button
                  key={index}
                  onClick={button.action}
                  style={{
                    flex: "1",
                    minWidth: "120px",
                    padding: "12px 15px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: button.color,
                    color: "white",
                    transition: "background 0.3s ease",
                  }}
                >
                  {button.label}
                </button>
              ))}

              <a href={`tel:${selectedLead?.mobilenumber}`} style={{ textDecoration: "none" }}>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                >
                  📞
                </button>
              </a>

              {/* Delete Button for Admin */}
              {adminData?.role === "admin" && (
                <button
                  onClick={handleDelete}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "red",
                    fontSize: "1.5rem",
                  }}
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Follow-up Modal */}
            {showPopup && (
              <Modal show={showPopup} onHide={() => setShowPopup(false)} className="d-block d-lg-none" style={{ marginTop: '50%' }}>
                <Modal.Header closeButton>
                  <Modal.Title>Select Follow-up Date</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    style={styles.dateInput}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowPopup(false)}
                  >
                    Close
                  </Button>
                  <Button variant="primary" onClick={handleDateSubmit}>
                    Submit
                  </Button>
                </Modal.Footer>
              </Modal>
            )}

            {/* Comment Modal */}
            <Modal show={show} onHide={handleClose} style={{ marginTop: '50%' }} className="d-block d-lg-none">
              <Modal.Header closeButton>
                <Modal.Title>Comment</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comment here"
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                  }}
                ></textarea>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowCommentInput(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleCommentSubmit();
                    handleClose();
                  }}
                >
                  Submit
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Display Submitted Comments */}
            {selectedLead?.comments && selectedLead.comments.length > 0 && (
              <table
                style={{
                  width: "100%",
                  marginTop: "15px",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f4f4f4", borderBottom: "2px solid black" }}>
                    <th style={{ padding: "10px", borderRight: "1px solid #ddd" }}>Comment</th>
                    <th style={{ padding: "10px", borderRight: "1px solid #ddd" }}>Date</th>
                    <th style={{ padding: "10px", borderRight: "1px solid #ddd" }}>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLead.comments.map((comment, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "10px", borderRight: "1px solid #ddd" }}>{comment.comment || "N/A"}</td>
                      <td style={{ padding: "10px", borderRight: "1px solid #ddd" }}>
                        {comment.created_date ? comment.created_date : "N/A"}
                      </td>
                      <td style={{ padding: "10px", borderRight: "1px solid #ddd" }}>{comment.assign || "Unassigned"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>

        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    margin: "20px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    fontFamily: "Poppins, sans-serif",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },

  commentTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  commentTableTh: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  commentTableTd: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  details: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    marginBottom: "20px",
    color: "#333",
    fontSize: "24px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  col: {
    flex: "1",
    padding: "5px",
  },
  actions: {
    marginTop: "20px",
    marginBottom: "20px",
    display: "flex",
    gap: "10px", // Added gap between the action buttons
  },
  dead: {
    backgroundColor: "#e74c3c",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  converted: {
    backgroundColor: "#2ecc71",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  inProcess: {
    backgroundColor: "#f39c12",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  followUp: {
    backgroundColor: "#3498db",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  closeBtn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "red",
    color: "white",
  },
  backBtn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "blue",
    color: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  tableHeaderRow: {
    backgroundColor: "#333",
    color: "white",
    textAlign: "left",
    fontSize: "16px",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
  },
  tableHeader: {
    padding: "10px",
    fontWeight: 'bold',
    textAlign: 'center',
  },
  icon: {
    marginLeft: '5px',
    cursor: 'pointer',
  },
  buttonStyle: {
    padding: "10px 20px",
    backgroundColor: "Gray", // Replace with the desired background color
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flexGrow: 1,
    textAlign: "center",
  },
  tableRow: {
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  tableCell: {
    padding: "12px 16px",
    borderBottom: "1px solid #ddd",
    fontSize: "14px",
    color: "#333",
  },
  statusButton: {
    padding: "2px 10px",
    borderRadius: "5px",
    border: "none",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    textTransform: "uppercase",
  },
  select: {
    padding: "2px -4px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "125%",
    marginLeft: "-14%",
    backgroundColor: "#fff",
  },
  assignmentMessage: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "5px",
    border: "1px solid #ddd",
    color: "#333",
    fontSize: "16px",
  },
  commentInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    marginBottom: "10px",
    resize: "none", // Disable resizing
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  okBtn: {
    padding: "10px 20px",
    backgroundColor: "#2ecc71",
    border: "none",
    borderRadius: "5px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  submittedComment: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginTop: "20px",
  },
  commentHeader: {
    color: "#333",
    fontSize: "18px",
    marginBottom: "10px",
  },
  commentDisplay: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "16px",
    backgroundColor: "#f4f4f4",
    color: "#555",
    resize: "none",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
  },
};

export default InProcess;
