import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BookingFailure: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Card className="shadow-lg border-0 text-center p-5" style={{ maxWidth: '500px' }}>
                <h1 className="text-danger display-4 mb-4">¡Pago Fallido!</h1>
                <p className="lead mb-4">Hubo un problema con tu pago. Por favor, intenta nuevamente.</p>
                <Button variant="primary" onClick={() => navigate('/book')}>
                    Intentar Nuevamente
                </Button>
            </Card>
        </div>
    );
};

export default BookingFailure;
