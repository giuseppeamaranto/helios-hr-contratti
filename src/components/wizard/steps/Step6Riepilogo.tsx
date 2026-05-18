import { useState } from 'react';
import { OPERATION_LABELS, CONTRACT_TYPE_LABELS } from '../../../data/mockData';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onConfirmChange: (confirmed: boolean) => void;
  confirmed: boolean;
}

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="summary-row">
      <div className="summary-key">{label}</div>
      <div className="summary-value">{value}</div>
    </div>
  );
}

function docStatusBadge(status: string) {
  switch (status) {
    case 'caricato':  return <span className="tag tag-green">Caricato</span>;
    case 'verificato':return <span className="tag tag-blue">Verificato</span>;
    default:          return <span className="tag tag-gray">In attesa</span>;
  }
}

export function Step6Riepilogo({ state, onConfirmChange, confirmed }: Props) {
  const [localConfirmed, setLocalConfirmed] = useState(confirmed);

  const handleConfirmChange = (v: boolean) => {
    setLocalConfirmed(v);
    onConfirmChange(v);
  };

  const resourceName = state.isNewResource
    ? state.newResourceName || '—'
    : state.resource?.fullName || '—';

  const resourceEmail = state.isNewResource
    ? state.newResourceEmail || '—'
    : state.resource?.email || '—';

  const modType = state.modType?.toUpperCase() ?? '—';
  const contractLabel = state.contractType ? CONTRACT_TYPE_LABELS[state.contractType] ?? state.contractType : '—';
  const categoryLabel = state.contractCategory === 'non-subordinato' ? 'Non Subordinato' : state.contractCategory === 'subordinato' ? 'Subordinato' : '—';

  return (
    <div>
      {/* ── Sezione Richiesta ── */}
      <div className="summary-section">
        <div className="summary-section-header">
          <i className="bi bi-file-earmark-text" />
          Richiesta
        </div>
        <SummaryRow label="Tipo Operazione"  value={OPERATION_LABELS[state.operationType] ?? state.operationType} />
        <SummaryRow label="Richiedente"       value={state.requestedBy} />
        <SummaryRow label="Email Richiedente" value={state.requestedByEmail} />
        <SummaryRow label="Unità Struttura"   value={state.unitName || state.unitCode} />
        <SummaryRow label="Progetto"          value={`${state.projectCode} — ${state.projectName}`} />
        <SummaryRow label="Centro di Costo"   value={state.costCenter} />
        <div className="summary-row">
          <div className="summary-key">Urgenza</div>
          <div className="summary-value">
            {state.isUrgent
              ? <span className="tag tag-amber"><i className="bi bi-lightning me-1" />Richiesta Urgente</span>
              : <span className="tag tag-gray">Standard</span>
            }
          </div>
        </div>
        {state.notes && <SummaryRow label="Note" value={state.notes} />}
      </div>

      {/* ── Sezione Risorsa ── */}
      <div className="summary-section">
        <div className="summary-section-header">
          <i className="bi bi-person" />
          Risorsa
        </div>
        <div className="summary-row">
          <div className="summary-key">Tipo Risorsa</div>
          <div className="summary-value">
            {state.isNewResource
              ? <span className="tag tag-amber">Nuova Risorsa</span>
              : <span className="tag tag-green">Risorsa Esistente</span>
            }
          </div>
        </div>
        <SummaryRow label="Nome Completo" value={resourceName} />
        <SummaryRow label="Email"         value={resourceEmail} />
        {!state.isNewResource && state.resource && (
          <>
            <SummaryRow label="Codice Fiscale" value={state.resource.cf} />
            <SummaryRow label="Unità Attuale"  value={state.resource.unitCode} />
            <SummaryRow label="Contratto Att." value={state.resource.contractType} />
          </>
        )}
      </div>

      {/* ── Sezione Contratto ── */}
      <div className="summary-section">
        <div className="summary-section-header">
          <i className="bi bi-briefcase" />
          Contratto
        </div>
        <SummaryRow label="Categoria"    value={categoryLabel} />
        <SummaryRow label="Tipo"         value={contractLabel} />
        <div className="summary-row">
          <div className="summary-key">Modulo</div>
          <div className="summary-value">
            <span className="tag tag-blue">{modType}</span>
          </div>
        </div>
      </div>

      {/* ── Dettaglio MOD09 ── */}
      {state.modType === 'mod09' && state.mod09 && (
        <div className="summary-section">
          <div className="summary-section-header">
            <i className="bi bi-file-earmark-check" />
            Dettaglio Contratto MOD09
          </div>
          <SummaryRow label="Tipo contratto"       value={state.mod09.contractTypeMod09} />
          <SummaryRow label="Oggetto prestazione"  value={state.mod09.activityObject} />
          <SummaryRow label="Deliverable"          value={state.mod09.deliverables} />
          <SummaryRow label="Data Inizio"          value={state.mod09.startDate} />
          <SummaryRow label="Data Fine"            value={state.mod09.endDate} />
          <SummaryRow
            label="Compenso Lordo Mensile"
            value={state.mod09.grossCompensation
              ? `€ ${state.mod09.grossCompensation.toLocaleString('it-IT')}`
              : undefined}
          />
          <SummaryRow
            label="Modalità Pagamento"
            value={state.mod09.paymentSchedule}
          />
          <SummaryRow label="P.IVA"            value={state.mod09.vatRequired ? `Sì — ${state.mod09.vatNumber || 'non indicata'}` : 'No'} />
          <SummaryRow label="Luogo di Lavoro"  value={state.mod09.workLocation} />
          <SummaryRow label="Strumenti CMCC"   value={state.mod09.tools} />
          <SummaryRow label="Report a"         value={state.mod09.reportTo} />
        </div>
      )}

      {/* ── Dettaglio MOD10 ── */}
      {state.modType === 'mod10' && state.mod10 && (
        <div className="summary-section">
          <div className="summary-section-header">
            <i className="bi bi-file-earmark-check" />
            Dettaglio Contratto MOD10
          </div>
          <SummaryRow label="Tipo Contratto"      value={state.mod10.contractTypeMod10} />
          <SummaryRow label="Livello CCNL"       value={state.mod10.ccnlLevel} />
          <SummaryRow label="Mansione"           value={state.mod10.mansione} />
          <SummaryRow label="Qualifica"          value={state.mod10.qualifica} />
          <SummaryRow
            label="Lordo FT Annuale"
            value={state.mod10.grossSalaryFT ? `€ ${state.mod10.grossSalaryFT.toLocaleString('it-IT')} / anno` : undefined}
          />
          <SummaryRow
            label="Stipendio mensile"
            value={state.mod10.grossSalaryFT ? `€ ${(state.mod10.grossSalaryFT / 14).toLocaleString('it-IT', { minimumFractionDigits: 2 })} (÷ 14)` : undefined}
          />
          <SummaryRow
            label="Part-Time"
            value={(state.mod10.partTimePercent ?? 0) > 0 && (state.mod10.partTimePercent ?? 0) < 100
              ? `Sì — ${state.mod10.partTimePercent}%` : 'No'}
          />
          <SummaryRow label="Data Inizio"        value={state.mod10.startDate} />
          <SummaryRow
            label="Data Fine"
            value={state.mod10.endDate ?? '—'}
          />
          <SummaryRow label="Descrizione Att."   value={state.mod10.activityDescription} />
          <SummaryRow label="Luogo di Lavoro"    value={state.mod10.workLocation} />
          <SummaryRow
            label="Expatriate"
            value={state.mod10.isExpat ? `Sì — ${state.mod10.expatCountry || '?'}` : 'No'}
          />
        </div>
      )}

      {/* ── Documenti ── */}
      {state.documents.length > 0 && (
        <div className="summary-section">
          <div className="summary-section-header">
            <i className="bi bi-folder" />
            Documenti ({state.documents.filter(d => d.status !== 'attesa').length}/{state.documents.length} disponibili)
          </div>
          {state.documents.map(doc => (
            <div key={doc.id} className="summary-row" style={{ alignItems: 'center' }}>
              <div className="summary-key" style={{ fontSize: 12 }}>{doc.name}</div>
              <div className="summary-value">{docStatusBadge(doc.status)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alert Invio ── */}
      <div className="alert-cmcc info mb-3">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <i className="bi bi-send" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Informazioni sull'Invio</div>
            Inviando questa richiesta, il processo sarà messo in attesa di approvazione dal{' '}
            <strong>Responsabile di Struttura</strong>. Riceverai una notifica via email sull'avanzamento del processo.
          </div>
        </div>
      </div>

      {/* ── Dichiarazione di Conformità ── */}
      <div
        className={`checklist-item${localConfirmed ? ' done' : ''}`}
        onClick={() => handleConfirmChange(!localConfirmed)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <div className="check-circle">
          {localConfirmed && <i className="bi bi-check" style={{ fontSize: 12 }} />}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
            Confermo la correttezza e completezza delle informazioni
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Dichiaro che tutte le informazioni inserite sono accurate e autorizzate secondo le
            procedure CMCC vigenti.
          </div>
        </div>
      </div>

      {!localConfirmed && (
        <div className="alert-cmcc warning mt-2" style={{ padding: '8px 14px', fontSize: 12 }}>
          <i className="bi bi-exclamation-triangle me-2" />
          Devi confermare le informazioni prima di poter inviare il processo.
        </div>
      )}
    </div>
  );
}
