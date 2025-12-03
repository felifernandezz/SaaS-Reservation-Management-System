import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Card, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getAppointments } from '../services/calendar';

import 'moment/locale/es'; // Import Spanish locale

// Setup the localizer by providing the moment (or globalize, or Date) Object
moment.locale('es'); // Set default locale to Spanish
const localizer = momentLocalizer(moment);

const CalendarView: React.FC = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAppointments();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="p-4" style={{ height: '90vh' }}>
            <h2 className="mb-4 text-dark fw-bold">{t('nav.calendar')}</h2>
            <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        defaultView={Views.WEEK}
                        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                        defaultDate={new Date(2025, 11, 3)} // Set to Dec 2025 for demo
                        min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
                        max={new Date(0, 0, 0, 20, 0, 0)} // 8 PM
                    />
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CalendarView;
