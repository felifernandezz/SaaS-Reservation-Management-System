import axios from 'axios';

export const getAppointments = async (): Promise<any[]> => {
    try {
        // TODO: Obtener tenant_id dinámicamente del contexto/auth
        const TENANT_ID = 1;

        const response = await axios.get(`/api/v1/appointments/`, {
            params: { tenant_id: TENANT_ID }
        });

        // Mapeo para React-Big-Calendar
        return response.data.map((appt: any) => ({
            id: appt.id,
            title: `${appt.service?.name || 'Servicio'} - ${appt.customer?.full_name || 'Cliente'}`,
            start: new Date(appt.start_time), // ISO a Date Obj
            end: new Date(appt.end_time),
            resourceId: appt.staff_id,
            status: appt.status
        }));
    } catch (error) {
        console.error("Error loading appointments from API", error);
        return [];
    }
};
