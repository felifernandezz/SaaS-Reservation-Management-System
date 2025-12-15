import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Badge, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import PortalNavbar from '../../components/PortalNavbar';
// Asegúrate de que esta ruta sea correcta según tu estructura
import ConfirmModal from '../../components/ConfirmModal'; 

const ClientDashboard = () => {
    const { t } = useTranslation();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const theme = useTheme();

    // Modal State
    const [showConfirm, setShowConfirm] = useState(false);
    const [apptToCancel, setApptToCancel] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        const token = localStorage.getItem('customer_token');
        if (!token) {
            navigate('/portal/login');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
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

    const requestCancel = (id: number) => {
        setApptToCancel(id);
        setShowConfirm(true);
    };

    const executeCancel = async () => {
        if (!apptToCancel) return;
        
        setActionLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('customer_token');
            await axios.delete(`/api/v1/appointments/${apptToCancel}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh data instead of page reload
            await fetchData();
            setShowConfirm(false);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || t('client_portal.cancel_error');
            setError(msg);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

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
                        + {t('client_portal.new_booking')}
                    </Button>
                </div>

                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

                <Row>
                    {/* PRÓXIMOS TURNOS */}
                    <Col md={8}>
                        <Card className="shadow-sm mb-4 border-0">
                            <Card.Header className="bg-white py-3">
                                <h5 className="mb-0 fw-bold">{t('client_portal.my_appointments')}</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {upcoming.length > 0 ? (
                                    <Table hover responsive className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>{t('booking.date')}</th>
                                                <th>{t('booking.time')}</th>
                                                <th>{t('booking.service')}</th>
                                                <th>Staff</th>
                                                <th>{t('client_portal.status')}</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {upcoming.map(appt => (
                                                <tr key={appt.id}>
                                                    <td>{moment(appt.start_time).format('DD/MM/YYYY')}</td>
                                                    <td className="fw-bold">{moment(appt.start_time).format('HH:mm')}</td>
                                                    <td>{appt.service?.name}</td>
                                                    <td>{appt.staff?.full_name || '-'}</td>
                                                    <td>
                                                        <Badge bg={appt.status === 'CONFIRMED' ? 'success' : 'warning'}>
                                                            {appt.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end">
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            onClick={() => requestCancel(appt.id)}
                                                            disabled={actionLoading}
                                                        >
                                                            {t('common.cancel')}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <p>{t('client_portal.no_appointments')}</p>
                                        <Button variant="link" onClick={() => navigate('/book')}>{t('booking.book_another')}</Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* HISTORIAL */}
                        {history.length > 0 && (
                            <div className="mt-5">
                                <h6 className="text-muted mb-3">{t('client_portal.history')}</h6>
                                <div className="list-group">
                                    {history.slice(0, 5).map(appt => (
                                        <div key={appt.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center opacity-75">
                                            <div>
                                                <small className="fw-bold me-2">{moment(appt.start_time).format('DD/MM/YYYY')}</small>
                                                {appt.service?.name}
                                            </div>
                                            <small className="text-muted">{t('client_portal.completed')}</small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Col>

                    {/* SIDEBAR INFORMATIVO */}
                    <Col md={4}>
                        <Card className="shadow-sm border-0 mb-3" style={{ background: `linear-gradient(135deg, ${theme?.primaryColor} 0%, #333 100%)`, color: 'white' }}>
                            <Card.Body>
                                <h5>{t('client_portal.my_account')}</h5>
                                <p className="mb-1 opacity-75">Email: {profile?.email}</p>
                                <p className="mb-0 opacity-75">Tel: {profile?.phone || '-'}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                
                {/* Modal de Confirmación */}
                <ConfirmModal
                    show={showConfirm}
                    onHide={() => setShowConfirm(false)}
                    onConfirm={executeCancel}
                    title={t('client_portal.cancel_appt')}
                    body={t('client_portal.confirm_cancel')}
                    confirmVariant="danger"
                    confirmText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                />
            </Container>
        </>
    );
};

export default ClientDashboard;