import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [settings, setSettings] = useState({
        title: '',
        primary_color: '#0d6efd',
        logo_url: '',
        working_hours_start: '09:00',
        working_hours_end: '18:00',
        cancellation_hours: 24
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/tenants/config', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Cargar datos asegurando que no sean null
            setSettings({
                title: response.data.title || '',
                primary_color: response.data.primary_color || '#0d6efd',
                logo_url: response.data.logo_url || '',
                working_hours_start: response.data.working_hours_start || '09:00',
                working_hours_end: response.data.working_hours_end || '18:00',
                cancellation_hours: response.data.cancellation_hours || 24
            });
        } catch (err) {
            console.error(err);
            setError("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(false);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/v1/tenants/config', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);

            // Actualizar variables CSS en caliente para ver el cambio
            document.documentElement.style.setProperty('--bs-primary', settings.primary_color);
            document.title = settings.title;

        } catch (err) {
            console.error(err);
            setError("Failed to save settings.");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4 text-dark fw-bold">{t('nav.settings')}</h2>
            {saved && <Alert variant="success" dismissible onClose={() => setSaved(false)}>Saved!</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleSave}>
                        <Row>
                            <Col md={6}>
                                <h5 className="mb-3">Branding</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label>Website Title</Form.Label>
                                    <Form.Control type="text" value={settings.title} onChange={e => setSettings({ ...settings, title: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Primary Color</Form.Label>
                                    <Form.Control type="color" value={settings.primary_color} onChange={e => setSettings({ ...settings, primary_color: e.target.value })} title="Choose your brand color" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <h5 className="mb-3">Global Working Hours</h5>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Control type="time" value={settings.working_hours_start} onChange={e => setSettings({ ...settings, working_hours_start: e.target.value })} />
                                    </Col>
                                    <Col>
                                        <Form.Control type="time" value={settings.working_hours_end} onChange={e => setSettings({ ...settings, working_hours_end: e.target.value })} />
                                    </Col>
                                </Row>

                                <h5 className="mb-3">Booking Rules</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cancellation Policy (Hours)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={settings.cancellation_hours}
                                        onChange={e => setSettings({ ...settings, cancellation_hours: parseInt(e.target.value) })}
                                        min={0}
                                    />
                                    <Form.Text className="text-muted">
                                        Clients can cancel up to this many hours before. (0 = Always allowed)
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" variant="primary" className="mt-3">Save Changes</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Settings;
