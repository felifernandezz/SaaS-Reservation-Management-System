import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Services from './pages/Services';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import GuestLayout from './layouts/GuestLayout';
import BookingWidget from './pages/BookingWidget';
import BookingSuccess from './pages/BookingSuccess';
import BookingFailure from './pages/BookingFailure';
import MockPayment from './pages/MockPayment';
import ClientLogin from './pages/portal/ClientLogin';
import ClientRegister from './pages/portal/ClientRegister';
import ClientDashboard from './pages/portal/ClientDashboard';
import BuyPlan from './pages/portal/BuyPlan';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="calendar" element={<Calendar />} />
                        <Route path="services" element={<Services />} />
                        <Route path="staff" element={<Staff />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* Public Guest Routes */}
                <Route path="/book" element={<GuestLayout />}>
                    <Route index element={<BookingWidget />} />
                    <Route path="success" element={<BookingSuccess />} />
                    <Route path="failure" element={<BookingFailure />} />
                </Route>

                {/* Client Portal Routes */}
                <Route path="/portal">
                    <Route path="login" element={<ClientLogin />} />
                    <Route path="register" element={<ClientRegister />} />
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="buy-plan" element={<BuyPlan />} />
                </Route>

                <Route path="/pay-mock/:id" element={<MockPayment />} />

                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
