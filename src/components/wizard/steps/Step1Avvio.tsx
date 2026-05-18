import { UNITS, PROJECTS, CURRENT_USER, OPERATION_LABELS } from '../../../data/mockData';
import type { OperationType } from '../../../types';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const OPERATION_OPTIONS: { value: OperationType; icon: string; desc: string }[] = [
  { value: 'nuova-assunzione', icon: '🆕', desc: 'Prima attivazione di un rapporto di lavoro con la risorsa' },
  { value: 'proroga',          icon: '🔄', desc: 'Estensione della durata di un contratto già in essere' },
  { value: 'trasformazione',   icon: '🔀', desc: 'Modifica della tipologia contrattuale della risorsa' },
  { value: 'integrazione',     icon: '➕', desc: 'Variazione del monte ore o condizioni integrative' },
];

export function Step1Avvio({ state, onChange }: Props) {
  const filteredProjects = PROJECTS.filter(p => p.unitCode === state.unitCode);

  const handleUnitChange = (unitCode: string) => {
    const unit = UNITS.find(u => u.code === unitCode);
    onChange({
      unitCode,
      unitName: unit ? `${unit.code} - ${unit.name}` : '',
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
      {/* Tipo Operazione */}
      <div className="mb-4">
        <label className="form-label">
          Tipo Operazione <span className="required">*</span>
        </label>
        <div className="contract-type-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {OPERATION_OPTIONS.map(op => (
            <div
              key={op.value}
              className={`contract-type-card${state.operationType === op.value ? ' active' : ''}`}
              onClick={() => onChange({ operationType: op.value })}
            >
              <div className="ct-icon">{op.icon}</div>
              <div className="ct-label">{OPERATION_LABELS[op.value]}</div>
              <div className="ct-desc">{op.desc}</div>
            </div>
          ))}
        </div>
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

        {/* Unità di Struttura */}
        <div className="col-md-6">
          <label className="form-label">
            Unità di Struttura <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={state.unitCode}
            onChange={e => handleUnitChange(e.target.value)}
          >
            <option value="">— Seleziona unità —</option>
            {UNITS.map(u => (
              <option key={u.code} value={u.code}>
                {u.code} — {u.name}
              </option>
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
              Seleziona prima l'unità di struttura
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
