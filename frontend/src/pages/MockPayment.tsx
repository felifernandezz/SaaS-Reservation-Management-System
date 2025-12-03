import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const MockPayment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async (success: boolean) => {
        setLoading(true);
        setError(null);
        try {
            if (success) {
                // Call backend to confirm payment
                await axios.post(`/api/v1/appointments/${id}/confirm-payment`);
                navigate('/book/success');
            } else {
                navigate('/book/failure');
            }
        } catch (err) {
            console.error("Payment Error", err);
            setError("Error processing payment simulation.");
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Card className="shadow-lg border-0 p-5" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">Mercado Pago (Mock)</h2>
                    <p className="text-muted">Simulación de Pasarela de Pago</p>
                    <div className="my-4 p-3 bg-light rounded">
                        <h5>Total a Pagar</h5>
                        <h3 className="fw-bold">$1500.00</h3>
                        <small className="text-muted">Appointment ID: {id}</small>
                    </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <div className="d-grid gap-3">
                    <Button
                        variant="success"
                        size="lg"
                        onClick={() => handlePayment(true)}
                        disabled={loading}
                    >
                        {loading ? <Spinner size="sm" animation="border" /> : 'Pagar con Éxito'}
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={() => handlePayment(false)}
                        disabled={loading}
                    >
                        Simular Fallo
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default MockPayment;
