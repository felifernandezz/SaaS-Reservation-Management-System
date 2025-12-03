import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCalendarCheck, FaMoneyBillWave, FaUsers, FaClock } from 'react-icons/fa';
import { getDashboardStats, DashboardStats } from '../services/stats';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4 text-dark fw-bold">{t('nav.dashboard')}</h2>

            <Row className="g-4">
                {/* Appointments Today */}
                <Col md={3}>
                    <Card className="h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                                <FaCalendarCheck size={24} color="white" />
                            </div>
                            <div>
                                <h6 className="mb-0 opacity-75">{t('dashboard_stats.appointments_today')}</h6>
                                <h3 className="fw-bold mb-0">{stats?.totalAppointmentsToday}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Revenue Today */}
                <Col md={3}>
                    <Card className="h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)', color: 'white' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                                <FaMoneyBillWave size={24} color="white" />
                            </div>
                            <div>
                                <h6 className="mb-0 opacity-75">{t('dashboard_stats.revenue_est')}</h6>
                                <h3 className="fw-bold mb-0">${stats?.totalRevenueToday.toLocaleString()}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Active Staff */}
                <Col md={3}>
                    <Card className="h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', color: '#555' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-circle bg-white bg-opacity-50 p-3 me-3">
                                <FaUsers size={24} color="#555" />
                            </div>
                            <div>
                                <h6 className="mb-0 opacity-75">{t('dashboard_stats.active_staff')}</h6>
                                <h3 className="fw-bold mb-0">{stats?.activeStaff}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Pending Confirmations */}
                <Col md={3}>
                    <Card className="h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                                <FaClock size={24} color="white" />
                            </div>
                            <div>
                                <h6 className="mb-0 opacity-75">{t('dashboard_stats.pending')}</h6>
                                <h3 className="fw-bold mb-0">{stats?.pendingConfirmations}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Placeholder for Recent Activity */}
            <Row className="mt-5">
                <Col md={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">{t('dashboard_stats.recent_activity')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted text-center py-5">{t('dashboard_stats.no_activity')}</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">{t('dashboard_stats.quick_actions')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <button className="btn btn-primary">{t('dashboard_stats.new_appointment')}</button>
                                <button className="btn btn-outline-secondary">{t('dashboard_stats.add_client')}</button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
