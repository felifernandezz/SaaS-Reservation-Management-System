import { Appointment } from '../types/appointment';

// Mock Appointments
const MOCK_APPOINTMENTS = [
    {
        id: 1,
        title: 'Corte de Pelo - Juan Perez',
        start: new Date(2025, 11, 3, 10, 0), // Dec 3, 2025 10:00
        end: new Date(2025, 11, 3, 10, 30),
        resourceId: 1, // Staff ID
    },
    {
        id: 2,
        title: 'Coloración - Maria Gomez',
        start: new Date(2025, 11, 3, 11, 0),
        end: new Date(2025, 11, 3, 12, 30),
        resourceId: 1,
    }
];

export const getAppointments = async (): Promise<any[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_APPOINTMENTS);
        }, 500);
    });
};
