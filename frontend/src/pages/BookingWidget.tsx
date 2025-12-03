import React, { useState } from 'react';
import { Card, ProgressBar, Button, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ServiceSelection from '../components/booking/ServiceSelection';
import DateTimeSelection from '../components/booking/DateTimeSelection';
import GuestDetails from '../components/booking/GuestDetails';
import Confirmation from '../components/booking/Confirmation';

// Steps Enum
enum BookingStep {
    SERVICE_SELECTION = 1,
    DATE_TIME_SELECTION = 2,
    GUEST_DETAILS = 3,
    CONFIRMATION = 4
}

const BookingWidget: React.FC = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState<BookingStep>(BookingStep.SERVICE_SELECTION);
    const [progress, setProgress] = useState(25);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedServiceName, setSelectedServiceName] = useState<string>(''); // Store name for confirmation
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string, time: string } | null>(null);
    const [guestData, setGuestData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleServiceSelect = (service: any) => {
        setSelectedServiceId(service.id);
        setSelectedServiceName(service.name);
        nextStep();
    };

    const handleDateTimeSelect = (date: string, time: string) => {
        setSelectedDateTime({ date, time });
        // Don't auto advance, let user click Next
    };

    const nextStep = () => {
        if (step < BookingStep.CONFIRMATION) {
            setStep(step + 1);
            setProgress((step + 1) * 25);
        }
    };

    const prevStep = () => {
        if (step > BookingStep.SERVICE_SELECTION) {
            setStep(step - 1);
            setProgress((step - 1) * 25);
        }
    };

    const handleConfirm = async () => {
        if (!selectedServiceId || !selectedDateTime) return;

        setLoading(true);
        setError(null);

        try {
            const payload = {
                service_id: selectedServiceId,
                start_time: `${selectedDateTime.date}T${selectedDateTime.time}:00`, // ISO Format
                guest_data: {
                    full_name: `${guestData.firstName} ${guestData.lastName}`,
                    email: guestData.email,
                    phone: guestData.phone
                }
            };

            const TENANT_ID_DEMO = 1;
            const response = await axios.post(`/api/v1/appointments/?tenant_id=${TENANT_ID_DEMO}`, payload);

            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                setSuccess(true);
                setLoading(false);
            }
        } catch (err) {
            console.error("Booking Error", err);
            setError("Failed to book appointment. Please try again.");
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case BookingStep.SERVICE_SELECTION:
                return <ServiceSelection onSelect={handleServiceSelect} />;
            case BookingStep.DATE_TIME_SELECTION:
                return selectedServiceId ? (
                    <DateTimeSelection
                        serviceId={selectedServiceId}
                        onSelect={handleDateTimeSelect}
                    />
                ) : null;
            case BookingStep.GUEST_DETAILS:
                return <GuestDetails data={guestData} onChange={setGuestData} />;
            case BookingStep.CONFIRMATION:
                return (
                    <Confirmation
                        serviceName={selectedServiceName}
                        date={selectedDateTime?.date || ''}
                        time={selectedDateTime?.time || ''}
                        guestName={`${guestData.firstName} ${guestData.lastName}`}
                        guestEmail={guestData.email}
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
                            <h2 className="text-success mb-3">Booking Confirmed!</h2>
                            <p>Thank you, {guestData.firstName}. Your appointment has been scheduled.</p>
                            <Button variant="primary" onClick={() => window.location.reload()}>Book Another</Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-center mb-4 fw-bold text-dark">
                                {step === BookingStep.SERVICE_SELECTION && t('booking.select_service')}
                                {step === BookingStep.DATE_TIME_SELECTION && t('booking.select_time')}
                                {step === BookingStep.GUEST_DETAILS && t('booking.your_details')}
                                {step === BookingStep.CONFIRMATION && t('booking.confirmation')}
                            </h2>

                            {renderStepContent()}

                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    variant="outline-secondary"
                                    onClick={prevStep}
                                    disabled={step === BookingStep.SERVICE_SELECTION}
                                >
                                    {t('common.back')}
                                </Button>

                                {step < BookingStep.CONFIRMATION ? (
                                    <Button variant="primary" onClick={nextStep}>
                                        {t('common.next')}
                                    </Button>
                                ) : (
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
