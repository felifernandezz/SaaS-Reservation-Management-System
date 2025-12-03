import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ServiceSelection from '../components/booking/ServiceSelection';
import DateTimeSelection from '../components/booking/DateTimeSelection';
import GuestDetails from '../components/booking/GuestDetails';
import Confirmation from '../components/booking/Confirmation';
import { useTheme } from '../context/ThemeContext';

// Steps Enum
enum BookingStep {
    USER_TYPE_SELECTION = 0,
    SERVICE_SELECTION = 1,
    STAFF_SELECTION = 2,
    DATE_TIME_SELECTION = 3,
    GUEST_DETAILS = 4,
    CONFIRMATION = 5
}

const BookingWidget: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();

    const [step, setStep] = useState<BookingStep>(BookingStep.USER_TYPE_SELECTION);
    const [progress, setProgress] = useState(10);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedServiceName, setSelectedServiceName] = useState<string>('');
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null); // New
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string, time: string } | null>(null);
    const [guestData, setGuestData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        // Check if already logged in
        const token = localStorage.getItem('customer_token');
        if (token) {
            setIsMember(true);
            setStep(BookingStep.SERVICE_SELECTION); // Skip user type selection
        }
    }, []);

    const handleServiceSelect = (service: any) => {
        setSelectedServiceId(service.id);
        setSelectedServiceName(service.name);
        nextStep();
    };

    const handleStaffSelect = (staffId: number | null) => {
        setSelectedStaffId(staffId);
        nextStep();
    }

    const handleDateTimeSelect = (date: string, time: string) => {
        setSelectedDateTime({ date, time });
    };

    const nextStep = () => {
        if (step < BookingStep.CONFIRMATION) {
            setStep(step + 1);
            setProgress((step + 1) * 20);
        }
    };

    const prevStep = () => {
        if (step > BookingStep.USER_TYPE_SELECTION) {
            setStep(step - 1);
            setProgress((step - 1) * 20);
        }
    };

    const handleConfirm = async () => {
        if (!selectedServiceId || !selectedDateTime) return;

        setLoading(true);
        setError(null);

        try {
            const payload: any = {
                service_id: selectedServiceId,
                start_time: `${selectedDateTime.date}T${selectedDateTime.time}:00`,
                staff_id: selectedStaffId // Optional
            };

            if (isMember) {
                // Get customer ID from token (backend should handle this via /me or we decode here)
                // For now, let's fetch /me to get ID or send token in header
                const token = localStorage.getItem('customer_token');
                const meResponse = await axios.get('/api/v1/auth/customer/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                payload.customer_id = meResponse.data.id;
            } else {
                payload.guest_data = {
                    full_name: `${guestData.firstName} ${guestData.lastName}`,
                    email: guestData.email,
                    phone: guestData.phone
                };
            }

            const response = await axios.post(`/api/v1/appointments/?tenant_id=${theme?.id || 1}`, payload);

            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                setSuccess(true);
                setLoading(false);
            }
        } catch (err: any) {
            console.error("Booking Error", err);
            setError(err.response?.data?.detail || t('booking.error_booking'));
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case BookingStep.USER_TYPE_SELECTION:
                return (
                    <div className="text-center">
                        <h3 className="mb-4">Welcome! How would you like to book?</h3>
                        <Row className="g-4 justify-content-center">
                            <Col md={5}>
                                <Card className="h-100 shadow-sm hover-card" onClick={() => { setIsMember(true); navigate('/portal/login'); }} style={{ cursor: 'pointer' }}>
                                    <Card.Body className="d-flex flex-column justify-content-center align-items-center p-5">
                                        <h4>Member Login</h4>
                                        <p className="text-muted">Use your class credits</p>
                                        <Button variant="outline-primary">Login</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={5}>
                                <Card className="h-100 shadow-sm hover-card" onClick={() => { setIsMember(false); nextStep(); }} style={{ cursor: 'pointer' }}>
                                    <Card.Body className="d-flex flex-column justify-content-center align-items-center p-5">
                                        <h4>New Guest</h4>
                                        <p className="text-muted">Book a single session</p>
                                        <Button variant="primary">Continue as Guest</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                );
            case BookingStep.SERVICE_SELECTION:
                return <ServiceSelection onSelect={handleServiceSelect} />;
            case BookingStep.STAFF_SELECTION:
                // Placeholder for Staff Selection Component
                // For now, auto-skip or simple list
                return (
                    <div className="text-center">
                        <h4>Select a Trainer (Optional)</h4>
                        <Button variant="outline-secondary" className="m-2" onClick={() => handleStaffSelect(null)}>Any Trainer</Button>
                        {/* TODO: Fetch staff list */}
                    </div>
                );
            case BookingStep.DATE_TIME_SELECTION:
                return selectedServiceId ? (
                    <DateTimeSelection
                        serviceId={selectedServiceId}
                        onSelect={handleDateTimeSelect}
                    />
                ) : null;
            case BookingStep.GUEST_DETAILS:
                if (isMember) {
                    nextStep(); // Skip if member
                    return null;
                }
                return <GuestDetails data={guestData} onChange={setGuestData} />;
            case BookingStep.CONFIRMATION:
                return (
                    <Confirmation
                        serviceName={selectedServiceName}
                        date={selectedDateTime?.date || ''}
                        time={selectedDateTime?.time || ''}
                        guestName={isMember ? "Member" : `${guestData.firstName} ${guestData.lastName}`}
                        guestEmail={isMember ? "Logged In" : guestData.email}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Card className="shadow-lg border-0 mx-auto" style={{ maxWidth: '800px' }}>
            <Card.Body className="p-0">
                <ProgressBar now={progress} variant="success" style={{ height: '5px' }} />

                <div className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}

                    {success ? (
                        <div className="text-center py-5">
                            <h2 className="text-success mb-3">{t('booking.booking_confirmed')}</h2>
                            <p>{t('booking.thank_you', { name: isMember ? "Member" : guestData.firstName })}</p>
                            <Button variant="primary" onClick={() => window.location.reload()}>{t('booking.book_another')}</Button>
                        </div>
                    ) : (
                        <>
                            {step !== BookingStep.USER_TYPE_SELECTION && (
                                <h2 className="text-center mb-4 fw-bold text-dark">
                                    {step === BookingStep.SERVICE_SELECTION && t('booking.select_service')}
                                    {step === BookingStep.STAFF_SELECTION && "Select Trainer"}
                                    {step === BookingStep.DATE_TIME_SELECTION && t('booking.select_time')}
                                    {step === BookingStep.GUEST_DETAILS && t('booking.your_details')}
                                    {step === BookingStep.CONFIRMATION && t('booking.confirmation')}
                                </h2>
                            )}

                            {renderStepContent()}

                            <div className="d-flex justify-content-between mt-4">
                                {step > BookingStep.USER_TYPE_SELECTION && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={prevStep}
                                        disabled={step === BookingStep.SERVICE_SELECTION && isMember} // Disable back if member started at service
                                    >
                                        {t('common.back')}
                                    </Button>
                                )}

                                {step > BookingStep.USER_TYPE_SELECTION && step < BookingStep.CONFIRMATION && (
                                    <Button variant="primary" onClick={nextStep}>
                                        {t('common.next')}
                                    </Button>
                                )}

                                {step === BookingStep.CONFIRMATION && (
                                    <Button variant="success" onClick={handleConfirm} disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : t('common.confirm')}
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default BookingWidget;
