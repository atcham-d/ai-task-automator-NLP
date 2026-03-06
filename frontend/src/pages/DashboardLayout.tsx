import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout: React.FC = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main
                style={{
                    marginLeft: '240px',
                    flex: 1,
                    padding: '32px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Outlet />
            </main>
        </div>
    );
};
