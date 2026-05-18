import { useState } from 'react';
import { RESOURCES } from '../../../data/mockData';
import type { Resource } from '../../../types';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const AVATAR_COLORS = [
  '#295fa9', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#dc2626',
];

function avatarColor(name: string): string {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Step2Risorsa({ state, onChange }: Props) {
  const [query, setQuery] = useState('');

  const mustExisting = state.operationType === 'proroga' || state.operationType === 'trasformazione';

  // Force existing-resource mode for proroga/trasformazione
  const isNewMode = !mustExisting && state.isNewResource;

  const filtered = RESOURCES.filter(r => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.cf.toLowerCase().includes(q) ||
      r.unitCode.toLowerCase().includes(q) ||
      r.unit.toLowerCase().includes(q)
    );
  });

  const handleSelectResource = (r: Resource) => {
    onChange({ resourceId: r.idSubject, resource: r, isNewResource: false });
  };

  const handleToggleMode = (newResource: boolean) => {
    onChange({
      isNewResource: newResource,
      resourceId: '',
      resource: null,
      newResourceName: '',
      newResourceEmail: '',
    });
    setQuery('');
  };

  return (
    <div>
      {mustExisting && (
        <div className="alert-cmcc info mb-3">
          <i className="bi bi-info-circle me-2" />
          Per le operazioni di <strong>Proroga</strong> e <strong>Trasformazione</strong> è necessario selezionare una risorsa già presente in anagrafica.
        </div>
      )}

      {/* Toggle modalità — solo se nuova-assunzione o integrazione */}
      {!mustExisting && (
        <div className="d-flex gap-2 mb-4">
          <button
            type="button"
            className={`btn ${!isNewMode ? 'btn-cmcc-primary' : 'btn-cmcc-ghost'}`}
            onClick={() => handleToggleMode(false)}
          >
            <i className="bi bi-search me-2" />
            Cerca risorsa esistente
          </button>
          <button
            type="button"
            className={`btn ${isNewMode ? 'btn-cmcc-primary' : 'btn-cmcc-ghost'}`}
            onClick={() => handleToggleMode(true)}
          >
            <i className="bi bi-person-plus me-2" />
            Inserisci nuova risorsa
          </button>
        </div>
      )}

      {/* Ricerca risorsa esistente */}
      {!isNewMode && (
        <div>
          <div className="search-wrapper mb-3">
            <i className="bi bi-search" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Cerca per nome, email, codice fiscale, unità..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Risorsa selezionata */}
          {state.resource && (
            <div
              className="alert-cmcc success mb-3"
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div
                className="resource-avatar"
                style={{ background: avatarColor(state.resource.fullName), width: 36, height: 36, fontSize: 13 }}
              >
                {initials(state.resource.fullName)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{state.resource.fullName}</div>
                <div style={{ fontSize: 11 }}>
                  {state.resource.email} &bull; {state.resource.unit}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-cmcc-ghost"
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => onChange({ resourceId: '', resource: null })}
              >
                Cambia
              </button>
            </div>
          )}

          {/* Lista risultati */}
          <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <div style={{ fontSize: 32, opacity: 0.2 }}>🔍</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  Nessuna risorsa trovata per "{query}"
                </div>
              </div>
            ) : (
              filtered.map(r => (
                <div
                  key={r.idSubject}
                  className={`resource-card${state.resourceId === r.idSubject ? ' selected' : ''}`}
                  onClick={() => handleSelectResource(r)}
                >
                  <div
                    className="resource-avatar"
                    style={{ background: avatarColor(r.fullName) }}
                  >
                    {initials(r.fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="resource-name">{r.fullName}</div>
                    <div className="resource-sub">
                      {r.email} &bull; {r.unitCode} &bull; {r.profession}
                    </div>
                    <div className="resource-sub" style={{ marginTop: 2 }}>
                      {r.contractType} &bull; Scad.: {r.endDate ?? 'TI'}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {r.isEU ? (
                      <span className="tag tag-green">EU</span>
                    ) : (
                      <span className="tag tag-amber">Extra-EU</span>
                    )}
                  </div>
                  {state.resourceId === r.idSubject && (
                    <i className="bi bi-check-circle-fill text-cmcc-blue" style={{ fontSize: 18 }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Dettaglio risorsa selezionata */}
          {state.resource && (
            <div className="card-cmcc p-3 mt-3">
              <div className="form-section-title">
                <i className="bi bi-person-vcard" />
                Dati Risorsa Selezionata
              </div>
              <div className="row g-2" style={{ fontSize: 13 }}>
                <div className="col-md-4">
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Codice Fiscale:</span>{' '}
                  <strong>{state.resource.cf}</strong>
                </div>
                <div className="col-md-4">
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Data nascita:</span>{' '}
                  <strong>{state.resource.birthDate}</strong>
                </div>
                <div className="col-md-4">
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Sede:</span>{' '}
                  <strong>{state.resource.sede}</strong>
                </div>
                <div className="col-md-4">
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Contratto attuale:</span>{' '}
                  <strong>{state.resource.contractType}</strong>
                </div>
                <div className="col-md-4">
                  <span style={{ color: '#64748b', fontWeight: 500 }}>CCNL:</span>{' '}
                  <strong>{state.resource.ccnl}</strong>
                </div>
                <div className="col-md-4">
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Scadenza attuale:</span>{' '}
                  <strong>{state.resource.endDate ?? 'Tempo Indeterminato'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nuova risorsa */}
      {isNewMode && (
        <div>
          <div className="alert-cmcc warning mb-3">
            <i className="bi bi-exclamation-triangle me-2" />
            Inserisci i dati della nuova risorsa. Il profilo completo sarà creato successivamente dalla GRU.
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Nome Completo <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="es. Mario Rossi"
                value={state.newResourceName}
                onChange={e => onChange({ newResourceName: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="es. mario.rossi@cmcc.it"
                value={state.newResourceEmail}
                onChange={e => onChange({ newResourceEmail: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Codice Fiscale</label>
              <input
                type="text"
                className="form-control"
                placeholder="opzionale"
                value={state.newResourceCF ?? ''}
                onChange={e => onChange({ newResourceCF: e.target.value } as Partial<WizardState>)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Data di Nascita</label>
              <input
                type="date"
                className="form-control"
                value={state.newResourceBirthDate ?? ''}
                onChange={e => onChange({ newResourceBirthDate: e.target.value } as Partial<WizardState>)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Nazionalità</label>
              <input
                type="text"
                className="form-control"
                placeholder="es. ITALIA"
                value={state.newResourceNationality ?? ''}
                onChange={e => onChange({ newResourceNationality: e.target.value } as Partial<WizardState>)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
