import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const ClientLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/v1/auth/customer/login', {
                email,
                password,
                tenant_id: theme?.id || 1
            });

            localStorage.setItem('customer_token', response.data.access_token);
            navigate('/portal/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card style={{ width: '400px' }} className="shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4" style={{ color: theme?.primaryColor }}>{theme?.name}</h2>
                    <h4 className="text-center mb-4">Client Login</h4>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100" style={{ backgroundColor: theme?.primaryColor, borderColor: theme?.primaryColor }}>
                            Login
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <Link to="/portal/register">Create an account</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ClientLogin;
