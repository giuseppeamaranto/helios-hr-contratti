import { useState } from 'react';
import { RESOURCES, RECRUITING_CANDIDATES } from '../../data/mockData';
import { avatarColor, initials } from '../../utils/avatar';
import type { RecruitingCandidate, Resource } from '../../types';

interface Props {
  onPickRecruiting: (candidate: RecruitingCandidate) => void;
  onPickExisting: (resource: Resource) => void;
  onBlankStart: () => void;
  onCancel: () => void;
}

type Mode = null | 'recruiting' | 'existing';

export function WizardEntry({ onPickRecruiting, onPickExisting, onBlankStart, onCancel }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [query, setQuery] = useState('');

  // ── Step 1: scelta filone ──────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="wizard-container">
        <div className="wizard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: '#295fa9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-signpost-split" style={{ color: 'white', fontSize: 18 }} />
            </div>
            <div>
              <div className="wizard-title">Nuovo Processo Contratto HR</div>
              <div className="wizard-subtitle">Da dove vuoi partire?</div>
            </div>
          </div>
        </div>

        <div className="wizard-body" style={{ padding: '24px 28px' }}>
          <div className="alert-cmcc info mb-3">
            <i className="bi bi-info-circle me-2" />
            Il processo contratti può partire da <strong>due filoni</strong>: una
            <strong> nuova assunzione</strong> arrivata dal Recruiting (ATS), oppure
            una <strong>variazione contrattuale</strong> su una risorsa già in anagrafica
            (proroga, trasformazione, integrazione…).
          </div>

          <div className="contract-type-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="contract-type-card" onClick={() => setMode('recruiting')} style={{ minHeight: 180 }}>
              <div className="ct-icon">🎯</div>
              <div className="ct-label">Da Recruiting (ATS)</div>
              <div className="ct-desc">
                Nuova assunzione: il candidato è stato approvato dalla Job Call.
                Nome e cognome sono pre-compilati.
              </div>
              <div className="mt-2"><span className="tag tag-green">Nuova assunzione</span></div>
            </div>
            <div className="contract-type-card" onClick={() => setMode('existing')} style={{ minHeight: 180 }}>
              <div className="ct-icon">👤</div>
              <div className="ct-label">Da Risorsa in Anagrafica</div>
              <div className="ct-desc">
                Variazione contrattuale (proroga, trasformazione, integrazione)
                su una persona già attiva in CMCC.
              </div>
              <div className="mt-2">
                <span className="tag tag-blue">Proroga</span>{' '}
                <span className="tag tag-purple">Trasformazione</span>
              </div>
            </div>
          </div>

          <div className="mt-4" style={{ textAlign: 'center' }}>
            <button className="btn btn-cmcc-ghost" onClick={onBlankStart} style={{ fontSize: 12 }}>
              <i className="bi bi-pencil me-2" />
              Avvia processo in bianco (manuale)
            </button>
          </div>
        </div>

        <div className="wizard-actions">
          <button className="btn btn-cmcc-ghost" onClick={onCancel}>
            <i className="bi bi-x-circle me-2" />
            Annulla
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: lista candidati o lista risorse, da pickare ─────────────────
  const isRecruiting = mode === 'recruiting';
  const itemsRecruiting = RECRUITING_CANDIDATES.filter(c => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.fullName.toLowerCase().includes(q)
        || c.email.toLowerCase().includes(q)
        || c.jobCallCode.toLowerCase().includes(q)
        || c.unitCode.toLowerCase().includes(q);
  });
  const itemsResources = RESOURCES.filter(r => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.fullName.toLowerCase().includes(q)
        || r.email.toLowerCase().includes(q)
        || r.cf.toLowerCase().includes(q)
        || r.unitCode.toLowerCase().includes(q)
        || (r.profession || '').toLowerCase().includes(q);
  });

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-cmcc-ghost" onClick={() => { setMode(null); setQuery(''); }} style={{ padding: '5px 12px', fontSize: 12 }}>
            <i className="bi bi-arrow-left me-1" />
            Indietro
          </button>
          <div>
            <div className="wizard-title">
              {isRecruiting ? 'Seleziona Candidato dal Recruiting' : 'Seleziona Risorsa in Anagrafica'}
            </div>
            <div className="wizard-subtitle">
              {isRecruiting
                ? 'Tutti i candidati approvati dalle Job Call attive'
                : `${RESOURCES.length} risorse disponibili in DossierRisorse`}
            </div>
          </div>
        </div>
      </div>

      <div className="wizard-body">
        <div className="search-wrapper mb-3">
          <i className="bi bi-search" />
          <input
            type="text"
            className="form-control search-input"
            placeholder={isRecruiting
              ? 'Cerca per nome, email, Job Call, unità…'
              : 'Cerca per nome, email, CF, unità, professione…'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ maxHeight: '52vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isRecruiting && itemsRecruiting.length === 0 && (
            <div className="empty-state" style={{ padding: 28 }}>
              <div style={{ fontSize: 32, opacity: 0.2 }}><i className="bi bi-person-x" /></div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Nessun candidato trovato.</div>
            </div>
          )}
          {!isRecruiting && itemsResources.length === 0 && (
            <div className="empty-state" style={{ padding: 28 }}>
              <div style={{ fontSize: 32, opacity: 0.2 }}><i className="bi bi-search" /></div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Nessuna risorsa trovata.</div>
            </div>
          )}

          {isRecruiting && itemsRecruiting.map(c => (
            <div key={c.id} className="resource-card" onClick={() => onPickRecruiting(c)} style={{ cursor: 'pointer' }}>
              <div className="resource-avatar" style={{ background: avatarColor(c.fullName), flexShrink: 0 }}>
                {initials(c.fullName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="resource-name" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>{c.fullName}</span>
                  <span className="tag tag-green" style={{ fontSize: 10 }}>
                    <i className="bi bi-broadcast me-1" />Da Recruiting
                  </span>
                </div>
                <div className="resource-sub">{c.email} &bull; {c.unitCode} &bull; {c.jobCallCode}</div>
                <div className="resource-sub" style={{ marginTop: 2 }}>
                  <i className="bi bi-file-earmark-text me-1" />
                  {c.jobCallTitle}
                </div>
                <div className="resource-sub" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className="tag tag-amber">{c.proposedQualifica}</span>
                  <span className="tag tag-blue">{c.proposedContractType}</span>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span className={c.isEU ? 'tag tag-green' : 'tag tag-amber'}>{c.isEU ? 'EU' : 'Extra-EU'}</span>
              </div>
            </div>
          ))}

          {!isRecruiting && itemsResources.map(r => (
            <div key={r.idSubject} className="resource-card" onClick={() => onPickExisting(r)} style={{ cursor: 'pointer' }}>
              <div className="resource-avatar" style={{ background: avatarColor(r.fullName), flexShrink: 0 }}>
                {initials(r.fullName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="resource-name">{r.fullName}</div>
                <div className="resource-sub">{r.email} &bull; {r.unitCode} &bull; {r.profession}</div>
                <div className="resource-sub" style={{ marginTop: 2 }}>
                  {r.contractType} &bull; Scad.: {r.endDate ?? 'TI'}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span className={r.isEU ? 'tag tag-green' : 'tag tag-amber'}>{r.isEU ? 'EU' : 'Extra-EU'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wizard-actions">
        <button className="btn btn-cmcc-ghost" onClick={onCancel}>
          <i className="bi bi-x-circle me-2" />
          Annulla
        </button>
      </div>
    </div>
  );
}
