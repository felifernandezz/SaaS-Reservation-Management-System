import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface Service {
    id: number;
    name: string;
    duration_minutes: number;
    price?: number; // Optional for now
}

interface Props {
    onSelect: (service: Service) => void;
}

const ServiceSelection: React.FC<Props> = ({ onSelect }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('/api/v1/services/');
                setServices(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching services", error);
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    return (
        <Row className="g-4">
            {services.map(service => (
                <Col md={6} key={service.id}>
                    <Card className="h-100 shadow-sm hover-shadow cursor-pointer" onClick={() => onSelect(service)}>
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold mb-1">{service.name}</h5>
                                <small className="text-muted">{service.duration_minutes} min</small>
                            </div>
                            <div className="text-end">
                                <h5 className="text-primary fw-bold mb-2">${service.price}</h5>
                                <Button variant="outline-primary" size="sm" onClick={(e) => { e.stopPropagation(); onSelect(service); }}>
                                    Select
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default ServiceSelection;
