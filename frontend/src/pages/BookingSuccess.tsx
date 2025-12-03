import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BookingSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Card className="shadow-lg border-0 text-center p-5" style={{ maxWidth: '500px' }}>
                <h1 className="text-success display-4 mb-4">¡Pago Exitoso!</h1>
                <p className="lead mb-4">Tu turno ha sido confirmado. Te hemos enviado un correo con los detalles.</p>
                <Button variant="primary" onClick={() => navigate('/book')}>
                    Volver al Inicio
                </Button>
            </Card>
        </div>
    );
};

export default BookingSuccess;
