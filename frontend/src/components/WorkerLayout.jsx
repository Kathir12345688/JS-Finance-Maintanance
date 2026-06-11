import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkerSidebar from './WorkerSidebar';
import TopNavbar from './TopNavbar';

export default function WorkerLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/auth/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="worker-layout">
      <TopNavbar onToggleSidebar={() => setSidebarOpen(true)} user={user} />

      <div className="d-flex position-relative">
        <aside className={`worker-sidebar bg-white border-end ${sidebarOpen ? 'open' : ''}`}>
          <WorkerSidebar onNavigate={closeSidebar} onLogout={handleLogout} />
        </aside>

        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={closeSidebar}
        />

        <main className="worker-content flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
