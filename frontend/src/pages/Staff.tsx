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
}

const Staff: React.FC = () => {
    const { t } = useTranslation();
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ email: '', full_name: '', password: '' });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/users/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaff(response.data);
        } catch (err) {
            console.error("Error fetching staff", err);
            setError("Failed to load staff.");
        } finally {
            setLoading(false);
        }
    };

    const handleShow = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ email: user.email, full_name: user.full_name, password: '' });
        } else {
            setEditingUser(null);
            setFormData({ email: '', full_name: '', password: '' });
        }
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload: any = { ...formData, tenant_id: 1 }; // Hardcoded tenant_id
            if (!payload.password) delete payload.password; // Don't send empty password on edit

            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingUser) {
                await axios.put(`/api/v1/users/${editingUser.id}`, payload, config);
            } else {
                await axios.post('/api/v1/users/', payload, config);
            }
            fetchStaff();
            handleClose();
        } catch (err) {
            console.error("Error saving staff", err);
            setError("Failed to save staff.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/v1/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchStaff();
            } catch (err) {
                console.error("Error deleting staff", err);
                setError("Failed to delete staff.");
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
                                <th className="border-0">ID</th>
                                <th className="border-0">Name</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Status</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.length > 0 ? (
                                staff.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.full_name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(user)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-muted">
                                        No staff found.
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
                    <Modal.Title>{editingUser ? 'Edit Staff' : 'New Staff'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password {editingUser && '(Leave blank to keep current)'}</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

export default Staff;
