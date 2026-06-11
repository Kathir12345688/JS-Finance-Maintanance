import { NavLink } from 'react-router-dom';

export default function WorkerSidebar({ onNavigate, onLogout }) {
  const itemClass = ({ isActive }) =>
    `nav-link text-dark ${isActive ? 'fw-bold text-primary' : 'text-secondary'}`;

  return (
    <div className="worker-sidebar-menu d-flex flex-column h-100 p-3">
      <div className="mb-4">
        <h5 className="mb-1">Worker Panel</h5>
        <p className="text-muted mb-0">My assigned work</p>
      </div>

      <nav className="nav nav-pills flex-column gap-2">
        <NavLink to="/worker/dashboard" className={itemClass} onClick={onNavigate}>
          Dashboard
        </NavLink>
        <NavLink to="/worker/customers" className={itemClass} onClick={onNavigate}>
          Customers
        </NavLink>
        <NavLink to="/worker/payments" className={itemClass} onClick={onNavigate}>
          Payments
        </NavLink>
        <NavLink to="/worker/history" className={itemClass} onClick={onNavigate}>
          History
        </NavLink>
      </nav>

      <div className="mt-auto pt-4">
        <button type="button" className="btn btn-danger w-100" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
