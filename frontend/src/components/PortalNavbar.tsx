import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PortalNavbar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const token = localStorage.getItem('customer_token');

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        navigate('/portal/login');
    };

    if (!token) return null;

    return (
        <Navbar bg="white" expand="lg" className="shadow-sm mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/portal/dashboard" style={{ color: theme?.primaryColor, fontWeight: 'bold' }}>
                    {theme?.name || 'Client Portal'}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/portal/dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/book">Book a Class</Nav.Link>
                        <Nav.Link as={Link} to="/portal/buy-plan">Buy Plan</Nav.Link>
                    </Nav>
                    <Nav>
                        <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default PortalNavbar;
