import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

interface CreateAppointmentModalProps {
    show: boolean;
    onHide: () => void;
    start: Date | null;
    end: Date | null;
    onSuccess: () => void;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({ show, onHide, start, end, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data Lists
    const [services, setServices] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    // Form State
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const [customerType, setCustomerType] = useState<'existing' | 'guest'>('existing');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [guestData, setGuestData] = useState({ full_name: '', email: '', phone: '' });

    // DateTime State (Editable)
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (show) {
            fetchData();
            if (start) {
                setDate(moment(start).format('YYYY-MM-DD'));
                setTime(moment(start).format('HH:mm'));
            }
        }
    }, [show, start]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [servicesRes, staffRes, customersRes] = await Promise.all([
                axios.get('/api/v1/services/', config),
                axios.get('/api/v1/users/', config), // Staff are users
                axios.get('/api/v1/customers/', config)
            ]);

            setServices(servicesRes.data);
            setStaffList(staffRes.data);
            setCustomers(customersRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
            setError("Failed to load form data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedServiceId) {
            setError("Please select a service.");
            return;
        }
        if (customerType === 'existing' && !selectedCustomerId) {
            setError("Please select a customer.");
            return;
        }
        if (customerType === 'guest' && (!guestData.full_name || !guestData.email)) {
            setError("Please fill in guest details.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const payload: any = {
                service_id: selectedServiceId,
                start_time: `${date}T${time}:00`,
                staff_id: selectedStaffId
            };

            if (customerType === 'existing') {
                payload.customer_id = selectedCustomerId;
            } else {
                payload.guest_data = guestData;
            }

            // Hardcoded tenant_id=1 for MVP
            await axios.post('/api/v1/appointments/?tenant_id=1', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onSuccess();
            onHide();
        } catch (err: any) {
            console.error("Error creating appointment", err);
            setError(err.response?.data?.detail || "Failed to create appointment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>New Appointment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center p-4"><Spinner animation="border" /></div>
                ) : (
                    <Form>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Time</Form.Label>
                                    <Form.Control type="time" value={time} onChange={e => setTime(e.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Service</Form.Label>
                                    <Form.Select
                                        value={selectedServiceId || ''}
                                        onChange={e => setSelectedServiceId(Number(e.target.value))}
                                    >
                                        <option value="">Select Service...</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Staff (Optional)</Form.Label>
                                    <Form.Select
                                        value={selectedStaffId || ''}
                                        onChange={e => setSelectedStaffId(e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">Any Staff</option>
                                        {staffList.map(s => (
                                            <option key={s.id} value={s.id}>{s.full_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr />

                        <Form.Group className="mb-3">
                            <Form.Label>Customer Type</Form.Label>
                            <div className="mb-2">
                                <Form.Check
                                    inline
                                    label="Existing Customer"
                                    name="customerType"
                                    type="radio"
                                    checked={customerType === 'existing'}
                                    onChange={() => setCustomerType('existing')}
                                />
                                <Form.Check
                                    inline
                                    label="New Guest"
                                    name="customerType"
                                    type="radio"
                                    checked={customerType === 'guest'}
                                    onChange={() => setCustomerType('guest')}
                                />
                            </div>
                        </Form.Group>

                        {customerType === 'existing' ? (
                            <Form.Group className="mb-3">
                                <Form.Label>Select Customer</Form.Label>
                                <Form.Select
                                    value={selectedCustomerId || ''}
                                    onChange={e => setSelectedCustomerId(Number(e.target.value))}
                                >
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        ) : (
                            <div className="p-3 bg-light rounded">
                                <Row className="mb-2">
                                    <Col>
                                        <Form.Control
                                            placeholder="Full Name"
                                            value={guestData.full_name}
                                            onChange={e => setGuestData({ ...guestData, full_name: e.target.value })}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            placeholder="Email"
                                            value={guestData.email}
                                            onChange={e => setGuestData({ ...guestData, email: e.target.value })}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Control
                                            placeholder="Phone"
                                            value={guestData.phone}
                                            onChange={e => setGuestData({ ...guestData, phone: e.target.value })}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}

                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={submitting || loading}>
                    {submitting ? <Spinner animation="border" size="sm" /> : 'Create Appointment'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateAppointmentModal;
