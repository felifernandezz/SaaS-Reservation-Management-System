import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import PortalNavbar from '../../components/PortalNavbar';

interface Plan {
    id: number;
    name: string;
    credits: number;
    price: number;
    validity_days: number;
}

const BuyPlan = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        setPlans([
            { id: 1, name: 'Pase Libre (8 Clases)', credits: 8, price: 50.00, validity_days: 30 },
            { id: 2, name: 'Clase Suelta', credits: 1, price: 10.00, validity_days: 7 },
            { id: 3, name: 'Pack Trimestral', credits: 24, price: 120.00, validity_days: 90 },
        ]);
        setLoading(false);
    }, []);

    const handlePurchase = async (plan: Plan) => {
        try {
            const token = localStorage.getItem('customer_token');
            if (!token) {
                navigate('/portal/login');
                return;
            }

            await axios.post('/api/v1/auth/customer/subscribe', {
                plan_id: plan.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Purchase successful! Credits added.');
            navigate('/portal/dashboard');
        } catch (err) {
            console.error(err);
            setError('Purchase failed. Please try again.');
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <>
            <PortalNavbar />
            <Container className="mt-5">
                <h2 className="text-center mb-4" style={{ color: theme?.primaryColor }}>Choose a Plan</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Row>
                    {plans.map(plan => (
                        <Col md={4} key={plan.id} className="mb-4">
                            <Card className="h-100 shadow-sm hover-card text-center">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fs-3">{plan.name}</Card.Title>
                                    <h3 className="display-4 my-3">${plan.price}</h3>
                                    <Card.Text className="text-muted mb-4">
                                        {plan.credits} Credits<br />
                                        Valid for {plan.validity_days} days
                                    </Card.Text>
                                    <Button
                                        variant="primary"
                                        className="mt-auto w-100"
                                        style={{ backgroundColor: theme?.primaryColor, borderColor: theme?.primaryColor }}
                                        onClick={() => handlePurchase(plan)}
                                    >
                                        Buy Now
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <div className="text-center mt-3">
                    <Button variant="link" onClick={() => navigate('/portal/dashboard')}>Back to Dashboard</Button>
                </div>
            </Container>
        </>
    );
};

export default BuyPlan;
