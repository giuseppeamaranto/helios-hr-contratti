// Form per inserimento manuale di una nuova risorsa (non in DossierRisorse).
// Estratto da Step2Risorsa per essere riusato anche dal filone external-mod09.
import type { WizardState } from './ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  showAlert?: boolean;
}

export function NewResourceForm({ state, onChange, showAlert = true }: Props) {
  return (
    <div>
      {showAlert && (
        <div className="alert-cmcc warning mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          Inserisci i dati della nuova risorsa. Il profilo completo sarà creato successivamente dalla GRU.
        </div>
      )}
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
            onChange={e => onChange({ newResourceCF: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Data di Nascita</label>
          <input
            type="date"
            className="form-control"
            value={state.newResourceBirthDate ?? ''}
            onChange={e => onChange({ newResourceBirthDate: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Nazionalità</label>
          <input
            type="text"
            className="form-control"
            placeholder="es. ITALIA"
            value={state.newResourceNationality ?? ''}
            onChange={e => onChange({ newResourceNationality: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
