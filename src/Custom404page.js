import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Custom404Page = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirect to the homepage
  };

  return (
    <Container className="text-center-custompage" >
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold text-danger">404</h1>
          <h2 className="mb-4">Oops! Page Not Found</h2>
          <p className="text-muted">
            The page you're looking for doesn't exist. It might have been moved
            or deleted.
          </p>
          <Button variant="primary" onClick={handleGoHome}>
            Go Back to Home
          </Button>
        </Col>
      </Row>
      <style>
         {`
          .text-center-custompage {
          margin-top:12%
         }
           @media (max-width: 768px) {
            .text-center-custompage {
          margin-top:41%
         }
         }
         `}
      </style>
    </Container>
  );
};

export default Custom404Page;
