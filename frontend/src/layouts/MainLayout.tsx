import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Container, Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar Sticky Wrapper */}
            <div style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', zIndex: 1000 }}>
                <Sidebar />
            </div>
            
            {/* Main Content */}
            <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa', minWidth: 0 }}>
                <div className="d-flex justify-content-end mb-4">
                    <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={() => changeLanguage('es')} active={i18n.language === 'es'}>
                            ES
                        </Button>
                        <Button variant="outline-secondary" onClick={() => changeLanguage('en')} active={i18n.language === 'en'}>
                            EN
                        </Button>
                    </ButtonGroup>
                </div>
                <Container fluid>
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default MainLayout;