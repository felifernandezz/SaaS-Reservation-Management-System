import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface ThemeConfig {
    id: number;
    name: string;
    primaryColor: string;
    logoUrl: string;
}

const ThemeContext = createContext<ThemeConfig | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeConfig | null>(null);

    useEffect(() => {
        const loadTheme = async () => {
            // Lógica para detectar tenant:
            // 1. Subdominio (gym.saas.com)
            // 2. Query Param (?tenant=gym) <- Usaremos este para Dev
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('tenant') || 'demo';

            try {
                const { data } = await axios.get(`/api/v1/tenants/config?slug=${slug}`);

                setTheme({
                    id: data.id,
                    name: data.name,
                    primaryColor: data.primary_color,
                    logoUrl: data.logo_url
                });

                // MAGIC: Inyectar variables CSS dinámicas
                document.documentElement.style.setProperty('--bs-primary', data.primary_color);
                // También el color del botón, bordes, etc.
                document.documentElement.style.setProperty('--primary-color', data.primary_color);

                // Cambiar título de la pestaña
                document.title = data.title;

            } catch (e) {
                console.error("Error loading theme", e);
                // Fallback safe
                setTheme({
                    id: 1,
                    name: "Demo",
                    primaryColor: "#0d6efd",
                    logoUrl: ""
                });
            }
        };
        loadTheme();
    }, []);

    if (!theme) return <div className="d-flex justify-content-center align-items-center vh-100">Cargando experiencia personalizada...</div>;

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
