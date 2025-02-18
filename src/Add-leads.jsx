import React, { useState } from 'react';
import axios from "axios";
import './addleads.css'
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

function AddLeads() {
    const [formData, setFormData] = useState({
        name: '',
        mobilenumber: '',
        email: '',
        address: '',
        service: '',
        source: ''
    });
    const [errors, setErrors] = useState({ name: '', email: '', mobilenumber: '', service: '' });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const services = [
        'Insurance', 'Travel visa', 'Rental agreement', 'Lease agreement',
        'Affidavits/Annexture', 'PanCard', 'Passport', 'Senior Citizen Card',
        'Police verification certificate', 'Food License(FSSAI)',
        'MSME Certification', 'Police clearance certificate'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let errorMsg = '';

        if (name === 'name' && (!value.trim() || !/^[a-zA-Z\s]+$/.test(value))) {
            errorMsg = 'Valid name is required.';
        }
        if (name === 'email' && (!value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
            errorMsg = 'Valid email is required.';
        }
        if (name === 'mobilenumber' && (!value.trim() || !/^\d{10}$/.test(value))) {
            errorMsg = 'Valid 10-digit mobile number is required.';
        }
        if (name === 'service' && !value) {
            errorMsg = 'Please select a service.';
        }
        if (name === 'address' && !value.trim()) {
            errorMsg = 'Address is required.';
        }
        if (name === 'source' && !value.trim()) {
            errorMsg = 'Source is required.';
        }

        setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
    };


    const validateForm = () => {
        let newErrors = {};
        Object.keys(formData).forEach((key) => {
            validateField(key, formData[key]);
            if (!formData[key]) {
                newErrors[key] = 'This field is required.';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleAddLead = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await submitDataToAPI();
        setShowSuccessModal(true);
    };


    const submitDataToAPI = async () => {
        const data = {
            name: formData.name,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            source: formData.source,
            service :formData.service,
            mobilenumber: formData.mobilenumber,
            email: formData.email,
            address: formData.address,
            district: formData.address.split(',')[1] || 'N/A',
            state: formData.address.split(',')[2] || 'N/A',
            pincode: formData.address.split(',')[3] || 'N/A',
            paidAmount: formData.paidAmount,
            assign: 'Select lead user',
        };

        console.log("Data being sent to API:", data);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/lead/createLead`, data, {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error while saving data:", error);
            alert("An error occurred while saving your details. Please try again.");
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        setFormData({
            name: '',
            email: '',
            mobilenumber: '',
            service: '',
            source: '',
            address: ''
        });
    };

    return (
       <>
        <Helmet>
    <title>Add Leads - Make my Documents</title>


<meta name="author" content="https://leads.makemydocuments.in/add-leads"/>


    </Helmet>
        <Container className="form-container d-block d-lg-none">
            <Row className="justify-content-center align-items-center vh-100">
                <Col xs={12} md={8} lg={6}>
                    <h2 className="text-center mb-4">Add Lead</h2>
                    <Form className="p-4 border rounded bg-white shadow-sm" onSubmit={handleAddLead}>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter Name"
                                        isInvalid={!!errors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter Email"
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mobilenumber"
                                        value={formData.mobilenumber}
                                        onChange={handleChange}
                                        placeholder="Enter Mobile Number"
                                        isInvalid={!!errors.mobilenumber}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobilenumber}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label>Services</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                        isInvalid={!!errors.service}
                                    >
                                        <option value="">Select a Service</option>
                                        {services.map((service, index) => (
                                            <option key={index} value={service}>
                                                {service}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.service}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
            <div className="form-group">
            <label htmlFor="source">Source</label>
            <textarea
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Enter Source"
                required
                style={{borderColor:'black'}}
            />
        </div>
            </Col>
                        </Row>

                        <Form.Group className="mt-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" name="address" value={formData.address} onChange={handleChange} placeholder="Enter Address" />
                        </Form.Group>

                        <Button type="submit" className="w-100 mt-4">
                            Add Lead
                        </Button>
                    </Form>
                </Col>
            </Row>

            <Modal show={showSuccessModal} onHide={handleCloseModal} centered className='d-block d-lg-none'>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>Lead added successfully!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    <div className="d-none d-lg-block" style={{ marginLeft: '111%', marginTop: '130px', width: '250%' }}>    
    <form className="add-leads-form" onSubmit={handleAddLead}>
        <Row>
            <Col xs={12} md={6}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter Name"
                        required
                        style={{borderColor:'black'}}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
            </Col>
            <Col xs={12} md={6}>
                <div className="form-group">
                    <label htmlFor="email">Email ID</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter Email ID"
                        required
                        style={{borderColor:'black'}}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
            </Col>
        </Row>
        <Row>
            <Col xs={12} md={6}>
                <div className="form-group">
                    <label htmlFor="mobilenumber">Mobile Number</label>
                    <input
                        type="text"
                        id="mobilenumber"
                        name="mobilenumber"
                        value={formData.mobilenumber}
                        onChange={handleChange}
                        placeholder="Enter Mobile Number"
                        required
                        style={{borderColor:'black'}}
                    />
                    {errors.mobilenumber && <span className="error-text">{errors.mobilenumber}</span>}
                </div>
            </Col>
            <Col xs={12} md={6}>
                <div className="form-group">
                    <label htmlFor="service">Services</label>
                    <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        style={{borderColor:'black'}}
                    >
                        <option value="">Select a Service</option>
                        {services.map((service, index) => (
                            <option key={index} value={service}>
                                {service}
                            </option>
                        ))}
                    </select>
                    {errors.service && <span className="error-text">{errors.service}</span>}
                </div>
            </Col>

            
        </Row>
        <Row>
            <Col xs={12} md={6}>
            <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
                required
                style={{borderColor:'black'}}
            />
        </div>
            </Col>
            <Col xs={12} md={6}>
            <div className="form-group">
            <label htmlFor="source">Source</label>
            <textarea
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Enter Source"
                required
                style={{borderColor:'black'}}
            />
        </div>
            </Col>
        </Row>

       

        <button
            type="button" // Change type to "button" to prevent form submission
            className="submit-button"
            style={{ width: '25%', margin: 'auto' }}
            onClick={handleAddLead} // Trigger modal on click
        >
            Add Lead
        </button>
    </form>

    {/* Success Modal */}
    <Modal show={showSuccessModal} onHide={handleCloseModal} className='d-none d-lg-block'>
        <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>Lead added successfully!</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
</div>
</>
    );
}

export default AddLeads;
