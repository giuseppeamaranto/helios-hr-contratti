import { useState } from 'react';
import { CURRENT_USER } from '../../data/mockData';
import type {
  ContractCategory,
  ContractType,
  ContractProcess,
  Mod09Data,
  Mod10Data,
  OperationType,
  ProcessDocument,
  Resource,
  UserRole,
} from '../../types';
import { Step1Avvio } from './steps/Step1Avvio';
import { Step2Risorsa } from './steps/Step2Risorsa';
import { Step3Contratto } from './steps/Step3Contratto';
import { Step4Mod09 } from './steps/Step4Mod09';
import { Step4Mod10 } from './steps/Step4Mod10';
import { Step5Documenti, getRequiredDocs } from './steps/Step5Documenti';
import { Step6Riepilogo } from './steps/Step6Riepilogo';

/* ── WizardState (exported for child components) ─────────────────────────── */
export interface WizardState {
  step: number;
  operationType: OperationType | '';
  requestedBy: string;
  requestedByEmail: string;
  unitCode: string;
  unitName: string;
  projectCode: string;
  projectName: string;
  costCenter: string;
  isUrgent: boolean;
  notes: string;
  contractCategory: ContractCategory | '';
  contractType: ContractType | '';
  modType: 'mod09' | 'mod10' | '';
  resourceId: string;
  resource: Resource | null;
  isNewResource: boolean;
  newResourceName: string;
  newResourceEmail: string;
  newResourceCF?: string;
  newResourceBirthDate?: string;
  newResourceNationality?: string;
  mod09: Partial<Mod09Data>;
  mod10: Partial<Mod10Data>;
  documents: ProcessDocument[];
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface Props {
  currentRole: UserRole;
  onSave: (process: ContractProcess) => void;
  onCancel: () => void;
  existingProcesses: ContractProcess[];
}

/* ── Step config ─────────────────────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: 'Avvio' },
  { num: 2, label: 'Risorsa' },
  { num: 3, label: 'Contratto' },
  { num: 4, label: 'Dettaglio' },
  { num: 5, label: 'Documenti' },
  { num: 6, label: 'Riepilogo' },
];

/* ── Validation per step ─────────────────────────────────────────────────── */
function validateStep(step: number, state: WizardState): string[] {
  const errors: string[] = [];
  if (step === 1) {
    if (!state.operationType) errors.push('Seleziona il tipo di operazione');
    if (!state.requestedBy.trim()) errors.push('Inserisci il richiedente');
    if (!state.unitCode) errors.push('Seleziona l\'unità di struttura');
    if (!state.projectCode) errors.push('Seleziona il progetto');
  }
  if (step === 2) {
    if (!state.isNewResource && !state.resourceId) {
      errors.push('Seleziona una risorsa esistente o scegli "Nuova Risorsa"');
    }
    if (state.isNewResource) {
      if (!state.newResourceName.trim()) errors.push('Inserisci il nome della nuova risorsa');
      if (!state.newResourceEmail.trim()) errors.push('Inserisci l\'email della nuova risorsa');
    }
  }
  if (step === 3) {
    if (!state.contractCategory) errors.push('Seleziona la categoria contrattuale');
    if (!state.contractType) errors.push('Seleziona il tipo di contratto');
  }
  if (step === 4) {
    if (state.modType === 'mod09') {
      if (!state.mod09.activityObject?.trim()) errors.push('Inserisci l\'oggetto della prestazione');
      if (!state.mod09.startDate) errors.push('Inserisci la data di inizio');
      if (!state.mod09.endDate) errors.push('Inserisci la data di fine');
      if (!state.mod09.grossCompensation || state.mod09.grossCompensation <= 0)
        errors.push('Inserisci il compenso lordo mensile');
    }
    if (state.modType === 'mod10') {
      if (!state.mod10.ccnl) errors.push('Seleziona il CCNL');
      if (!state.mod10.contractLevel) errors.push('Seleziona il livello contrattuale');
      if (!state.mod10.profession) errors.push('Seleziona il profilo professionale');
      if (!state.mod10.qualProf) errors.push('Seleziona la qualifica professionale');
      if (!state.mod10.ral || state.mod10.ral <= 0) errors.push('Inserisci la RAL');
      if (!state.mod10.startDate) errors.push('Inserisci la data di inizio');
      if (!state.mod10.isTimeIndeterminate && !state.mod10.endDate) errors.push('Inserisci la data di fine');
      if (!state.mod10.activityDescription?.trim()) errors.push('Inserisci la descrizione dell\'attività');
    }
  }
  return errors;
}

/* ── Build ContractProcess from WizardState ──────────────────────────────── */
function buildProcess(
  state: WizardState,
  existingProcesses: ContractProcess[],
  asBozza: boolean
): ContractProcess {
  const now = new Date().toISOString();
  const id = `PROC-${new Date().getFullYear()}-${String(existingProcesses.length + 1).padStart(3, '0')}`;
  const status = asBozza ? 'bozza' : 'approvazione-rs';

  const isEU = state.resource?.isEU ?? true;
  const docs =
    state.documents.length > 0
      ? state.documents
      : getRequiredDocs(state.contractType, state.isNewResource, isEU);

  const process: ContractProcess = {
    id,
    createdAt: now,
    updatedAt: now,
    status,
    operationType: state.operationType as OperationType,
    requestedBy: state.requestedBy,
    requestedByEmail: state.requestedByEmail,
    unitCode: state.unitCode,
    unitName: state.unitName,
    projectCode: state.projectCode,
    projectName: state.projectName,
    costCenter: state.costCenter,
    isUrgent: state.isUrgent,
    notes: state.notes,
    contractCategory: state.contractCategory as ContractCategory || undefined,
    contractType: state.contractType as ContractType || undefined,
    modType: (state.modType as 'mod09' | 'mod10') || undefined,
    resourceId: state.resourceId || undefined,
    resource: state.resource ?? undefined,
    isNewResource: state.isNewResource,
    newResourceName: state.isNewResource ? state.newResourceName : undefined,
    newResourceEmail: state.isNewResource ? state.newResourceEmail : undefined,
    mod09: state.modType === 'mod09' ? (state.mod09 as Mod09Data) : undefined,
    mod10: state.modType === 'mod10' ? (state.mod10 as Mod10Data) : undefined,
    approvals: [
      { id: 'A1', role: 'rs',       name: state.requestedBy, status: 'pending' },
      { id: 'A2', role: 'direttore', name: '—',              status: 'pending' },
      { id: 'A3', role: 'gru',      name: 'Team GRU',        status: 'pending' },
      { id: 'A4', role: 'amm',      name: 'Ufficio AMM',     status: 'pending' },
    ],
    documents: docs,
    history: [
      {
        id: 'H1',
        timestamp: now,
        action: asBozza ? 'Bozza creata' : 'Processo avviato',
        actor: CURRENT_USER.name,
        actorRole: 'Responsabile Struttura',
        toStatus: status,
      },
    ],
    mod13Submitted: false,
    mod138Required:
      state.contractType === 'cococo' || state.contractType === 'subordinato-td',
    mod138Submitted: false,
    mod102Required: state.contractType === 'cococo',
    mod102Submitted: false,
    mod14Required:
      state.contractType === 'subordinato-td' || state.contractType === 'subordinato-ti',
    mod14Submitted: false,
    zucchettiLoaded: false,
  };
  return process;
}

/* ── ContractWizard Component ─────────────────────────────────────────────── */
export function ContractWizard({ currentRole, onSave, onCancel, existingProcesses }: Props) {
  const [state, setState] = useState<WizardState>({
    step: 1,
    operationType: '',
    requestedBy: CURRENT_USER.name,
    requestedByEmail: CURRENT_USER.email,
    unitCode: '',
    unitName: '',
    projectCode: '',
    projectName: '',
    costCenter: '',
    isUrgent: false,
    notes: '',
    contractCategory: '',
    contractType: '',
    modType: '',
    resourceId: '',
    resource: null,
    isNewResource: false,
    newResourceName: '',
    newResourceEmail: '',
    mod09: {},
    mod10: {},
    documents: [],
  });

  const [submitConfirmed, setSubmitConfirmed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<'draft' | 'submitted' | null>(null);

  const onChange = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
    setValidationErrors([]);
  };

  const goTo = (newStep: number) => {
    setState(prev => ({ ...prev, step: newStep }));
    setValidationErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const errors = validateStep(state.step, state);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    if (state.step < 6) goTo(state.step + 1);
  };

  const handleBack = () => {
    if (state.step > 1) goTo(state.step - 1);
  };

  const handleSaveDraft = () => {
    const process = buildProcess(state, existingProcesses, true);
    setSaveSuccess('draft');
    setTimeout(() => {
      onSave(process);
    }, 800);
  };

  const handleSubmit = () => {
    if (!submitConfirmed) {
      setValidationErrors(['Devi confermare la dichiarazione di conformità prima di inviare']);
      return;
    }
    const process = buildProcess(state, existingProcesses, false);
    setSaveSuccess('submitted');
    setTimeout(() => {
      onSave(process);
    }, 800);
  };

  const isLastStep = state.step === 6;
  const currentStepErrors = validationErrors;

  /* ── Step title map ── */
  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'Avvio Richiesta', subtitle: 'Definisci il tipo di operazione, richiedente, unità e progetto' },
    2: { title: 'Risorsa', subtitle: 'Seleziona la risorsa esistente o inserisci i dati di una nuova' },
    3: { title: 'Tipo Contratto', subtitle: 'Scegli la categoria e il tipo contrattuale' },
    4: {
      title: state.modType === 'mod10' ? 'Dettaglio Contratto — MOD10' : 'Dettaglio Contratto — MOD09',
      subtitle: state.modType === 'mod10'
        ? 'Completa i dati del contratto subordinato (MOD10)'
        : 'Completa i dati del contratto non subordinato (MOD09)',
    },
    5: { title: 'Documenti Richiesti', subtitle: 'Verifica i documenti necessari per il contratto' },
    6: { title: 'Riepilogo e Invio', subtitle: 'Controlla tutti i dati prima di inviare la richiesta' },
  };

  const { title, subtitle } = stepTitles[state.step];

  if (saveSuccess) {
    return (
      <div className="wizard-container">
        <div className="wizard-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {saveSuccess === 'draft' ? '💾' : '✅'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {saveSuccess === 'draft' ? 'Bozza salvata con successo' : 'Processo inviato con successo'}
          </div>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            {saveSuccess === 'draft'
              ? 'La richiesta è stata salvata come bozza. Puoi riprenderla dalla bacheca dei processi.'
              : 'Il processo è stato avviato ed è in attesa di approvazione dal Responsabile di Struttura.'}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
            Reindirizzamento in corso...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-container">
      {/* ── Header ── */}
      <div className="wizard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: 10,
              background: '#295fa9', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <i className="bi bi-file-earmark-plus" style={{ color: 'white', fontSize: 18 }} />
          </div>
          <div>
            <div className="wizard-title">Nuovo Processo Contratto HR</div>
            <div className="wizard-subtitle">Fondazione CMCC — Sistema Helios</div>
          </div>
          {state.isUrgent && (
            <span className="tag tag-amber" style={{ marginLeft: 'auto', fontSize: 12 }}>
              <i className="bi bi-lightning-fill me-1" />
              URGENTE
            </span>
          )}
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="wizard-body" style={{ padding: '20px 28px 16px' }}>
        <div className="wizard-step-stepper">
          {STEPS.map((s, i) => {
            const isDone = state.step > s.num;
            const isActive = state.step === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  className={`wz-step${isActive ? ' active' : isDone ? ' done' : ''}`}
                  style={{ cursor: isDone ? 'pointer' : 'default', flexShrink: 0 }}
                  onClick={() => isDone && goTo(s.num)}
                >
                  <div className="wz-step-num">
                    {isDone
                      ? <i className="bi bi-check" style={{ fontSize: 13 }} />
                      : s.num
                    }
                  </div>
                  <div className="wz-step-text">{s.label}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`wz-connector${isDone ? ' done' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step title */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            Step {state.step}: {title}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{subtitle}</div>
        </div>
      </div>

      {/* ── Body Step ── */}
      <div className="wizard-body">
        {state.step === 1 && <Step1Avvio state={state} onChange={onChange} />}
        {state.step === 2 && <Step2Risorsa state={state} onChange={onChange} />}
        {state.step === 3 && <Step3Contratto state={state} onChange={onChange} />}
        {state.step === 4 && state.modType === 'mod09' && <Step4Mod09 state={state} onChange={onChange} />}
        {state.step === 4 && state.modType === 'mod10' && <Step4Mod10 state={state} onChange={onChange} />}
        {state.step === 4 && !state.modType && (
          <div className="alert-cmcc warning">
            <i className="bi bi-exclamation-triangle me-2" />
            Torna allo Step 3 e seleziona il tipo di contratto per procedere con la compilazione del modulo.
          </div>
        )}
        {state.step === 5 && <Step5Documenti state={state} onChange={onChange} />}
        {state.step === 6 && (
          <Step6Riepilogo
            state={state}
            onChange={onChange}
            onConfirmChange={setSubmitConfirmed}
            confirmed={submitConfirmed}
          />
        )}

        {/* Validation errors */}
        {currentStepErrors.length > 0 && (
          <div className="alert-cmcc danger mt-4">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              <i className="bi bi-x-circle me-2" />
              Completa i campi obbligatori:
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {currentStepErrors.map((e, i) => (
                <li key={i} style={{ fontSize: 13 }}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="wizard-actions">
        {/* Left: Annulla */}
        <button
          type="button"
          className="btn btn-cmcc-ghost"
          onClick={onCancel}
        >
          <i className="bi bi-x-circle me-2" />
          Annulla
        </button>

        {/* Center: Salva Bozza */}
        <button
          type="button"
          className="btn btn-cmcc-secondary"
          onClick={handleSaveDraft}
        >
          <i className="bi bi-floppy me-2" />
          Salva Bozza
        </button>

        {/* Right: Indietro + Avanti/Invia */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-cmcc-ghost"
            disabled={state.step === 1}
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2" />
            Indietro
          </button>

          {!isLastStep ? (
            <button
              type="button"
              className="btn btn-cmcc-primary"
              onClick={handleNext}
            >
              Avanti
              <i className="bi bi-arrow-right ms-2" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-cmcc-primary"
              disabled={!submitConfirmed}
              onClick={handleSubmit}
            >
              <i className="bi bi-send me-2" />
              Invia Processo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
