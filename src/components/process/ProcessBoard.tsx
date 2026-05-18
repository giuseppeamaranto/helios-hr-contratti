import { useState, useMemo } from 'react';
import type { ContractProcess, UserRole } from '../../types';
import { STATUS_CONFIG, OPERATION_LABELS, CONTRACT_TYPE_LABELS } from '../../data/mockData';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  processes: ContractProcess[];
  currentRole: UserRole;
  onViewProcess: (id: string) => void;
  onNewProcess: () => void;
}

const UNIT_FILTERS = ['Tutti', 'ICR', 'IESP', 'EIEE', 'IAFES', 'REMHI', 'ASC'];

const OPERATION_FILTERS: { key: string; label: string }[] = [
  { key: 'tutti',            label: 'Tutte le operazioni' },
  { key: 'nuova-assunzione', label: 'Nuova Assunzione' },
  { key: 'proroga',          label: 'Proroga' },
  { key: 'trasformazione',   label: 'Trasformazione' },
  { key: 'integrazione',     label: 'Integrazione' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('it-IT', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function getResourceName(p: ContractProcess): string {
  if (p.resource) return p.resource.fullName;
  if (p.newResourceName) return p.newResourceName;
  return '—';
}

function getUnitBadgeColor(unitCode: string): string {
  const map: Record<string, string> = {
    ICR: '#295fa9', IESP: '#059669', EIEE: '#7c3aed',
    IAFES: '#d97706', REMHI: '#dc2626', ASC: '#0891b2',
  };
  return map[unitCode] ?? '#64748b';
}

export function ProcessBoard({ processes, currentRole, onViewProcess, onNewProcess }: Props) {
  const [unitFilter, setUnitFilter]   = useState<string>('Tutti');
  const [opFilter, setOpFilter]       = useState<string>('tutti');
  const [searchText, setSearchText]   = useState<string>('');

  const filtered = useMemo(() => {
    let list = [...processes];

    if (unitFilter !== 'Tutti') {
      list = list.filter(p => p.unitCode === unitFilter);
    }

    if (opFilter !== 'tutti') {
      list = list.filter(p => p.operationType === opFilter);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(p =>
        p.id.toLowerCase().includes(q) ||
        getResourceName(p).toLowerCase().includes(q) ||
        p.unitName.toLowerCase().includes(q) ||
        p.projectName.toLowerCase().includes(q) ||
        (p.newResourceEmail ?? '').toLowerCase().includes(q) ||
        (p.resource?.email ?? '').toLowerCase().includes(q)
      );
    }

    // Sort by updatedAt descending
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return list;
  }, [processes, unitFilter, opFilter, searchText]);

  return (
    <div>
      {/* Page heading */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            <i className="bi bi-kanban me-2 text-cmcc-blue" />
            Board Processi Contratti
          </h1>
          <p className="page-subtitle">
            {filtered.length} processo{filtered.length !== 1 ? 'i' : ''} trovato{filtered.length !== 1 ? 'i' : ''}
            {processes.length !== filtered.length ? ` su ${processes.length} totali` : ''}
          </p>
        </div>
        <button className="btn btn-cmcc-primary" onClick={onNewProcess}>
          <i className="bi bi-plus-lg me-2" />
          Nuovo Processo
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-wrapper" style={{ flex: '0 0 240px' }}>
          <i className="bi bi-search" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Cerca ID, risorsa, progetto…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: '#e2e8f0', flexShrink: 0 }} />

        {/* Unit filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {UNIT_FILTERS.map(u => (
            <button
              key={u}
              className={`filter-chip${unitFilter === u ? ' active' : ''}`}
              onClick={() => setUnitFilter(u)}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: '#e2e8f0', flexShrink: 0 }} />

        {/* Operation filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {OPERATION_FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-chip${opFilter === f.key ? ' active' : ''}`}
              onClick={() => setOpFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clear button */}
        {(unitFilter !== 'Tutti' || opFilter !== 'tutti' || searchText) && (
          <button
            className="btn-cmcc-ghost btn ms-auto"
            style={{ padding: '4px 12px', fontSize: 12 }}
            onClick={() => { setUnitFilter('Tutti'); setOpFilter('tutti'); setSearchText(''); }}
          >
            <i className="bi bi-x me-1" />
            Azzera
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card-cmcc" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table mb-0" style={{ tableLayout: 'auto', minWidth: 820 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>ID Processo</th>
                <th style={thStyle}>Risorsa</th>
                <th style={thStyle}>Tipo Operazione</th>
                <th style={thStyle}>Unità</th>
                <th style={thStyle}>Stato</th>
                <th style={{ ...thStyle, textAlign: 'center', width: 70 }}>Urgente</th>
                <th style={thStyle}>Data Aggiorn.</th>
                <th style={{ ...thStyle, textAlign: 'center', width: 80 }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state" style={{ padding: '40px 24px' }}>
                      <div className="empty-icon"><i className="bi bi-search" /></div>
                      <div className="empty-title">Nessun processo trovato</div>
                      <div className="empty-desc">Modifica i filtri o crea un nuovo processo</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => onViewProcess(p.id)}
                    style={{
                      cursor: 'pointer',
                      borderLeft: p.isUrgent ? '3px solid #f1a20e' : undefined,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {/* ID */}
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#295fa9' }}>
                        {p.id}
                      </span>
                    </td>

                    {/* Risorsa */}
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                        {getResourceName(p)}
                        {p.isNewResource && (
                          <span className="tag tag-green ms-2" style={{ verticalAlign: 'middle' }}>Nuovo</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {p.resource?.email ?? p.newResourceEmail ?? ''}
                      </div>
                    </td>

                    {/* Tipo operazione */}
                    <td style={tdStyle}>
                      <span className="tag tag-blue">
                        {OPERATION_LABELS[p.operationType] ?? p.operationType}
                      </span>
                      {p.contractType && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                          {CONTRACT_TYPE_LABELS[p.contractType] ?? p.contractType}
                        </div>
                      )}
                    </td>

                    {/* Unità */}
                    <td style={tdStyle}>
                      <span
                        className="tag"
                        style={{
                          background: `${getUnitBadgeColor(p.unitCode)}18`,
                          color: getUnitBadgeColor(p.unitCode),
                        }}
                      >
                        {p.unitCode}
                      </span>
                    </td>

                    {/* Stato */}
                    <td style={tdStyle}>
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Urgente */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {p.isUrgent ? (
                        <span className="tag tag-amber" style={{ fontSize: 11 }}>
                          <i className="bi bi-exclamation-triangle-fill" /> URGENTE
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                      )}
                    </td>

                    {/* Data */}
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: 12 }}>
                      {formatDate(p.updatedAt)}
                    </td>

                    {/* Azioni */}
                    <td
                      style={{ ...tdStyle, textAlign: 'center' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-cmcc-secondary"
                        style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => onViewProcess(p.id)}
                        title="Apri dettaglio"
                      >
                        <i className="bi bi-arrow-right-circle" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #e2e8f0',
              fontSize: 12,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
            }}
          >
            <span>
              Visualizzati <strong>{filtered.length}</strong>{' '}
              processo{filtered.length !== 1 ? 'i' : ''}
              {processes.length !== filtered.length ? ` (filtrati da ${processes.length})` : ''}
            </span>
            <span style={{ display: 'flex', gap: 14 }}>
              {(['completato', 'bozza', 'verifica-gru'] as const).map(s => {
                const count = filtered.filter(p => p.status === s).length;
                return count > 0 ? (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <StatusBadge status={s} size="sm" />
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </span>
                ) : null;
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.05em',
  color: '#64748b',
  whiteSpace: 'nowrap',
  borderBottom: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  verticalAlign: 'middle',
  borderColor: '#f1f5f9',
};
