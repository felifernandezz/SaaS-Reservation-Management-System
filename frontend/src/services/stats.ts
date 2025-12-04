import axios from 'axios';

// Define types for Dashboard Stats
export interface DashboardStats {
    totalAppointmentsToday: number;
    totalRevenueToday: number;
    activeStaff: number;
    pendingConfirmations: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/v1/stats/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
