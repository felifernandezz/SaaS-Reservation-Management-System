import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Settings State
    const [settings, setSettings] = useState({
        title: '',
        primary_color: '#0d6efd',
        logo_url: '',
        working_hours_start: '09:00',
        working_hours_end: '18:00'
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
            setSettings({
                title: response.data.title || '',
                primary_color: response.data.primary_color || '#0d6efd',
                logo_url: response.data.logo_url || '',
                working_hours_start: response.data.working_hours_start || '09:00',
                working_hours_end: response.data.working_hours_end || '18:00'
            });
        } catch (err) {
            console.error("Error fetching settings", err);
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
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving settings", err);
            setError("Failed to save settings.");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4 text-dark fw-bold">{t('nav.settings')}</h2>

            {saved && (
                <Alert variant="success" onClose={() => setSaved(false)} dismissible>
                    Settings saved successfully!
                </Alert>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={6}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">General Configuration</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSave}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Website Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={settings.title}
                                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Primary Color</Form.Label>
                                    <Form.Control
                                        type="color"
                                        value={settings.primary_color}
                                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Logo URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={settings.logo_url}
                                        onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    Save Changes
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Default Working Hours</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={settings.working_hours_start}
                                                onChange={(e) => setSettings({ ...settings, working_hours_start: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={settings.working_hours_end}
                                                onChange={(e) => setSettings({ ...settings, working_hours_end: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Text className="text-muted">
                                    This sets the visible range in the calendar.
                                </Form.Text>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;
