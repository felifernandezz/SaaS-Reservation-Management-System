import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface Props {
    serviceId: number;
    onSelect: (date: string, time: string) => void;
}

const DateTimeSelection: React.FC<Props> = ({ serviceId, onSelect }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Set default date to tomorrow for demo
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
        try {
            // Real API Call
            // const response = await axios.get(`/api/v1/availability/?service_id=${serviceId}&date=${date}`);
            // setAvailableSlots(response.data);

            // Mock Data for now (simulating backend response)
            setTimeout(() => {
                setAvailableSlots(['09:00', '09:30', '10:00', '11:30', '14:00', '15:30', '16:00']);
                setLoading(false);
            }, 600);
        } catch (error) {
            console.error("Error fetching availability", error);
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
                        <h5 className="fw-bold mb-3">Select Date</h5>
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
                        <h5 className="fw-bold mb-3">Available Times</h5>
                        {loading ? (
                            <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
                        ) : availableSlots.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
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
                            <p className="text-muted text-center">No slots available for this date.</p>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default DateTimeSelection;
