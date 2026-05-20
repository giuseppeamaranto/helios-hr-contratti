import { CURRENT_USER } from '../../data/mockData';
import type { UserRole } from '../../types';

type View = 'dashboard' | 'process-board' | 'wizard-entry' | 'new-process' | 'people' | 'forms' | 'analytics';

interface Props {
  currentView: View;
  collapsed: boolean;
  onToggle: () => void;
  onRoleChange: (r: UserRole) => void;
  currentRole: UserRole;
  processId?: string;
  onDashboard: () => void;
}

const VIEW_LABELS: Record<View, string> = {
  'dashboard':     'Dashboard',
  'process-board': 'Tutti i Processi',
  'wizard-entry':  'Nuovo Processo',
  'new-process':   'Nuovo Processo',
  'people':        'Rubrica CMCC',
  'forms':         'Moduli HR',
  'analytics':     'Analytics',
};

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
  gru:        { label: 'HR Admin',       color: '#1d4ed8', bg: '#dbeafe' },
  rs:         { label: 'Resp. Struttura',color: '#92400e', bg: '#fef3c7' },
  direttore:  { label: 'Direttore',      color: '#6d28d9', bg: '#ede9fe' },
  amm:        { label: 'AMM',            color: '#065f46', bg: '#d1fae5' },
  presidente: { label: 'Presidente',     color: '#b45309', bg: '#fef3c7' },
  governance: { label: 'Governance',     color: '#a21caf', bg: '#fae8ff' },
  segreteria: { label: 'Segreteria',     color: '#9333ea', bg: '#f3e8ff' },
};

export function Header({ currentView, collapsed, onToggle, onRoleChange, currentRole, processId, onDashboard }: Props) {
  const today = new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const roleConf = ROLE_CONFIG[currentRole];

  return (
    <header className="app-header">
      <button className="header-toggle" onClick={onToggle}>
        <i className={collapsed ? 'bi bi-layout-sidebar-inset' : 'bi bi-layout-sidebar-inset-reverse'} />
      </button>

      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <span className="bc-link" onClick={onDashboard}>HR</span>
        <i className="bi bi-chevron-right bc-sep" />
        {processId ? (
          <>
            <span className="bc-link" onClick={onDashboard}>{VIEW_LABELS[currentView]}</span>
            <i className="bi bi-chevron-right bc-sep" />
            <span className="bc-current">{processId}</span>
          </>
        ) : (
          <span className="bc-current">{VIEW_LABELS[currentView]}</span>
        )}
      </nav>

      {/* Right section */}
      <div className="header-right">
        <span className="header-date d-none d-lg-block">{today}</span>

        {/* Role switcher */}
        <div className="dropdown">
          <button
            className="btn btn-sm"
            style={{ background: roleConf.bg, color: roleConf.color, border: 'none', fontWeight: 600, fontSize: 12 }}
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-person-badge me-1" />
            {roleConf.label} <i className="bi bi-chevron-down ms-1" style={{ fontSize: 10 }} />
          </button>
          <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: 13, minWidth: 180 }}>
            <li><span className="dropdown-item-text text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Simula ruolo</span></li>
            {(['gru', 'rs', 'direttore', 'governance', 'presidente', 'segreteria', 'amm'] as UserRole[]).map(r => (
              <li key={r}>
                <button className={`dropdown-item${currentRole === r ? ' active' : ''}`} onClick={() => onRoleChange(r)}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: ROLE_CONFIG[r].bg, color: ROLE_CONFIG[r].color, marginRight: 8 }}>
                    {ROLE_CONFIG[r].label}
                  </span>
                  {CURRENT_USER.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button className="notif-btn">
          <i className="bi bi-bell" />
          <span className="notif-dot" />
        </button>
      </div>
    </header>
  );
}
