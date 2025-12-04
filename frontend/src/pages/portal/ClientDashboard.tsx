import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import PortalNavbar from '../../components/PortalNavbar';

interface CustomerProfile {
    full_name: string;
    email: string;
    active_subscription?: {
        plan_name: string;
        remaining_credits: number;
        expires_at: string;
    };
}

const ClientDashboard = () => {
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('customer_token');
            if (!token) {
                navigate('/portal/login');
                return;
            }

            try {
                const response = await axios.get('/api/v1/auth/customer/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);
            } catch (error) {
                localStorage.removeItem('customer_token');
                navigate('/portal/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <>
            <PortalNavbar />
            <Container className="mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: theme?.primaryColor }}>Welcome, {profile?.full_name}</h2>
                </div>

                <Row>
                    <Col md={6}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-white fw-bold">My Credits</Card.Header>
                            <Card.Body>
                                {profile?.active_subscription ? (
                                    <div>
                                        <h3 className="text-primary">{profile.active_subscription.plan_name}</h3>
                                        <p className="display-4 fw-bold">{profile.active_subscription.remaining_credits} <span className="fs-5 text-muted">credits left</span></p>
                                        <small className="text-muted">Expires: {new Date(profile.active_subscription.expires_at).toLocaleDateString()}</small>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p>No active credits found.</p>
                                        <Button variant="success" onClick={() => navigate('/portal/buy-plan')}>Buy Credits</Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-white fw-bold">Quick Actions</Card.Header>
                            <Card.Body>
                                <Button
                                    variant="primary"
                                    className="w-100 mb-3"
                                    size="lg"
                                    style={{ backgroundColor: theme?.primaryColor, borderColor: theme?.primaryColor }}
                                    onClick={() => navigate('/book')}
                                >
                                    Book a Class
                                </Button>
                                <Button variant="outline-secondary" className="w-100">View History</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ClientDashboard;
