import { ORG_UNITS, PROJECTS, CURRENT_USER, OPERATION_LABELS, instituteForOrgUnit } from '../../../data/mockData';
import { allowedOperationsFor, detectResourceCategory, explainRule } from '../../../data/resourceRules';
import type { OperationType } from '../../../types';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const ALL_OPERATIONS: { value: OperationType; icon: string; desc: string }[] = [
  { value: 'nuova-assunzione', icon: '🆕', desc: 'Prima attivazione di un rapporto di lavoro con la risorsa' },
  { value: 'proroga',          icon: '🔄', desc: 'Estensione della durata di un contratto già in essere' },
  { value: 'trasformazione',   icon: '🔀', desc: 'Modifica della tipologia contrattuale della risorsa' },
  { value: 'integrazione',     icon: '➕', desc: 'Variazione del monte ore o condizioni integrative' },
];

// Pre-raggruppamento UO per optgroup — calcolato una volta sola a livello modulo.
const UNITS_BY_GROUP = ORG_UNITS.reduce<Record<string, typeof ORG_UNITS>>((acc, u) => {
  (acc[u.group] ||= []).push(u);
  return acc;
}, {});

export function Step1Avvio({ state, onChange }: Props) {
  // Filtraggio operazioni in base al filone di ingresso:
  //  - recruiting / external-mod09: solo "nuova-assunzione" (auto-impostata)
  //  - existing: filtrate da allowedOperationsFor(resourceCategory),
  //              senza "nuova-assunzione"
  //  - blank: tutte e 4
  const isRecruiting = state.entryMode === 'recruiting';
  const isExternal   = state.entryMode === 'external-mod09';
  const isExisting   = state.entryMode === 'existing';
  const resourceCategory = detectResourceCategory(state.resource);
  const allowedOps = allowedOperationsFor(resourceCategory);
  const OPERATION_OPTIONS =
    isRecruiting || isExternal
      ? ALL_OPERATIONS.filter(o => o.value === 'nuova-assunzione')
      : isExisting
        ? ALL_OPERATIONS.filter(o => o.value !== 'nuova-assunzione' && allowedOps.includes(o.value))
        : ALL_OPERATIONS;
  const operationIsLocked = isRecruiting || isExternal;

  // PROJECTS è ancorato al codice Istituto (ICR/IESP/EIEE/IAFES/REMHI/ASC).
  // La UO scelta nella dropdown è più granulare (es. ESYDA, ROFS): risolviamo
  // il parent Istituto per il filtro sui progetti. Se la UO ricade su 'CENTRALE'
  // (Executive Office, IT, AF…) non ci sono progetti dedicati → mostriamo TUTTI
  // i progetti (con hint visivo nella label) per non lasciare l'utente bloccato.
  const parentInstitute = instituteForOrgUnit(state.unitCode);
  const matchedProjects = parentInstitute
    ? PROJECTS.filter(p => p.unitCode === parentInstitute)
    : PROJECTS.filter(p => p.unitCode === state.unitCode);
  const showAllProjects = state.unitCode !== '' && matchedProjects.length === 0;
  const filteredProjects = showAllProjects ? PROJECTS : matchedProjects;

  const handleUnitChange = (code: string) => {
    const u = ORG_UNITS.find(x => x.code === code);
    onChange({
      unitCode: code,
      unitName: u ? `${u.code} — ${u.name}` : '',
      projectCode: '',
      projectName: '',
      costCenter: '',
    });
  };

  const handleProjectChange = (projectCode: string) => {
    const project = PROJECTS.find(p => p.code === projectCode);
    onChange({
      projectCode,
      projectName: project?.name ?? '',
      costCenter: project?.costCenter ?? '',
    });
  };

  return (
    <div>
      {/* Banner contesto filone */}
      {state.entryMode && (
        <div
          className={`alert-cmcc ${isExisting ? 'info' : 'success'} mb-3`}
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <i className={`bi ${isRecruiting ? 'bi-broadcast' : isExternal ? 'bi-globe2' : 'bi-person-vcard'}`} />
          <div>
            <strong>Filone:</strong>{' '}
            {isRecruiting && <>Nuovo assunto da <strong>Recruiting (ATS)</strong>{state.newResourceName && <> — {state.newResourceName}</>}</>}
            {isExisting   && <>Variazione su <strong>risorsa in Anagrafica</strong>{state.resource && <> — {state.resource.fullName}</>}</>}
            {isExternal   && <>Nuovo <strong>soggetto esterno (MOD09)</strong> — Occasionale / Consulenza / Borsa / Tirocinio</>}
          </div>
        </div>
      )}

      {/* Avviso regola contratto attuale (solo se partito da risorsa esistente) */}
      {isExisting && state.resource && (
        <div className="alert-cmcc info mb-3" style={{ fontSize: 12 }}>
          <i className="bi bi-shield-check me-2" />
          <strong>Regola contratto attuale:</strong> {explainRule(resourceCategory)}
        </div>
      )}

      {/* Tipo Operazione */}
      <div className="mb-4">
        <label className="form-label">
          Tipo Operazione <span className="required">*</span>
          {operationIsLocked && <span className="tag tag-gray ms-2" style={{ fontSize: 10 }}>auto-impostata</span>}
        </label>
        <div className="contract-type-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {OPERATION_OPTIONS.map(op => (
            <div
              key={op.value}
              className={`contract-type-card${state.operationType === op.value ? ' active' : ''}`}
              onClick={() => !operationIsLocked && onChange({ operationType: op.value })}
              style={operationIsLocked ? { cursor: 'default', opacity: state.operationType === op.value ? 1 : 0.5 } : undefined}
              title={operationIsLocked ? 'Auto-impostata dal filone di ingresso' : undefined}
            >
              <div className="ct-icon">{op.icon}</div>
              <div className="ct-label">{OPERATION_LABELS[op.value]}</div>
              <div className="ct-desc">{op.desc}</div>
            </div>
          ))}
        </div>
        {isExisting && OPERATION_OPTIONS.length === 0 && (
          <div className="alert-cmcc warning mt-2" style={{ fontSize: 12 }}>
            <i className="bi bi-x-octagon-fill me-2" />
            Nessuna operazione contrattuale disponibile per il tipo di contratto attuale della risorsa.
          </div>
        )}
      </div>

      <div className="row g-3">
        {/* Richiedente */}
        <div className="col-md-6">
          <label className="form-label">
            Richiedente <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={state.requestedBy}
            readOnly={CURRENT_USER.role !== 'gru'}
            onChange={e => onChange({ requestedBy: e.target.value })}
            style={CURRENT_USER.role !== 'gru' ? { background: '#f8fafc', cursor: 'not-allowed' } : {}}
          />
        </div>

        {/* Email Richiedente */}
        <div className="col-md-6">
          <label className="form-label">Email Richiedente</label>
          <input
            type="email"
            className="form-control"
            value={state.requestedByEmail}
            readOnly
            style={{ background: '#f8fafc', cursor: 'not-allowed' }}
          />
        </div>

        {/* Unità Organizzative (ex "Unità di Struttura") — punto 8 */}
        <div className="col-md-6">
          <label className="form-label">
            Unità Organizzative <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={state.unitCode}
            onChange={e => handleUnitChange(e.target.value)}
          >
            <option value="">— Seleziona unità organizzativa —</option>
            {Object.entries(UNITS_BY_GROUP).map(([group, list]) => (
              <optgroup key={group} label={group}>
                {list.map(u => (
                  <option key={u.code} value={u.code}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Progetto */}
        <div className="col-md-6">
          <label className="form-label">
            Progetto <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={state.projectCode}
            disabled={!state.unitCode}
            onChange={e => handleProjectChange(e.target.value)}
          >
            <option value="">— Seleziona progetto —</option>
            {filteredProjects.map(p => (
              <option key={p.code} value={p.code}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
          {!state.unitCode && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Seleziona prima l'unità organizzativa
            </div>
          )}
          {showAllProjects && (
            <div style={{ fontSize: 11, color: '#f1a20e', marginTop: 4 }}>
              <i className="bi bi-info-circle me-1" />
              Nessun progetto dedicato per <strong>{state.unitCode}</strong>: mostro tutti i progetti disponibili.
            </div>
          )}
        </div>

        {/* Centro di Costo */}
        <div className="col-md-4">
          <label className="form-label">Centro di Costo</label>
          <input
            type="text"
            className="form-control"
            value={state.costCenter}
            readOnly
            placeholder="Auto-compilato dal progetto"
            style={{ background: '#f8fafc', cursor: 'not-allowed' }}
          />
        </div>

        {/* Urgenza */}
        <div className="col-md-4 d-flex align-items-end">
          <div className="form-check form-switch" style={{ paddingBottom: 8 }}>
            <input
              className="form-check-input"
              type="checkbox"
              id="urgencyToggle"
              checked={state.isUrgent}
              onChange={e => onChange({ isUrgent: e.target.checked })}
              style={{ width: 40, height: 22, cursor: 'pointer' }}
            />
            <label
              className="form-check-label"
              htmlFor="urgencyToggle"
              style={{ fontWeight: 600, fontSize: 13, marginLeft: 8, cursor: 'pointer' }}
            >
              Richiesta urgente
            </label>
          </div>
        </div>

        {/* Note */}
        <div className="col-12">
          <label className="form-label">Note</label>
          <textarea
            className="form-control"
            rows={3}
            value={state.notes}
            placeholder="Indicazioni aggiuntive per il processo..."
            onChange={e => onChange({ notes: e.target.value })}
          />
        </div>
      </div>

      {state.isUrgent && (
        <div className="alert-cmcc warning mt-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Richiesta Urgente:</strong> il processo sarà evidenziato e trattato con priorità dal team GRU.
        </div>
      )}
    </div>
  );
}
