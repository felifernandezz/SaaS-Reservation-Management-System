import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

interface Props {
    serviceId: number;
    onSelect: (date: string, time: string) => void;
}

const DateTimeSelection: React.FC<Props> = ({ serviceId, onSelect }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Default: Mañana
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (selectedDate && serviceId) {
            fetchAvailability(selectedDate);
        }
    }, [selectedDate, serviceId]);

    const fetchAvailability = async (date: string) => {
        setLoading(true);
        setError(null);
        setAvailableSlots([]);

        try {
            // NOTA: tenant_id=1 hardcodeado temporalmente, debe venir de props o contexto
            const response = await axios.get(`/api/v1/availability/`, {
                params: {
                    service_id: serviceId,
                    date: date,
                    tenant_id: 1
                }
            });
            setAvailableSlots(response.data);
        } catch (err) {
            console.error("Error fetching availability", err);
            setError("Error al cargar horarios. Intente otra fecha.");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        onSelect(selectedDate, time);
    };

    return (
        <Row>
            <Col md={6}>
                <Card className="shadow-sm mb-3">
                    <Card.Body>
                        <h5 className="fw-bold mb-3">Seleccionar Fecha</h5>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="shadow-sm h-100">
                    <Card.Body>
                        <h5 className="fw-bold mb-3">Horarios Disponibles</h5>
                        {error && <Alert variant="warning" className="py-2 fs-6">{error}</Alert>}
                        {loading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" variant="primary" />
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {availableSlots.map(time => (
                                    <Button
                                        key={time}
                                        variant={selectedTime === time ? "primary" : "outline-primary"}
                                        onClick={() => handleTimeSelect(time)}
                                        className="flex-grow-1"
                                        style={{ minWidth: '80px' }}
                                    >
                                        {time}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted">
                                <p>Sin disponibilidad.</p>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default DateTimeSelection;
