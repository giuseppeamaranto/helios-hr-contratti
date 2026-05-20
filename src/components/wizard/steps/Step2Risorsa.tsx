import { useState } from 'react';
import { RESOURCES, RECRUITING_CANDIDATES } from '../../../data/mockData';
import { avatarColor, initials } from '../../../utils/avatar';
import type { Resource, RecruitingCandidate } from '../../../types';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  /** Wizard partito da seed (PeopleDirectory o Recruiting): mostra riepilogo
   *  read-only invece del selettore. */
  isSeeded?: boolean;
}

/* ── Nuova Assunzione — ATS Recruiting Panel ─────────────────────────────── */

function RecruitingPanel({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}) {
  const selectedId = state.recruitingCandidateId ?? '';

  const handleSelect = (candidate: RecruitingCandidate) => {
    onChange({
      fromRecruiting: true,
      recruitingCandidateId: candidate.id,
      jobCallCode: candidate.jobCallCode,
      jobCallTitle: candidate.jobCallTitle,
      isNewResource: true,
      newResourceName: candidate.fullName,
      newResourceEmail: candidate.email,
      resourceId: '',
      resource: null,
    });
  };

  const selectedCandidate = RECRUITING_CANDIDATES.find(c => c.id === selectedId) ?? null;

  return (
    <div>
      {/* Info banner */}
      <div className="alert-cmcc info mb-3">
        <i className="bi bi-person-badge me-2" />
        La nuova assunzione richiede un candidato proveniente dal processo di recruiting (ATS).
        Seleziona il candidato approvato dalla Job Call.
      </div>

      {/* Confirmation banner when a candidate is selected */}
      {selectedCandidate && (
        <div
          className="alert-cmcc success mb-3"
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div
            className="resource-avatar"
            style={{
              background: avatarColor(selectedCandidate.fullName),
              width: 36,
              height: 36,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {initials(selectedCandidate.fullName)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {selectedCandidate.fullName} selezionato/a
            </div>
            <div style={{ fontSize: 11 }}>
              {selectedCandidate.jobCallCode} &bull; {selectedCandidate.jobCallTitle}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-cmcc-ghost"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() =>
              onChange({
                fromRecruiting: false,
                recruitingCandidateId: undefined,
                jobCallCode: undefined,
                jobCallTitle: undefined,
                isNewResource: false,
                newResourceName: '',
                newResourceEmail: '',
              })
            }
          >
            Cambia
          </button>
        </div>
      )}

      {/* Candidate list */}
      {RECRUITING_CANDIDATES.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px' }}>
          <div style={{ fontSize: 36, opacity: 0.2 }}>
            <i className="bi bi-person-x" />
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
            Nessun candidato disponibile da ATS al momento.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RECRUITING_CANDIDATES.map(candidate => {
            const isSelected = selectedId === candidate.id;
            return (
              <div
                key={candidate.id}
                className={`resource-card${isSelected ? ' selected' : ''}`}
                onClick={() => handleSelect(candidate)}
                style={{ cursor: 'pointer' }}
              >
                {/* Avatar */}
                <div
                  className="resource-avatar"
                  style={{ background: avatarColor(candidate.fullName), flexShrink: 0 }}
                >
                  {initials(candidate.fullName)}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="resource-name" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>{candidate.fullName}</span>
                    <span className="tag tag-green" style={{ fontSize: 10 }}>
                      <i className="bi bi-broadcast me-1" />
                      Da Recruiting
                    </span>
                  </div>

                  <div className="resource-sub">
                    {candidate.email} &bull; {candidate.unitCode} &bull; {candidate.unitName}
                  </div>

                  <div className="resource-sub" style={{ marginTop: 2 }}>
                    <i className="bi bi-file-earmark-text me-1" />
                    {candidate.jobCallCode} &mdash; {candidate.jobCallTitle}
                  </div>

                  <div className="resource-sub" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="tag tag-amber">{candidate.proposedQualifica}</span>
                    <span className="tag tag-blue">{candidate.proposedContractType}</span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>
                      Selezione: {candidate.selectionDate}
                    </span>
                  </div>
                </div>

                {/* Right-side badges */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  {candidate.isEU ? (
                    <span className="tag tag-green">EU</span>
                  ) : (
                    <span className="tag tag-amber">Extra-EU</span>
                  )}
                  {isSelected && (
                    <i
                      className="bi bi-check-circle-fill text-cmcc-blue"
                      style={{ fontSize: 18 }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Existing Resource Search Panel ─────────────────────────────────────── */

function ExistingResourcePanel({
  state,
  onChange,
  query,
  setQuery,
}: {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  query: string;
  setQuery: (q: string) => void;
}) {
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

  return (
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

      {/* Selected resource confirmation */}
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

      {/* Results list */}
      <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <div style={{ fontSize: 32, opacity: 0.2 }}>
              <i className="bi bi-search" />
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Nessuna risorsa trovata per &quot;{query}&quot;
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

      {/* Detail card for selected resource */}
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
  );
}

/* ── New Resource Manual Form ────────────────────────────────────────────── */

function NewResourceForm({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}) {
  return (
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
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */

export function Step2Risorsa({ state, onChange, isSeeded }: Props) {
  const [query, setQuery] = useState('');

  const { operationType } = state;

  /* seeded mode: risorsa o candidato già fissati al lancio del wizard.
     Mostriamo un pannello di sola lettura — la selezione è già avvenuta. */
  if (isSeeded) {
    if (state.fromRecruiting && state.recruitingCandidateId) {
      const c = RECRUITING_CANDIDATES.find(x => x.id === state.recruitingCandidateId);
      if (c) {
        return (
          <div>
            <div className="alert-cmcc info mb-3">
              <i className="bi bi-lock-fill me-2" />
              Il processo è stato avviato da <strong>Recruiting</strong>: il candidato è già associato.
            </div>
            <div className="card-cmcc" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="resource-avatar" style={{ background: avatarColor(c.fullName), width: 52, height: 52, fontSize: 16 }}>
                {initials(c.fullName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {c.fullName}
                  <span className="tag tag-green ms-2" style={{ fontSize: 10 }}>
                    <i className="bi bi-broadcast me-1" />Da Recruiting
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {c.email} &bull; {c.unitCode} &bull; {c.jobCallCode} — {c.jobCallTitle}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="tag tag-amber">{c.proposedQualifica}</span>
                  <span className="tag tag-blue">{c.proposedContractType}</span>
                  <span className={c.isEU ? 'tag tag-green' : 'tag tag-amber'}>{c.isEU ? 'EU' : 'Extra-EU'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
    if (state.resource) {
      const r = state.resource;
      return (
        <div>
          <div className="alert-cmcc info mb-3">
            <i className="bi bi-lock-fill me-2" />
            Il processo è stato avviato da <strong>Anagrafica</strong>: la risorsa è già associata.
          </div>
          <div className="card-cmcc" style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
              <div className="resource-avatar" style={{ background: avatarColor(r.fullName), width: 52, height: 52, fontSize: 16 }}>
                {initials(r.fullName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.fullName}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {r.email} &bull; {r.unit}
                </div>
              </div>
              <span className={r.isEU ? 'tag tag-green' : 'tag tag-amber'}>{r.isEU ? 'EU' : 'Extra-EU'}</span>
            </div>
            <div className="row g-2" style={{ fontSize: 13 }}>
              <div className="col-md-4"><span style={{ color: '#64748b' }}>CF:</span> <strong style={{ fontFamily: 'monospace' }}>{r.cf}</strong></div>
              <div className="col-md-4"><span style={{ color: '#64748b' }}>Nascita:</span> <strong>{r.birthDate}</strong></div>
              <div className="col-md-4"><span style={{ color: '#64748b' }}>Sede:</span> <strong>{r.sede}</strong></div>
              <div className="col-md-4"><span style={{ color: '#64748b' }}>Contratto:</span> <strong>{r.contractType}</strong></div>
              <div className="col-md-4"><span style={{ color: '#64748b' }}>CCNL:</span> <strong>{r.ccnl}</strong></div>
              <div className="col-md-4"><span style={{ color: '#64748b' }}>Scadenza:</span> <strong>{r.endDate ?? 'Tempo Indeterminato'}</strong></div>
            </div>
          </div>
        </div>
      );
    }
  }

  /* nuova-assunzione: ATS-only panel */
  if (operationType === 'nuova-assunzione') {
    return (
      <div>
        <RecruitingPanel state={state} onChange={onChange} />
      </div>
    );
  }

  /* proroga / trasformazione: forced existing resource */
  const mustExisting = operationType === 'proroga' || operationType === 'trasformazione';

  if (mustExisting) {
    return (
      <div>
        <div className="alert-cmcc info mb-3">
          <i className="bi bi-info-circle me-2" />
          Per le operazioni di <strong>Proroga</strong> e <strong>Trasformazione</strong> è
          necessario selezionare una risorsa già presente in anagrafica.
        </div>
        <ExistingResourcePanel
          state={state}
          onChange={onChange}
          query={query}
          setQuery={setQuery}
        />
      </div>
    );
  }

  /* integrazione: toggle existing search / manual input */
  const isNewMode = state.isNewResource;

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
      {/* Mode toggle */}
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

      {!isNewMode ? (
        <ExistingResourcePanel
          state={state}
          onChange={onChange}
          query={query}
          setQuery={setQuery}
        />
      ) : (
        <NewResourceForm state={state} onChange={onChange} />
      )}
    </div>
  );
}
