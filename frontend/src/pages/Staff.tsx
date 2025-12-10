import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Card, Button, Modal, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface User {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    services?: any[]; // Para mostrar qué hace
}

const Staff: React.FC = () => {
    const { t } = useTranslation();
    const [staff, setStaff] = useState<User[]>([]);
    const [allServices, setAllServices] = useState<any[]>([]); // Lista de servicios disponibles
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ email: '', full_name: '', password: '' });
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]); // Selección múltiple

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Cargar Staff y Servicios en paralelo
            const [staffRes, servicesRes] = await Promise.all([
                axios.get('/api/v1/users/', config),
                axios.get('/api/v1/services/', config)
            ]);

            setStaff(staffRes.data);
            setAllServices(servicesRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleShow = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ email: user.email, full_name: user.full_name, password: '' });
            // Pre-seleccionar servicios si el backend los devuelve (requiere que el endpoint GET users los incluya)
            // Por simplicidad en MVP, asumimos que están en user.services o vacíos
            setSelectedServiceIds(user.services?.map(s => s.id) || []);
        } else {
            setEditingUser(null);
            setFormData({ email: '', full_name: '', password: '' });
            setSelectedServiceIds([]);
        }
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleServiceToggle = (serviceId: number) => {
        setSelectedServiceIds(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let userId;

            // 1. Guardar Datos Básicos
            if (editingUser) {
                await axios.put(`/api/v1/users/${editingUser.id}`, { ...formData, tenant_id: 1 }, config);
                userId = editingUser.id;
            } else {
                const res = await axios.post('/api/v1/users/', { ...formData, tenant_id: 1 }, config);
                userId = res.data.id;
            }

            // 2. Guardar Asignación de Servicios (Skills)
            // Llamamos al endpoint especial que creamos
            await axios.post(`/api/v1/users/${userId}/services`, selectedServiceIds, config);

            fetchData();
            handleClose();
        } catch (err) {
            console.error("Error saving staff", err);
            setError("Failed to save staff.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/v1/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchData();
            } catch (err) { setError("Error deleting."); }
        }
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{t('nav.staff')}</h2>
                <Button variant="primary" onClick={() => handleShow()}>
                    <FaPlus className="me-2" /> New Staff
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">Name</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Assigned Services</th> {/* Nueva Columna */}
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(user => (
                                <tr key={user.id}>
                                    <td>{user.full_name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {user.services && user.services.length > 0
                                            ? <small className="text-primary">{user.services.length} services</small>
                                            : <small className="text-muted fst-italic">All Services (Generalist)</small>
                                        }
                                    </td>
                                    <td className="text-end">
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(user)}><FaEdit /></Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user.id)}><FaTrash /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingUser ? 'Edit Staff' : 'New Staff'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Campos Básicos */}
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password {editingUser && '(Optional)'}</Form.Label>
                            <Form.Control type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </Form.Group>

                        <hr />

                        {/* Selector de Servicios (Checkboxes) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Assigned Services</Form.Label>
                            <div className="mb-2 text-muted small">
                                {selectedServiceIds.length === 0
                                    ? "No services selected. This person can perform ALL services."
                                    : "This person can ONLY perform selected services."}
                            </div>
                            <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {allServices.map(service => (
                                    <Form.Check
                                        key={service.id}
                                        type="checkbox"
                                        id={`service-${service.id}`}
                                        label={service.name}
                                        checked={selectedServiceIds.includes(service.id)}
                                        onChange={() => handleServiceToggle(service.id)}
                                    />
                                ))}
                            </div>
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

export default Staff;
