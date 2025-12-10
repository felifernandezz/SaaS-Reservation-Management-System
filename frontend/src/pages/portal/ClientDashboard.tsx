import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useTheme } from '../../context/ThemeContext';
import PortalNavbar from '../../components/PortalNavbar';

const ClientDashboard = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('customer_token');
            if (!token) {
                navigate('/portal/login');
                return;
            }

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Cargar perfil y turnos en paralelo
                const [profileRes, apptRes] = await Promise.all([
                    axios.get('/api/v1/auth/customer/me', config),
                    axios.get('/api/v1/appointments/me', config)
                ]);

                setProfile(profileRes.data);
                setAppointments(apptRes.data);
            } catch (error) {
                console.error("Auth Error", error);
                localStorage.removeItem('customer_token');
                navigate('/portal/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    // Separar turnos pasados y futuros
    const now = moment();
    const upcoming = appointments.filter(a => moment(a.start_time).isAfter(now));
    const history = appointments.filter(a => moment(a.start_time).isBefore(now));

    return (
        <>
            <PortalNavbar />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: theme?.primaryColor }}>Hola, {profile?.full_name}</h2>
                    <Button
                        variant="primary"
                        size="lg"
                        style={{ backgroundColor: theme?.primaryColor, borderColor: theme?.primaryColor }}
                        onClick={() => navigate('/book')}
                    >
                        + Nuevo Turno
                    </Button>
                </div>

                <Row>
                    {/* PRÓXIMOS TURNOS */}
                    <Col md={8}>
                        <Card className="shadow-sm mb-4 border-0">
                            <Card.Header className="bg-white py-3">
                                <h5 className="mb-0 fw-bold">Próximos Turnos</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {upcoming.length > 0 ? (
                                    <Table hover responsive className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>Servicio</th>
                                                <th>Profesional</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {upcoming.map(appt => (
                                                <tr key={appt.id}>
                                                    <td>{moment(appt.start_time).format('DD/MM/YYYY')}</td>
                                                    <td className="fw-bold">{moment(appt.start_time).format('HH:mm')}</td>
                                                    <td>{appt.service?.name}</td>
                                                    <td>{appt.staff?.full_name || ''}</td>
                                                    <td>
                                                        <Badge bg={appt.status === 'CONFIRMED' ? 'success' : 'warning'}>
                                                            {appt.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <p>No tienes turnos próximos.</p>
                                        <Button variant="link" onClick={() => navigate('/book')}>Reservar ahora</Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* HISTORIAL (Opcional, colapsado o simple) */}
                        {history.length > 0 && (
                            <div className="mt-5">
                                <h6 className="text-muted mb-3">Historial Reciente</h6>
                                <div className="list-group">
                                    {history.slice(0, 3).map(appt => (
                                        <div key={appt.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center opacity-75">
                                            <div>
                                                <small className="fw-bold">{moment(appt.start_time).format('DD/MM/YYYY')}</small> - {appt.service?.name}
                                            </div>
                                            <small className="text-muted">Completado</small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Col>

                    {/* SIDEBAR INFORMATIVO */}
                    <Col md={4}>
                        <Card className="shadow-sm border-0 mb-3" style={{ background: `linear-gradient(135deg, ${theme?.primaryColor || '#0d6efd'} 0%, #333 100%)`, color: 'white' }}>
                            <Card.Body>
                                <h5>Mi Cuenta</h5>
                                <p className="mb-1 opacity-75">Email: {profile?.email}</p>
                                <p className="mb-0 opacity-75">Teléfono: {profile?.phone || 'No registrado'}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ClientDashboard;
