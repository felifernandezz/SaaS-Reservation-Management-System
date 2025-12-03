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
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
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
