import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Card, Spinner, Modal, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getAppointments } from '../services/calendar';
import axios from 'axios';

import 'moment/locale/es'; // Import Spanish locale
import CreateAppointmentModal from '../components/calendar/CreateAppointmentModal';

// Setup the localizer by providing the moment (or globalize, or Date) Object
moment.locale('es'); // Set default locale to Spanish
const localizer = momentLocalizer(moment);

const CalendarView: React.FC = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [workingHours, setWorkingHours] = useState({ start: new Date(0, 0, 0, 8, 0, 0), end: new Date(0, 0, 0, 20, 0, 0) });

    // Modal State
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAppointmentStart, setNewAppointmentStart] = useState<Date | null>(null);
    const [newAppointmentEnd, setNewAppointmentEnd] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            const [appointments, config] = await Promise.all([
                getAppointments(),
                axios.get('/api/v1/tenants/config')
            ]);

            setEvents(appointments);

            if (config.data.working_hours_start && config.data.working_hours_end) {
                const [startHour, startMinute] = config.data.working_hours_start.split(':').map(Number);
                const [endHour, endMinute] = config.data.working_hours_end.split(':').map(Number);

                setWorkingHours({
                    start: new Date(0, 0, 0, startHour, startMinute, 0),
                    end: new Date(0, 0, 0, endHour, endMinute, 0)
                });
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const handleCancelAppointment = async () => {
        if (!selectedEvent) return;
        if (window.confirm("¿Seguro que deseas cancelar este turno?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/v1/appointments/${selectedEvent.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShowModal(false);
                fetchData(); // Refresh
            } catch (error: any) {
                alert(error.response?.data?.detail || "Error al cancelar");
            }
        }
    };

    const eventStyleGetter = (event: any, start: any, end: any, isSelected: boolean) => {
        const style = {
            backgroundColor: isSelected ? '#0a58ca' : '#3788d8',
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '1px solid white', // Add border to distinguish overlapping events
            display: 'block',
            fontSize: '0.85em' // Smaller font
        };
        return { style };
    };

    const CustomEvent = ({ event }: any) => (
        <div title={event.title}>
            <strong>{event.title}</strong>
            {/* Hide details if too small, or just show minimal info */}
        </div>
    );

    const handleSelectSlot = ({ start, end }: any) => {
        setNewAppointmentStart(start);
        setNewAppointmentEnd(end);
        setShowCreateModal(true);
    };



    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4 text-dark fw-bold">{t('nav.calendar')}</h2>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '1200px' }}
                        defaultView={Views.WEEK}
                        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                        defaultDate={new Date()}
                        min={workingHours.start}
                        max={workingHours.end}
                        step={30}
                        timeslots={2}
                        selectable
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        eventPropGetter={eventStyleGetter}
                        components={{
                            event: CustomEvent
                        }}
                    />
                </Card.Body>
            </Card>

            {/* Event Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Turno</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent && (
                        <div>
                            <h5>{selectedEvent.title}</h5>
                            <p>
                                <strong>Inicio:</strong> {moment(selectedEvent.start).format('LT')} <br />
                                <strong>Fin:</strong> {moment(selectedEvent.end).format('LT')}
                            </p>
                            <p><strong>Estado:</strong> {selectedEvent.status}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleCancelAppointment}>
                        Cancelar Turno
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Appointment Modal (Placeholder) */}
            {/* Create Appointment Modal */}
            <CreateAppointmentModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                start={newAppointmentStart}
                end={newAppointmentEnd}
                onSuccess={() => {
                    fetchData();
                    // Optional: Show success toast
                }}
            />

        </Container>
    );
};

export default CalendarView;
