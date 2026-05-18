import { MOCK_PROCESSES, STATUS_CONFIG, OPERATION_LABELS, CONTRACT_TYPE_LABELS } from '../../data/mockData';
import { StatusBadge } from '../ui/StatusBadge';
import type { ContractProcess } from '../../types';

interface Props {
  onViewProcess: (id: string) => void;
  onNewProcess: () => void;
  onViewAll: () => void;
}

const AVATAR_COLORS = ['#295fa9','#059669','#7c3aed','#dc2626','#d97706','#0891b2','#0f766e'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

const KANBAN_COLS = [
  { key: 'bozza',            label: 'Bozza',              color: '#64748b' },
  { key: 'approvazione-rs',  label: 'Approv. RS',         color: '#d97706' },
  { key: 'approvazione-dir', label: 'Approv. Dir.',       color: '#7c3aed' },
  { key: 'verifica-gru',     label: 'GRU',                color: '#1d4ed8' },
  { key: 'contratto-firma',  label: 'Firma',              color: '#b45309' },
  { key: 'anagrafica',       label: 'Anagrafica',         color: '#0f766e' },
  { key: 'zucchetti',        label: 'Zucchetti',          color: '#4338ca' },
  { key: 'completato',       label: 'Completato',         color: '#16a34a' },
];

export function Dashboard({ onViewProcess, onNewProcess, onViewAll }: Props) {
  const active    = MOCK_PROCESSES.filter(p => !['completato','annullato','respinto'].includes(p.status)).length;
  const pending   = MOCK_PROCESSES.filter(p => ['approvazione-rs','approvazione-dir'].includes(p.status)).length;
  const inGru     = MOCK_PROCESSES.filter(p => ['verifica-gru','elaborazione-gru'].includes(p.status)).length;
  const completed = MOCK_PROCESSES.filter(p => p.status === 'completato').length;
  const urgent    = MOCK_PROCESSES.filter(p => p.isUrgent && !['completato','annullato'].includes(p.status)).length;

  // Contract type distribution
  const byType: Record<string, number> = {};
  MOCK_PROCESSES.forEach(p => {
    if (p.contractType) byType[p.contractType] = (byType[p.contractType] ?? 0) + 1;
  });

  // Unit distribution
  const byUnit: Record<string, number> = {};
  MOCK_PROCESSES.forEach(p => { byUnit[p.unitCode] = (byUnit[p.unitCode] ?? 0) + 1; });
  const unitEntries = Object.entries(byUnit).sort((a, b) => b[1] - a[1]);
  const maxUnit = Math.max(...unitEntries.map(([, v]) => v));

  const recent = [...MOCK_PROCESSES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#dbeafe' }}>
            <i className="bi bi-file-earmark-text-fill" style={{ color: '#1d4ed8' }} />
          </div>
          <div className="kpi-body">
            <div className="kpi-value">{active}</div>
            <div className="kpi-label">Processi Attivi</div>
            <div className="kpi-delta up"><i className="bi bi-arrow-up-short" />+2 questo mese</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fef3c7' }}>
            <i className="bi bi-hourglass-split" style={{ color: '#d97706' }} />
          </div>
          <div className="kpi-body">
            <div className="kpi-value">{pending}</div>
            <div className="kpi-label">In Attesa Approvazione</div>
            {urgent > 0 && (
              <div className="kpi-delta down"><i className="bi bi-exclamation-triangle-fill" /> {urgent} urgenti</div>
            )}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#e0e7ff' }}>
            <i className="bi bi-clipboard-check-fill" style={{ color: '#4338ca' }} />
          </div>
          <div className="kpi-body">
            <div className="kpi-value">{inGru}</div>
            <div className="kpi-label">In Verifica GRU</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#dcfce7' }}>
            <i className="bi bi-check-circle-fill" style={{ color: '#16a34a' }} />
          </div>
          <div className="kpi-body">
            <div className="kpi-value">{completed}</div>
            <div className="kpi-label">Completati</div>
            <div className="kpi-delta up"><i className="bi bi-arrow-up-short" />+1 questo mese</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Activity */}
        <div className="col-lg-8">
          <div className="card-cmcc p-0 overflow-hidden">
            <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderBottom: '1px solid var(--cmcc-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Processi Recenti</div>
                <div style={{ fontSize: 12, color: 'var(--cmcc-text-muted)' }}>Aggiornati di recente</div>
              </div>
              <button className="btn btn-cmcc-secondary btn-sm" onClick={onViewAll}>
                <i className="bi bi-arrow-right me-1" />Vedi tutti
              </button>
            </div>
            <div>
              {recent.map((p, i) => (
                <ProcessRow key={p.id} process={p} onView={() => onViewProcess(p.id)} isLast={i === recent.length - 1} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-4">
          {/* Quick Actions */}
          <div className="card-cmcc p-4 mb-4">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Azioni Rapide</div>
            <div className="d-flex flex-column gap-2">
              <button className="btn btn-cmcc-primary w-100 text-start" onClick={onNewProcess}>
                <i className="bi bi-plus-circle me-2" />Nuovo Processo Contratto
              </button>
              <button className="btn btn-cmcc-secondary w-100 text-start" onClick={onViewAll}>
                <i className="bi bi-kanban me-2" />Vedi Board Processi
              </button>
              <button className="btn btn-cmcc-ghost w-100 text-start">
                <i className="bi bi-download me-2" />Esporta Report
              </button>
            </div>
          </div>

          {/* By Unit */}
          <div className="card-cmcc p-4 mb-4">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Processi per Unità</div>
            {unitEntries.map(([unit, count]) => (
              <div key={unit} className="mb-3">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
                  <span>{unit}</span>
                  <span style={{ color: 'var(--cmcc-blue)' }}>{count}</span>
                </div>
                <div className="progress-bar-cmcc">
                  <div className="progress-fill" style={{ width: `${(count / maxUnit) * 100}%`, background: 'var(--cmcc-blue)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* By Contract Type */}
          <div className="card-cmcc p-4">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Tipo Contratto</div>
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cmcc-blue)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{CONTRACT_TYPE_LABELS[type] ?? type}</span>
                <span style={{ fontWeight: 700, color: 'var(--cmcc-blue)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Flow Overview */}
      <div className="card-cmcc p-4 mt-4">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          <i className="bi bi-diagram-3 me-2 text-cmcc-blue" />Stato Pipeline Processi
        </div>
        <div className="d-flex gap-3 overflow-auto pb-1">
          {KANBAN_COLS.map(col => {
            const count = MOCK_PROCESSES.filter(p => p.status === col.key).length;
            return (
              <div key={col.key} className="text-center" style={{ minWidth: 80 }}>
                <div style={{
                  fontSize: 22, fontWeight: 700,
                  color: count > 0 ? col.color : 'var(--cmcc-border)',
                  lineHeight: 1,
                }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--cmcc-text-muted)', marginTop: 4, fontWeight: 500, lineHeight: 1.3 }}>{col.label}</div>
                <div style={{ height: 3, background: count > 0 ? col.color : 'var(--cmcc-border)', borderRadius: 2, marginTop: 8 }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProcessRow({ process, onView, isLast }: { process: ContractProcess; onView: () => void; isLast: boolean }) {
  const name = process.isNewResource
    ? (process.newResourceName ?? 'Nuova risorsa')
    : (process.resource?.fullName ?? '—');
  const color = avatarColor(name);
  const ini   = initials(name);

  return (
    <div
      className="d-flex align-items-center gap-3 px-4 py-3"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--cmcc-border)', cursor: 'pointer', transition: 'background .15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
      onClick={onView}
    >
      <div className="resource-avatar" style={{ background: color, width: 36, height: 36, fontSize: 12 }}>{ini}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--cmcc-text-muted)' }}>
          {OPERATION_LABELS[process.operationType]} · {process.unitCode} · {process.id}
        </div>
      </div>
      <div className="d-none d-md-block">
        <StatusBadge status={process.status} size="sm" />
      </div>
      {process.isUrgent && (
        <span style={{ fontSize: 12, color: '#d97706' }} title="Urgente">
          <i className="bi bi-exclamation-triangle-fill" />
        </span>
      )}
      <div style={{ fontSize: 11, color: 'var(--cmcc-text-muted)', width: 80, textAlign: 'right', flexShrink: 0 }}>
        {new Date(process.updatedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
      </div>
      <i className="bi bi-chevron-right" style={{ color: 'var(--cmcc-text-muted)', fontSize: 12 }} />
    </div>
  );
}
