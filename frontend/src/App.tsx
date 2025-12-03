import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import GuestLayout from './layouts/GuestLayout';
import BookingWidget from './pages/BookingWidget';
import BookingSuccess from './pages/BookingSuccess';
import BookingFailure from './pages/BookingFailure';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="settings" element={<Settings />} />
                </Route>

                {/* Public Guest Routes */}
                <Route path="/book" element={<GuestLayout />}>
                    <Route index element={<BookingWidget />} />
                    <Route path="success" element={<BookingSuccess />} />
                    <Route path="failure" element={<BookingFailure />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
