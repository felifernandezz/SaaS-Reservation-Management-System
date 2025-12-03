import { Nav, Image } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHome, FaCalendarAlt, FaCog, FaUsers, FaCut } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', minHeight: '100vh' }}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                {theme?.logoUrl ? (
                    <Image src={theme.logoUrl} alt={theme.name} height="40" className="me-2" />
                ) : null}
                <span className="fs-4">{theme?.name || 'SaaS Admin'}</span>
            </a>
            <hr />
            <Nav className="flex-column mb-auto" variant="pills">
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/dashboard" className="text-white">
                        <FaHome className="me-2" /> {t('nav.dashboard')}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/calendar" className="text-white">
                        <FaCalendarAlt className="me-2" /> {t('nav.calendar')}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/services" className="text-white">
                        <FaCut className="me-2" /> {t('nav.services')}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/staff" className="text-white">
                        <FaUsers className="me-2" /> {t('nav.staff')}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/settings" className="text-white">
                        <FaCog className="me-2" /> {t('nav.settings')}
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <hr />
        </div>
    );
};

export default Sidebar;
