import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

const GuestLayout: React.FC = () => {
    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            {/* Simple Header */}
            <header className="bg-white shadow-sm py-3 mb-4">
                <Container>
                    <h4 className="mb-0 text-primary fw-bold">SaaS Reserva</h4>
                </Container>
            </header>

            {/* Main Content */}
            <main className="flex-grow-1">
                <Container>
                    <Outlet />
                </Container>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white py-3 mt-auto text-center text-muted">
                <small>&copy; 2025 SaaS Reserva. All rights reserved.</small>
            </footer>
        </div>
    );
};

export default GuestLayout;
