import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const [saved, setSaved] = useState(false);

    // Mock State for Settings
    const [cancellationHours, setCancellationHours] = useState(24);
    const [timezone, setTimezone] = useState('America/Argentina/Buenos_Aires');

    // Mock Working Hours State
    const [workingHours, setWorkingHours] = useState({
        start: '09:00',
        end: '18:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 500);
    };

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4 text-dark fw-bold">{t('nav.settings')}</h2>

            {saved && (
                <Alert variant="success" onClose={() => setSaved(false)} dismissible>
                    Settings saved successfully!
                </Alert>
            )}

            <Row>
                <Col md={6}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">General Configuration</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSave}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Timezone</Form.Label>
                                    <Form.Select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                    >
                                        <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires (GMT-3)</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Cancellation Policy (Hours before appointment)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={cancellationHours}
                                        onChange={(e) => setCancellationHours(parseInt(e.target.value))}
                                    />
                                    <Form.Text className="text-muted">
                                        Clients cannot cancel if less than {cancellationHours} hours remain.
                                    </Form.Text>
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
                                                value={workingHours.start}
                                                onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={workingHours.end}
                                                onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Text className="text-muted">
                                    This applies to new staff members by default.
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
