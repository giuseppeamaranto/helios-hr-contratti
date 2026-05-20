import React, { useState, useMemo } from 'react';
import { RESOURCES } from '../../data/mockData';
import { avatarColor, initials } from '../../utils/avatar';
import type { Resource } from '../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────
function maskCF(cf: string): string {
  if (!cf || cf.length < 8) return cf;
  return cf.slice(0, 8) + '**';
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Filter config ─────────────────────────────────────────────────────────────
const UNIT_FILTERS = ['Tutti', 'ICR', 'IESP', 'EIEE', 'IAFES', 'REMHI', 'ASC'];
const CONTRACT_FILTERS = [
  { label: 'Tutti', value: '' },
  { label: 'CO.CO.CO', value: 'CO.CO.CO' },
  { label: 'Lavoro dipendente', value: 'dipendente' },
  { label: 'Distaccato', value: 'Distaccato' },
  { label: 'Tirocinante', value: 'Tirocinio' },
];
const SEDE_FILTERS = [
  'Tutti', 'Sede Legale', 'Venezia', 'Bologna', 'Viterbo', 'Sassari', 'Milano',
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onNewProcess: (resourceId: string) => void;
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
interface DetailModalProps {
  resource: Resource;
  onClose: () => void;
  onNewProcess: (id: string) => void;
}

function DetailModal({ resource: r, onClose, onNewProcess }: DetailModalProps) {
  const days = daysUntil(r.endDate);
  const isUrgent = days !== null && days >= 0 && days < 60;

  function handleNewProcess() {
    onNewProcess(r.idSubject);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box modal-box-lg"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header-cmcc" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            className="person-avatar-large"
            style={{
              background: avatarColor(r.fullName),
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {initials(r.fullName)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{r.fullName}</div>
            <div style={{ color: 'var(--cmcc-text-muted)', fontSize: 13 }}>{r.profession}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <span className={`tag ${r.isEU ? 'tag-blue' : 'tag-amber'}`}>
                {r.isEU ? 'EU' : 'NON-EU'}
              </span>
              {r.study === 'PHD' && <span className="tag tag-purple">PHD</span>}
              {isUrgent && <span className="tag tag-amber">URGENTE</span>}
            </div>
          </div>
          <button
            className="btn-cmcc-ghost"
            onClick={onClose}
            style={{ fontSize: 20, lineHeight: 1, padding: '4px 8px' }}
            aria-label="Chiudi"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-cmcc" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Dati Anagrafici */}
          <div className="summary-section">
            <div className="summary-section-header">Dati Anagrafici</div>
            <div className="summary-row">
              <span className="summary-key">Codice Fiscale</span>
              <span className="summary-value" style={{ fontFamily: 'monospace' }}>{r.cf}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Data di nascita</span>
              <span className="summary-value">{formatDate(r.birthDate)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Nazionalità</span>
              <span className="summary-value">{r.birthCountry}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Paese residenza</span>
              <span className="summary-value">{r.residenceCountry}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Email CMCC</span>
              <span className="summary-value">
                <a href={`mailto:${r.email}`} style={{ color: 'var(--cmcc-blue)' }}>{r.email}</a>
              </span>
            </div>
            {r.emailPrivate && (
              <div className="summary-row">
                <span className="summary-key">Email privata</span>
                <span className="summary-value">{r.emailPrivate}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-key">Sesso</span>
              <span className="summary-value">{r.sex === 'M' ? 'Maschile' : 'Femminile'}</span>
            </div>
          </div>

          {/* Contratto */}
          <div className="summary-section">
            <div className="summary-section-header">Contratto Attuale</div>
            <div className="summary-row">
              <span className="summary-key">Tipo contratto</span>
              <span className="summary-value">{r.contractType}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Natura rapporto</span>
              <span className="summary-value">{r.contractNature}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">CCNL</span>
              <span className="summary-value">{r.ccnl}</span>
            </div>
            {r.ccnlLevel && (
              <div className="summary-row">
                <span className="summary-key">Livello CCNL</span>
                <span className="summary-value">{r.ccnlLevel}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-key">Data inizio</span>
              <span className="summary-value">{formatDate(r.startDate)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Data fine</span>
              <span className="summary-value">
                {r.endDate ? (
                  <>
                    {formatDate(r.endDate)}
                    {isUrgent && (
                      <span className="tag tag-amber" style={{ marginLeft: 8 }}>
                        {days === 0 ? 'Oggi' : `${days} giorni`}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="tag tag-green">Tempo indeterminato</span>
                )}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Orario</span>
              <span className="summary-value">
                {r.isPartTime ? `Part-time ${r.partTimePercent}%` : 'Full-time'}
              </span>
            </div>
          </div>

          {/* Struttura */}
          <div className="summary-section">
            <div className="summary-section-header">Struttura</div>
            <div className="summary-row">
              <span className="summary-key">Unità</span>
              <span className="summary-value">{r.unit}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Codice struttura</span>
              <span className="summary-value">
                <span className="tag tag-blue">{r.unitCode}</span>
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Sede</span>
              <span className="summary-value">{r.sede}</span>
            </div>
          </div>

          {/* Formazione */}
          <div className="summary-section">
            <div className="summary-section-header">Formazione</div>
            <div className="summary-row">
              <span className="summary-key">Titolo di studio</span>
              <span className="summary-value">{r.study}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Qualifica professionale</span>
              <span className="summary-value">{r.qualProf}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Profilo</span>
              <span className="summary-value">{r.profession}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-cmcc" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-cmcc-secondary" onClick={onClose}>
            Chiudi
          </button>
          <button className="btn-cmcc-primary" onClick={handleNewProcess}>
            <i className="bi bi-plus-circle me-2" />
            Avvia Nuovo Processo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card view ─────────────────────────────────────────────────────────────────
interface PersonCardProps {
  resource: Resource;
  onNewProcess: (id: string) => void;
  onDetail: (r: Resource) => void;
}

function PersonCard({ resource: r, onNewProcess, onDetail }: PersonCardProps) {
  const days = daysUntil(r.endDate);
  const isUrgent = days !== null && days >= 0 && days < 60;

  return (
    <div
      className="person-card"
      onClick={() => onDetail(r)}
      style={{ cursor: 'pointer' }}
    >
      <div className="person-card-top">
        <div
          className="person-avatar-large"
          style={{
            background: avatarColor(r.fullName),
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {initials(r.fullName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="person-card-name">{r.fullName}</div>
          <div className="person-card-prof">{r.profession}</div>
          <div className="person-card-unit">{r.unitCode}</div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        <span className={`tag ${r.isEU ? 'tag-blue' : 'tag-amber'}`}>
          {r.isEU ? 'EU' : 'NON-EU'}
        </span>
        {r.study === 'PHD' && <span className="tag tag-purple">PHD</span>}
        {isUrgent && (
          <span className="tag tag-amber">
            URGENTE {days === 0 ? '(oggi)' : `(${days}gg)`}
          </span>
        )}
        {!r.endDate && <span className="tag tag-green">Indeterminato</span>}
      </div>

      {/* Details */}
      <div className="person-card-details">
        <div className="person-detail-row">
          <i className="bi bi-envelope" style={{ color: 'var(--cmcc-text-muted)', width: 16 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.email}
          </span>
        </div>
        <div className="person-detail-row">
          <i className="bi bi-person-badge" style={{ color: 'var(--cmcc-text-muted)', width: 16 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{maskCF(r.cf)}</span>
        </div>
        <div className="person-detail-row">
          <i className="bi bi-calendar3" style={{ color: 'var(--cmcc-text-muted)', width: 16 }} />
          <span>Dal {formatDate(r.startDate)}</span>
        </div>
        {r.endDate && (
          <div className="person-detail-row">
            <i className="bi bi-calendar-x" style={{ color: isUrgent ? '#d97706' : 'var(--cmcc-text-muted)', width: 16 }} />
            <span style={{ color: isUrgent ? '#d97706' : undefined }}>
              Al {formatDate(r.endDate)}
            </span>
          </div>
        )}
        <div className="person-detail-row">
          <i className="bi bi-geo-alt" style={{ color: 'var(--cmcc-text-muted)', width: 16 }} />
          <span>{r.sede}</span>
        </div>
        <div className="person-detail-row">
          <i className="bi bi-file-earmark-text" style={{ color: 'var(--cmcc-text-muted)', width: 16 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.contractNature}
          </span>
        </div>
        <div className="person-detail-row">
          <i className="bi bi-building" style={{ color: 'var(--cmcc-text-muted)', width: 16 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
            {r.ccnl}
          </span>
        </div>
        <div className="person-detail-row">
          <i className="bi bi-globe" style={{ color: 'var(--cmcc-text-muted)', width: 16 }} />
          <span>{r.birthCountry}</span>
        </div>
      </div>

      {/* Action */}
      <div style={{ marginTop: 12 }}>
        <button
          className="btn-cmcc-primary"
          style={{ width: '100%', fontSize: 13 }}
          onClick={e => {
            e.stopPropagation();
            onNewProcess(r.idSubject);
          }}
        >
          <i className="bi bi-plus-circle me-2" />
          Nuovo Processo
        </button>
      </div>
    </div>
  );
}

// ── Table row ─────────────────────────────────────────────────────────────────
interface TableRowProps {
  resource: Resource;
  onNewProcess: (id: string) => void;
  onDetail: (r: Resource) => void;
}

function TableRow({ resource: r, onNewProcess, onDetail }: TableRowProps) {
  const days = daysUntil(r.endDate);
  const isUrgent = days !== null && days >= 0 && days < 60;

  return (
    <tr style={{ cursor: 'pointer' }} onClick={() => onDetail(r)}>
      {/* Avatar + Nome */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="resource-avatar"
            style={{ background: avatarColor(r.fullName), color: '#fff', fontWeight: 700, fontSize: 13 }}
          >
            {initials(r.fullName)}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.fullName}</div>
            <div style={{ fontSize: 12, color: 'var(--cmcc-text-muted)' }}>{r.email}</div>
          </div>
        </div>
      </td>
      {/* Unità */}
      <td>
        <span className="tag tag-blue">{r.unitCode}</span>
      </td>
      {/* Professione */}
      <td style={{ fontSize: 13 }}>{r.profession}</td>
      {/* Contratto */}
      <td style={{ fontSize: 13 }}>{r.contractNature}</td>
      {/* Data fine */}
      <td>
        {r.endDate ? (
          <span style={{ color: isUrgent ? '#d97706' : undefined, fontWeight: isUrgent ? 600 : undefined }}>
            {formatDate(r.endDate)}
            {isUrgent && <i className="bi bi-exclamation-triangle-fill ms-1" style={{ color: '#d97706' }} />}
          </span>
        ) : (
          <span className="tag tag-green" style={{ fontSize: 11 }}>Indet.</span>
        )}
      </td>
      {/* Sede */}
      <td style={{ fontSize: 13 }}>{r.sede}</td>
      {/* Azioni */}
      <td>
        <button
          className="btn-cmcc-ghost"
          style={{ fontSize: 12, padding: '3px 10px' }}
          onClick={e => {
            e.stopPropagation();
            onNewProcess(r.idSubject);
          }}
        >
          <i className="bi bi-plus-circle me-1" />
          Nuovo Processo
        </button>
      </td>
    </tr>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PeopleDirectory({ onNewProcess }: Props) {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('Tutti');
  const [contractFilter, setContractFilter] = useState('');
  const [sedeFilter, setSedeFilter] = useState('Tutti');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      // Text search
      if (search) {
        const q = search.toLowerCase();
        const hit =
          r.fullName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.cf.toLowerCase().includes(q) ||
          r.profession.toLowerCase().includes(q);
        if (!hit) return false;
      }
      // Unit
      if (unitFilter !== 'Tutti' && r.unitCode !== unitFilter) return false;
      // Contract
      if (contractFilter) {
        const val = contractFilter.toLowerCase();
        if (!r.contractNature.toLowerCase().includes(val) &&
            !r.contractType.toLowerCase().includes(val)) return false;
      }
      // Sede
      if (sedeFilter !== 'Tutti') {
        if (!r.sede.toLowerCase().includes(sedeFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [search, unitFilter, contractFilter, sedeFilter]);

  return (
    <div>
      {/* Page heading */}
      <div className="page-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Rubrica CMCC</h1>
          <p className="page-subtitle">
            {RESOURCES.length} risorse totali &nbsp;&middot;&nbsp;
            <span className="tag tag-blue" style={{ fontSize: 11 }}>Fonte: Helios / Zucchetti</span>
          </p>
        </div>
        {/* Vista toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={viewMode === 'card' ? 'btn-cmcc-primary' : 'btn-cmcc-secondary'}
            style={{ fontSize: 13, padding: '6px 14px' }}
            onClick={() => setViewMode('card')}
          >
            <i className="bi bi-grid me-1" />
            Card
          </button>
          <button
            className={viewMode === 'table' ? 'btn-cmcc-primary' : 'btn-cmcc-secondary'}
            style={{ fontSize: 13, padding: '6px 14px' }}
            onClick={() => setViewMode('table')}
          >
            <i className="bi bi-table me-1" />
            Tabella
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        {/* Search */}
        <div className="search-wrapper" style={{ flex: '1 1 220px' }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--cmcc-text-muted)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Cerca per nome, email, CF, professione..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        {/* Unit chips */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {UNIT_FILTERS.map(u => (
            <button
              key={u}
              className={`filter-chip ${unitFilter === u ? 'active' : ''}`}
              onClick={() => setUnitFilter(u)}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Contract type */}
        <select
          className="search-input"
          style={{ width: 'auto', minWidth: 180, cursor: 'pointer' }}
          value={contractFilter}
          onChange={e => setContractFilter(e.target.value)}
        >
          {CONTRACT_FILTERS.map(cf => (
            <option key={cf.value} value={cf.value}>{cf.label}</option>
          ))}
        </select>

        {/* Sede */}
        <select
          className="search-input"
          style={{ width: 'auto', minWidth: 160, cursor: 'pointer' }}
          value={sedeFilter}
          onChange={e => setSedeFilter(e.target.value)}
        >
          {SEDE_FILTERS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <div style={{ marginBottom: 16, color: 'var(--cmcc-text-muted)', fontSize: 13 }}>
        <strong style={{ color: 'var(--cmcc-text)' }}>{filtered.length}</strong> risorse trovate
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="bi bi-person-x" style={{ fontSize: 40 }} />
          </div>
          <div className="empty-title">Nessuna risorsa trovata</div>
          <div className="empty-desc">Prova a modificare i filtri di ricerca.</div>
        </div>
      )}

      {/* Card view */}
      {viewMode === 'card' && filtered.length > 0 && (
        <div className="people-grid">
          {filtered.map(r => (
            <PersonCard
              key={r.idSubject}
              resource={r}
              onNewProcess={onNewProcess}
              onDetail={setSelectedResource}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="card-cmcc" style={{ overflowX: 'auto' }}>
          <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--cmcc-border)' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cmcc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                  Avatar / Nome
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cmcc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                  Unità
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cmcc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                  Professione
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cmcc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                  Contratto
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cmcc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                  Data fine
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cmcc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                  Sede
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cmcc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <TableRow
                  key={r.idSubject}
                  resource={r}
                  onNewProcess={onNewProcess}
                  onDetail={setSelectedResource}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedResource && (
        <DetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onNewProcess={onNewProcess}
        />
      )}
    </div>
  );
}
