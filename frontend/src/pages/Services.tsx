import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Card, Button, Modal, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface Service {
    id: number;
    name: string;
    price: number;
    duration_minutes: number;
}

const Services: React.FC = () => {
    const { t } = useTranslation();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: '', price: 0, duration_minutes: 30 });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/v1/services/');
            setServices(response.data);
        } catch (err) {
            console.error("Error fetching services", err);
            setError("Failed to load services.");
        } finally {
            setLoading(false);
        }
    };

    const handleShow = (service: Service | null = null) => {
        if (service) {
            setEditingService(service);
            setFormData({ name: service.name, price: service.price, duration_minutes: service.duration_minutes });
        } else {
            setEditingService(null);
            setFormData({ name: '', price: 0, duration_minutes: 30 });
        }
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSave = async () => {
        try {
            const payload = { ...formData, tenant_id: 1 }; // Hardcoded tenant_id for MVP
            if (editingService) {
                await axios.put(`/api/v1/services/${editingService.id}`, payload);
            } else {
                await axios.post('/api/v1/services/', payload);
            }
            fetchServices();
            handleClose();
        } catch (err) {
            console.error("Error saving service", err);
            setError("Failed to save service.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await axios.delete(`/api/v1/services/${id}`);
                fetchServices();
            } catch (err) {
                console.error("Error deleting service", err);
                setError("Failed to delete service.");
            }
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center p-5">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{t('nav.services')}</h2>
                <Button variant="primary" onClick={() => handleShow()}>
                    <FaPlus className="me-2" /> New Service
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">ID</th>
                                <th className="border-0">Name</th>
                                <th className="border-0">Price</th>
                                <th className="border-0">Duration (min)</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length > 0 ? (
                                services.map(service => (
                                    <tr key={service.id}>
                                        <td>{service.id}</td>
                                        <td>{service.name}</td>
                                        <td>${service.price}</td>
                                        <td>{service.duration_minutes}</td>
                                        <td className="text-end">
                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(service)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(service.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-muted">
                                        No services found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingService ? 'Edit Service' : 'New Service'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration (minutes)</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.duration_minutes}
                                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Services;
