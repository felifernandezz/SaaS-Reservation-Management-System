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

    const [services, setServices] = useState<any[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<any[]>([]); // Staff filtrado
    const [customers, setCustomers] = useState<any[]>([]);

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    
    // ... (rest of states: customerType, guestData, date, time) same as before ...
    const [customerType, setCustomerType] = useState<'existing' | 'guest'>('existing');
    const [guestData, setGuestData] = useState({ full_name: '', email: '', phone: '' });
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (show) {
            fetchInitialData();
            if (start) {
                setDate(moment(start).format('YYYY-MM-DD'));
                setTime(moment(start).format('HH:mm'));
            }
        }
    }, [show, start]);

    // EFECTO DE FILTRADO: Cuando cambia el servicio, recargar staff
    useEffect(() => {
        if (selectedServiceId) {
            fetchStaffForService(selectedServiceId);
        } else {
            setFilteredStaff([]); // O cargar todos si prefieres
        }
    }, [selectedServiceId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [servicesRes, customersRes] = await Promise.all([
                axios.get('/api/v1/services/', config),
                axios.get('/api/v1/customers/', config)
            ]);
            setServices(servicesRes.data);
            setCustomers(customersRes.data);
        } catch (err) { setError("Failed to load data."); } finally { setLoading(false); }
    };

    const fetchStaffForService = async (serviceId: number) => {
        try {
            // Usamos el endpoint publico que ya tiene la lógica de filtrado OR
            // Nota: Para usarlo internamente como admin, podríamos necesitar ajustar auth o usar el endpoint interno filtrando en frontend
            // Por simplicidad, usaremos el publico pasando tenant_id=1 (o del contexto)
            const res = await axios.get(`/api/v1/users/public?tenant_id=1&service_id=${serviceId}`);
            setFilteredStaff(res.data);
            setSelectedStaffId(null); // Reset selection
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async () => {
        // ... (misma lógica de submit que tenías, solo copiar) ...
        if (!selectedServiceId) { setError("Please select a service."); return; }
        
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const payload: any = {
                service_id: selectedServiceId,
                start_time: `${date}T${time}:00`,
                staff_id: selectedStaffId
            };
            
            if (customerType === 'existing') payload.customer_id = selectedCustomerId;
            else payload.guest_data = guestData;

            await axios.post('/api/v1/appointments/?tenant_id=1', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onHide();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed.");
        } finally { setSubmitting(false); }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton><Modal.Title>New Appointment</Modal.Title></Modal.Header>
            <Modal.Body>
                {loading ? <div className="text-center p-4"><Spinner animation="border"/></div> : (
                    <Form>
                        {error && <Alert variant="danger">{error}</Alert>}
                        
                        {/* Date & Time Row */}
                        <Row className="mb-3">
                            <Col><Form.Control type="date" value={date} onChange={e=>setDate(e.target.value)} /></Col>
                            <Col><Form.Control type="time" value={time} onChange={e=>setTime(e.target.value)} /></Col>
                        </Row>

                        {/* Service & Staff Row */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label>Service</Form.Label>
                                <Form.Select value={selectedServiceId || ''} onChange={e => setSelectedServiceId(Number(e.target.value))}>
                                    <option value="">Select Service...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label>Staff</Form.Label>
                                <Form.Select 
                                    value={selectedStaffId || ''} 
                                    onChange={e => setSelectedStaffId(e.target.value ? Number(e.target.value) : null)}
                                    disabled={!selectedServiceId}
                                >
                                    <option value="">{selectedServiceId ? "Any Staff / Auto-Assign" : "Select Service First"}</option>
                                    {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>

                        <hr />
                        {/* Customer Logic (Igual que antes) */}
                        <Form.Group className="mb-3">
                            <div className="mb-2">
                                <Form.Check inline label="Existing Customer" type="radio" checked={customerType === 'existing'} onChange={() => setCustomerType('existing')} />
                                <Form.Check inline label="New Guest" type="radio" checked={customerType === 'guest'} onChange={() => setCustomerType('guest')} />
                            </div>
                            {customerType === 'existing' ? (
                                <Form.Select value={selectedCustomerId || ''} onChange={e => setSelectedCustomerId(Number(e.target.value))}>
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </Form.Select>
                            ) : (
                                <Row>
                                    <Col><Form.Control placeholder="Name" value={guestData.full_name} onChange={e => setGuestData({...guestData, full_name: e.target.value})} /></Col>
                                    <Col><Form.Control placeholder="Email" value={guestData.email} onChange={e => setGuestData({...guestData, email: e.target.value})} /></Col>
                                </Row>
                            )}
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={submitting}>Create</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateAppointmentModal;
