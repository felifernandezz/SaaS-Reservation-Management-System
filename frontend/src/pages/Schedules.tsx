import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaTrash, FaPlus } from 'react-icons/fa';

const Schedules: React.FC = () => {
    const [staff, setStaff] = useState<any[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [schedules, setSchedules] = useState<any[]>([]);

    // Form
    const [newSchedule, setNewSchedule] = useState({
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00'
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        if (selectedStaff) {
            fetchSchedules(selectedStaff);
        } else {
            setSchedules([]);
        }
    }, [selectedStaff]);

    const fetchStaff = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/users/', { headers: { Authorization: `Bearer ${token}` } });
        setStaff(res.data);
        if (res.data.length > 0) setSelectedStaff(res.data[0].id);
    };

    const fetchSchedules = async (staffId: number) => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/v1/schedules/?staff_id=${staffId}`, { headers: { Authorization: `Bearer ${token}` } });
        setSchedules(res.data);
    };

    const handleAdd = async () => {
        if (!selectedStaff) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/v1/schedules/', {
                ...newSchedule,
                start_time: newSchedule.start_time + ":00",
                end_time: newSchedule.end_time + ":00",
                staff_id: selectedStaff,
                tenant_id: 1, // Se ignora en backend por current_user pero requerido por schema
                is_active: true
            }, { headers: { Authorization: `Bearer ${token}` } });

            fetchSchedules(selectedStaff);
        } catch (e) {
            alert("Error adding schedule");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this block?")) return;
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/schedules/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (selectedStaff) fetchSchedules(selectedStaff);
    };

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Gestión de Horarios</h2>
            <Row>
                <Col md={3}>
                    <Card>
                        <Card.Header>Seleccionar Empleado</Card.Header>
                        <div className="list-group list-group-flush">
                            {staff.map(s => (
                                <button
                                    key={s.id}
                                    className={`list-group-item list-group-item-action ${selectedStaff === s.id ? 'active' : ''}`}
                                    onClick={() => setSelectedStaff(s.id)}
                                >
                                    {s.full_name}
                                </button>
                            ))}
                        </div>
                    </Card>
                </Col>
                <Col md={9}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h5>Agregar Bloque de Trabajo</h5>
                            <Row className="align-items-end">
                                <Col md={3}>
                                    <Form.Label>Día</Form.Label>
                                    <Form.Select
                                        value={newSchedule.day_of_week}
                                        onChange={e => setNewSchedule({ ...newSchedule, day_of_week: parseInt(e.target.value) })}
                                    >
                                        {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Inicio</Form.Label>
                                    <Form.Control type="time" value={newSchedule.start_time} onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })} />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Fin</Form.Label>
                                    <Form.Control type="time" value={newSchedule.end_time} onChange={e => setNewSchedule({ ...newSchedule, end_time: e.target.value })} />
                                </Col>
                                <Col md={3}>
                                    <Button variant="success" className="w-100" onClick={handleAdd}><FaPlus /> Agregar</Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Horarios Actuales</Card.Header>
                        <Table hover>
                            <thead>
                                <tr><th>Día</th><th>Inicio</th><th>Fin</th><th className="text-end">Acciones</th></tr>
                            </thead>
                            <tbody>
                                {schedules.sort((a, b) => a.day_of_week - b.day_of_week).map(s => (
                                    <tr key={s.id}>
                                        <td>{days[s.day_of_week]}</td>
                                        <td>{s.start_time}</td>
                                        <td>{s.end_time}</td>
                                        <td className="text-end">
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.id)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Schedules;
