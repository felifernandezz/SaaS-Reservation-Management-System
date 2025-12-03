import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

interface Props {
    serviceName: string;
    date: string;
    time: string;
    guestName: string;
    guestEmail: string;
}

const Confirmation: React.FC<Props> = ({ serviceName, date, time, guestName, guestEmail }) => {
    return (
        <div className="text-center">
            <h4 className="mb-4 text-success">Almost there!</h4>
            <p className="text-muted mb-4">Please review your booking details before confirming.</p>

            <Card className="shadow-sm mx-auto text-start" style={{ maxWidth: '500px' }}>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <strong>Service:</strong> <span className="float-end">{serviceName}</span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Date:</strong> <span className="float-end">{date}</span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Time:</strong> <span className="float-end">{time}</span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Guest:</strong> <span className="float-end">{guestName}</span>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Email:</strong> <span className="float-end">{guestEmail}</span>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </div>
    );
};

export default Confirmation;
