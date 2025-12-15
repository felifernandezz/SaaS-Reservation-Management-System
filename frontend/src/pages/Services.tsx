import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Card, Button, Modal, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';

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

    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: '', price: 0, duration_minutes: 30 });

    // Delete state
    const [showDelete, setShowDelete] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/services/', { headers: { Authorization: `Bearer ${token}` } });
            setServices(response.data);
        } catch (err) { setError("Failed to load services."); } finally { setLoading(false); }
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

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData, tenant_id: 1 };
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingService) await axios.put(`/api/v1/services/${editingService.id}`, payload, config);
            else await axios.post('/api/v1/services/', payload, config);
            fetchServices();
            setShowModal(false);
        } catch (err) { setError("Failed to save service."); }
    };

    const confirmDelete = (id: number) => {
        setItemToDelete(id);
        setShowDelete(true);
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/services/${itemToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchServices();
        } catch (err) { setError("Failed to delete service."); }
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{t('nav.services')}</h2>
                <Button variant="primary" onClick={() => handleShow()}><FaPlus className="me-2" /> New Service</Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Name</th><th>Price</th><th>Duration</th><th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>{service.name}</td><td>${service.price}</td><td>{service.duration_minutes}m</td>
                                    <td className="text-end">
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(service)}><FaEdit /></Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(service.id)}><FaTrash /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>{editingService ? 'Edit' : 'New'} Service</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Price</Form.Label><Form.Control type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Duration</Form.Label><Form.Control type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} /></Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save</Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                show={showDelete}
                onHide={() => setShowDelete(false)}
                onConfirm={executeDelete}
                title="Borrar Servicio"
                body="Al borrar este servicio, desaparecerá de las opciones de reserva. ¿Continuar?"
            />
        </Container>
    );
};
export default Services;
