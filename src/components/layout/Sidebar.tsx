import { CURRENT_USER } from '../../data/mockData';

type View = 'dashboard' | 'process-board' | 'new-process' | 'people' | 'forms' | 'analytics';

interface Props {
  currentView: View;
  onViewChange: (v: View) => void;
  collapsed: boolean;
}

const NAV = [
  {
    section: 'Processi Contratti',
    items: [
      { id: 'dashboard',     label: 'Dashboard',        icon: 'bi-grid-1x2-fill' },
      { id: 'process-board', label: 'Tutti i Processi', icon: 'bi-kanban-fill',   badge: '6' },
      { id: 'new-process',   label: 'Nuovo Processo',   icon: 'bi-plus-circle-fill' },
    ],
  },
  {
    section: 'Risorse',
    items: [
      { id: 'people',    label: 'Rubrica CMCC',  icon: 'bi-people-fill' },
      { id: 'forms',     label: 'Moduli',        icon: 'bi-file-earmark-text-fill' },
    ],
  },
  {
    section: 'Reportistica',
    items: [
      { id: 'analytics', label: 'Analytics',     icon: 'bi-bar-chart-fill', badge: 'WIP' },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  gru: 'GRU — HR Team',
  rs: 'Resp. Struttura',
  direttore: 'Direttore',
  amm: 'Amministrazione',
};

export function Sidebar({ currentView, onViewChange, collapsed }: Props) {
  const initials = CURRENT_USER.name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">H</div>
        {!collapsed && (
          <div className="brand-text">
            <div className="brand-name">Helios HR</div>
            <div className="brand-sub">Fondazione CMCC</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.section} style={{ marginBottom: 12 }}>
            {!collapsed && (
              <div className="nav-section-label">{section.section}</div>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                className={`nav-item${currentView === item.id ? ' active' : ''}`}
                onClick={() => onViewChange(item.id as View)}
                title={collapsed ? item.label : undefined}
              >
                <i className={`nav-icon ${item.icon}`} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div className="user-name">{CURRENT_USER.name}</div>
              <div className="user-role">{ROLE_LABELS[CURRENT_USER.role]}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
