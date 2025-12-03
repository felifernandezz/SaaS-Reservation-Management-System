import axios from 'axios';

// Define types for Dashboard Stats
export interface DashboardStats {
    totalAppointmentsToday: number;
    totalRevenueToday: number;
    activeStaff: number;
    pendingConfirmations: number;
}

// Mock Data for now
const MOCK_STATS: DashboardStats = {
    totalAppointmentsToday: 12,
    totalRevenueToday: 15000, // ARS
    activeStaff: 3,
    pendingConfirmations: 2
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    // In the future, this will be:
    // const response = await axios.get('/api/v1/stats/dashboard');
    // return response.data;

    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_STATS);
        }, 800);
    });
};
