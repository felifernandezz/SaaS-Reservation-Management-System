import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

interface GuestData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface Props {
    data: GuestData;
    onChange: (data: GuestData) => void;
}

const GuestDetails: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <Form>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="firstName"
                            value={data.firstName}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="lastName"
                            value={data.lastName}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                    type="tel"
                    name="phone"
                    value={data.phone}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
        </Form>
    );
};

export default GuestDetails;
