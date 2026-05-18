import { useState } from 'react';
import type { ContractProcess, UserRole, ProcessStatus, Approval } from '../../types';
import { STATUS_CONFIG, OPERATION_LABELS, CONTRACT_TYPE_LABELS } from '../../data/mockData';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  process: ContractProcess;
  currentRole: UserRole;
  onBack: () => void;
  onUpdate: (updates: Partial<ContractProcess>) => void;
}

type TabId = 'dettaglio' | 'documenti' | 'approvazioni' | 'storia';

// ── Stepper definition ────────────────────────────────────────────────────────
const STEPS: { status: ProcessStatus | string; label: string }[] = [
  { status: 'bozza',                  label: 'Bozza' },
  { status: 'approvazione-rs',        label: 'Approv. RS' },
  { status: 'approvazione-dir',       label: 'Approv. Dir.' },
  { status: 'verifica-gru',           label: 'Verifica GRU' },
  { status: 'elaborazione-gru',       label: 'Elaboraz. GRU' },
  { status: 'lettera-presentazione',  label: 'Lettera Present.' },
  { status: 'contratto-preparazione', label: 'Prep. Contratto' },
  { status: 'contratto-firma',        label: 'Firma' },
  { status: 'anagrafica',             label: 'Anagrafica' },
  { status: 'zucchetti',              label: 'Zucchetti' },
  { status: 'completato',             label: 'Completato' },
];

function getStepIndex(status: string): number {
  const idx = STEPS.findIndex(s => s.status === status);
  return idx >= 0 ? idx : -1;
}

// ── Helper: format date ───────────────────────────────────────────────────────
function fmt(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('it-IT', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('it-IT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ── Helper: avatar color based on name ───────────────────────────────────────
function avatarColor(name: string): string {
  const colors = ['#295fa9', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#0f766e', '#4338ca'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function initials(name: string): string {
  const parts = name.trim().split(' ');
  return (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '');
}

// ── Helper: role label ────────────────────────────────────────────────────────
function roleLabel(role: string): string {
  const map: Record<string, string> = {
    rs: 'Responsabile Struttura', direttore: 'Direttore', gru: 'Ufficio GRU', amm: 'Amministrazione',
  };
  return map[role] ?? role;
}

function roleChipClass(role: string): string {
  const map: Record<string, string> = { rs: 'rs', direttore: 'dir', gru: 'gru', amm: 'amm' };
  return `role-chip ${map[role] ?? ''}`;
}

// ── Document icon by type ─────────────────────────────────────────────────────
function docIcon(type: string): string {
  const map: Record<string, string> = {
    cv: 'bi-file-person', mod09: 'bi-file-earmark-text', mod10: 'bi-file-earmark-text',
    contratto: 'bi-file-earmark-check', 'documento-identita': 'bi-credit-card-2-front',
    'codice-fiscale': 'bi-person-badge', default: 'bi-file-earmark',
  };
  return `bi ${map[type] ?? map.default}`;
}

function docStatusStyle(status: string): React.CSSProperties {
  if (status === 'verificato') return { background: '#dcfce7', color: '#166534' };
  if (status === 'caricato')   return { background: '#dbeafe', color: '#1e40af' };
  return { background: '#f1f5f9', color: '#64748b' };
}

function docStatusLabel(status: string): string {
  const map: Record<string, string> = { verificato: 'Verificato', caricato: 'Caricato', attesa: 'In attesa' };
  return map[status] ?? status;
}

// ── Summary row ───────────────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="summary-row">
      <div className="summary-key">{label}</div>
      <div className="summary-value">{value ?? '—'}</div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="summary-section-header">
      <i className={`bi ${icon} text-cmcc-blue`} />
      {title}
    </div>
  );
}

// ── ChecklistItem ─────────────────────────────────────────────────────────────
function ChecklistItem({
  label, desc, submitted, required, onToggle,
}: {
  label: string; desc: string; submitted: boolean; required: boolean; onToggle?: () => void;
}) {
  return (
    <div
      className={`checklist-item${submitted ? ' done' : ''}`}
      onClick={onToggle}
    >
      <div className="check-circle">
        {submitted && <i className="bi bi-check" />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          {label}
          {!required && <span className="tag tag-gray ms-2" style={{ fontSize: 10 }}>Opzionale</span>}
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>{desc}</div>
      </div>
      <div>
        {submitted ? (
          <span className="tag tag-green">Inviato</span>
        ) : (
          <span className="tag tag-gray">Pendente</span>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ProcessDetail({ process: proc, currentRole, onBack, onUpdate }: Props) {
  const [activeTab, setActiveTab]   = useState<TabId>('dettaglio');
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [stepModal, setStepModal]   = useState<ProcessStatus | null>(null);
  const [stepModalNotes, setStepModalNotes] = useState('');

  const currentStepIdx = getStepIndex(proc.status);

  // ── Resource name display
  const resourceName = proc.resource?.fullName ?? proc.newResourceName ?? '—';

  // ── Next status map (simple linear flow)
  const nextStatusMap: Partial<Record<ProcessStatus, ProcessStatus>> = {
    'bozza':                   'approvazione-rs',
    'approvazione-rs':         'approvazione-dir',
    'approvazione-dir':        'verifica-gru',
    'verifica-gru':            'elaborazione-gru',
    'elaborazione-gru':        'lettera-presentazione',
    'lettera-presentazione':   'contratto-preparazione',
    'contratto-preparazione':  'contratto-firma',
    'contratto-firma':         'anagrafica',
    'anagrafica':              'zucchetti',
    'zucchetti':               'completato',
  };

  function advanceStatus(to: ProcessStatus, actor: string, action: string, notes?: string) {
    const now = new Date().toISOString();
    const newHistory = [
      ...proc.history,
      {
        id: `H${proc.history.length + 1}`,
        timestamp: now,
        action,
        actor,
        actorRole: roleLabel(currentRole),
        notes,
        toStatus: to,
      },
    ];
    onUpdate({ status: to, updatedAt: now, history: newHistory });
  }

  // ── Approval action
  function handleApproval(approval: Approval, approved: boolean, notesOverride?: string) {
    const now = new Date().toISOString();
    const notes = notesOverride ?? approvalNotes[approval.id] ?? '';
    const newApprovals = proc.approvals.map(a =>
      a.id === approval.id
        ? { ...a, status: (approved ? 'approved' : 'rejected') as 'approved' | 'rejected', timestamp: now, notes }
        : a
    );

    let newStatus: ProcessStatus = proc.status;
    let action = '';

    if (approved) {
      const next = nextStatusMap[proc.status];
      if (next) { newStatus = next; }
      action = `Approvato da ${roleLabel(approval.role)}`;
    } else {
      newStatus = 'respinto';
      action = `Respinto da ${roleLabel(approval.role)}`;
    }

    const newHistory = [
      ...proc.history,
      {
        id: `H${proc.history.length + 1}`,
        timestamp: now,
        action,
        actor: proc.requestedBy,
        actorRole: roleLabel(approval.role),
        notes: notes || undefined,
        toStatus: newStatus,
      },
    ];
    onUpdate({ approvals: newApprovals, status: newStatus, updatedAt: now, history: newHistory });
    setApprovalNotes(n => ({ ...n, [approval.id]: '' }));
  }

  // ── Document upload simulation
  function handleDocUpload(docId: string) {
    const now = new Date().toISOString();
    const newDocs = proc.documents.map(d =>
      d.id === docId ? { ...d, status: 'caricato' as const, uploadedAt: now, uploadedBy: 'utente@cmcc.it' } : d
    );
    onUpdate({ documents: newDocs, updatedAt: now });
  }

  // ── Checklist toggles
  function toggleMod(field: keyof Pick<ContractProcess,
    'mod13Submitted' | 'mod138Submitted' | 'mod102Submitted' | 'mod14Submitted'
  >) {
    onUpdate({ [field]: !proc[field], updatedAt: new Date().toISOString() } as Partial<ContractProcess>);
  }

  // ── Check if all required mods are submitted
  const allModsSubmitted =
    proc.mod13Submitted &&
    (!proc.mod138Required || proc.mod138Submitted) &&
    (!proc.mod102Required || proc.mod102Submitted) &&
    (!proc.mod14Required  || proc.mod14Submitted);

  // ── Zucchetti load
  function handleZucchetti() {
    const zucchettiId = `ZUC-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const newHistory = [
      ...proc.history,
      {
        id: `H${proc.history.length + 1}`,
        timestamp: now,
        action: `Caricato su Zucchetti — ID: ${zucchettiId}`,
        actor: 'Ufficio AMM',
        actorRole: 'AMM',
        toStatus: 'completato' as ProcessStatus,
      },
    ];
    onUpdate({ status: 'completato', zucchettiId, zucchettiLoaded: true, updatedAt: now, history: newHistory });
  }

  // ── Stepper click: determine if a step is actionable for current role
  type StepClickData = {
    title: string;
    desc: string;
    canReject: boolean;
    onApprove: () => void;
    onReject?: () => void;
  };

  function getStepClickData(stepStatus: string): StepClickData | null {
    if (proc.status !== stepStatus) return null;
    const isAdmin = currentRole === 'amm';
    const actor = isAdmin ? 'Ufficio AMM (override)' : proc.requestedBy;
    const closeModal = () => { setStepModal(null); setStepModalNotes(''); };
    const adminDesc = isAdmin ? ' (Admin — bypass ruolo)' : '';

    switch (stepStatus as ProcessStatus) {
      case 'bozza':
        if (currentRole !== 'rs' && !isAdmin) return null;
        return {
          title: 'Invia per Approvazione',
          desc: `Il processo verrà inviato per la prima approvazione RS.${adminDesc}`,
          canReject: false,
          onApprove: () => { advanceStatus('approvazione-rs', actor, 'Processo inviato per approvazione RS', stepModalNotes || undefined); closeModal(); },
        };
      case 'approvazione-rs': {
        if (currentRole !== 'rs' && !isAdmin) return null;
        const appr = proc.approvals.find(a => a.role === 'rs' && a.status === 'pending');
        return {
          title: 'Approvazione RS',
          desc: `Approva o respingi la richiesta.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            if (appr) handleApproval(appr, true, stepModalNotes || undefined);
            else advanceStatus('approvazione-dir', actor, 'Approvazione RS — override AMM', stepModalNotes || undefined);
            closeModal();
          },
          onReject: () => {
            if (appr) handleApproval(appr, false, stepModalNotes || undefined);
            else advanceStatus('respinto', actor, 'Processo respinto in fase RS — override AMM', stepModalNotes || undefined);
            closeModal();
          },
        };
      }
      case 'approvazione-dir': {
        if (currentRole !== 'direttore' && !isAdmin) return null;
        const appr = proc.approvals.find(a => a.role === 'direttore' && a.status === 'pending');
        return {
          title: 'Approvazione Direttore',
          desc: `Approva o respingi la richiesta come Direttore.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            if (appr) handleApproval(appr, true, stepModalNotes || undefined);
            else advanceStatus('verifica-gru', actor, 'Approvazione Direttore — override AMM', stepModalNotes || undefined);
            closeModal();
          },
          onReject: () => {
            if (appr) handleApproval(appr, false, stepModalNotes || undefined);
            else advanceStatus('respinto', actor, 'Processo respinto in fase Direttore — override AMM', stepModalNotes || undefined);
            closeModal();
          },
        };
      }
      case 'verifica-gru':
        if (currentRole !== 'gru' && !isAdmin) return null;
        return {
          title: 'Verifica GRU',
          desc: `Conferma di aver verificato la documentazione e avanza il processo.${adminDesc}`,
          canReject: false,
          onApprove: () => { advanceStatus('elaborazione-gru', isAdmin ? actor : 'Team GRU', 'Verifica GRU completata', stepModalNotes || undefined); closeModal(); },
        };
      case 'elaborazione-gru':
        if (currentRole !== 'gru' && !isAdmin) return null;
        return {
          title: 'Elaborazione GRU',
          desc: `Conferma il completamento dell'elaborazione GRU.${adminDesc}`,
          canReject: false,
          onApprove: () => { advanceStatus('lettera-presentazione', isAdmin ? actor : 'Team GRU', 'Elaborazione GRU completata', stepModalNotes || undefined); closeModal(); },
        };
      case 'lettera-presentazione':
        if (currentRole !== 'gru' && !isAdmin) return null;
        return {
          title: 'Lettera di Presentazione',
          desc: `Conferma l'invio della lettera di presentazione alla risorsa.${adminDesc}`,
          canReject: false,
          onApprove: () => { advanceStatus('contratto-preparazione', isAdmin ? actor : 'Team GRU', 'Lettera di presentazione inviata', stepModalNotes || undefined); closeModal(); },
        };
      case 'contratto-preparazione':
        return {
          title: 'Preparazione Contratto',
          desc: `Invia il contratto per la firma delle parti.${adminDesc}`,
          canReject: false,
          onApprove: () => { advanceStatus('contratto-firma', 'Ufficio AMM', 'Contratto inviato per firma', stepModalNotes || undefined); closeModal(); },
        };
      case 'contratto-firma':
        return {
          title: 'Firma Contratto',
          desc: 'Segna il contratto come firmato da tutte le parti.',
          canReject: false,
          onApprove: () => { advanceStatus('anagrafica', 'Sistema', 'Contratto firmato da tutte le parti', stepModalNotes || undefined); closeModal(); },
        };
      case 'anagrafica':
        if (!allModsSubmitted && !isAdmin) return null;
        return {
          title: 'Avanza ad Anagrafica → Zucchetti',
          desc: allModsSubmitted
            ? 'Tutti i moduli sono stati inviati. Avanza il processo alla fase Zucchetti.'
            : `Avanzamento forzato alla fase Zucchetti.${adminDesc}`,
          canReject: false,
          onApprove: () => {
            advanceStatus('zucchetti', isAdmin ? actor : 'Ufficio AMM', 'Fase anagrafica completata — avanzamento a Zucchetti', stepModalNotes || undefined);
            closeModal();
          },
        };
      case 'zucchetti':
        if (!isAdmin) return null;
        return {
          title: 'Caricamento Zucchetti',
          desc: `Carica i dati su Zucchetti e completa il processo.${adminDesc}`,
          canReject: false,
          onApprove: () => { handleZucchetti(); closeModal(); },
        };
      default:
        return null;
    }
  }

  return (
    <div>
      {/* ── Process Detail Header ─────────────────────────────────────── */}
      <div className="process-detail-header">
        {/* Back + ID row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button className="btn btn-cmcc-ghost" style={{ padding: '5px 14px', fontSize: 13 }} onClick={onBack}>
            <i className="bi bi-arrow-left me-2" />
            Processi
          </button>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b', fontWeight: 700 }}>
            {proc.id}
          </span>
          {proc.isUrgent && (
            <span className="tag tag-amber">
              <i className="bi bi-exclamation-triangle-fill me-1" />
              URGENTE
            </span>
          )}
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="detail-title">{resourceName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <StatusBadge status={proc.status} />
              {proc.contractType && (
                <span className="tag tag-blue">{CONTRACT_TYPE_LABELS[proc.contractType] ?? proc.contractType}</span>
              )}
              <span className="tag tag-gray">
                <i className="bi bi-building me-1" />{proc.unitCode}
              </span>
              <span className="tag tag-gray">
                <i className="bi bi-person me-1" />{OPERATION_LABELS[proc.operationType] ?? proc.operationType}
              </span>
            </div>
          </div>

          {/* Contextual primary action */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {proc.status === 'bozza' && (
              <button
                className="btn btn-cmcc-primary"
                onClick={() => advanceStatus('approvazione-rs', proc.requestedBy, 'Processo inviato per approvazione RS')}
              >
                <i className="bi bi-send me-2" />
                Invia per Approvazione
              </button>
            )}
            {proc.status === 'contratto-firma' && (
              <button
                className="btn btn-cmcc-success"
                onClick={() => advanceStatus('anagrafica', 'Sistema', 'Contratto firmato da tutte le parti')}
              >
                <i className="bi bi-pen me-2" />
                Segna Contratto Firmato
              </button>
            )}
            {currentRole === 'gru' && proc.status === 'verifica-gru' && (
              <button
                className="btn btn-cmcc-primary"
                onClick={() => advanceStatus('elaborazione-gru', 'Team GRU', 'Verifica GRU completata — avanzamento a elaborazione')}
              >
                <i className="bi bi-clipboard-check me-2" />
                Approva e Avanza
              </button>
            )}
            {currentRole === 'gru' && proc.status === 'elaborazione-gru' && (
              <button
                className="btn btn-cmcc-primary"
                onClick={() => advanceStatus('lettera-presentazione', 'Team GRU', 'Elaborazione GRU completata')}
              >
                <i className="bi bi-gear me-2" />
                Completa Elaborazione
              </button>
            )}
            {currentRole === 'amm' && proc.status === 'contratto-preparazione' && (
              <button
                className="btn btn-cmcc-primary"
                onClick={() => advanceStatus('contratto-firma', 'Ufficio AMM', 'Contratto inviato per firma')}
              >
                <i className="bi bi-file-earmark-check me-2" />
                Invia per Firma
              </button>
            )}
            {currentRole === 'amm' && proc.status === 'anagrafica' && allModsSubmitted && (
              <button
                className="btn btn-cmcc-primary"
                onClick={() => advanceStatus('zucchetti', 'Ufficio AMM', 'Fase anagrafica completata — avanzamento a Zucchetti')}
              >
                <i className="bi bi-arrow-right-circle me-2" />
                Avanza a Zucchetti
              </button>
            )}
            {currentRole === 'amm' && proc.status === 'zucchetti' && (
              <button className="btn btn-cmcc-success" onClick={handleZucchetti}>
                <i className="bi bi-upload me-2" />
                Carica su Zucchetti
              </button>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="detail-meta-row">
          <div className="detail-meta-item">
            <i className="bi bi-person-circle" />
            Richiesto da <strong className="ms-1">{proc.requestedBy}</strong>
          </div>
          <div className="detail-meta-item">
            <i className="bi bi-briefcase" />
            {proc.projectName}
          </div>
          <div className="detail-meta-item">
            <i className="bi bi-calendar3" />
            Creato {fmt(proc.createdAt)}
          </div>
          <div className="detail-meta-item">
            <i className="bi bi-clock-history" />
            Aggiornato {fmt(proc.updatedAt)}
          </div>
          {proc.zucchettiId && (
            <div className="detail-meta-item">
              <i className="bi bi-check-circle-fill" style={{ color: '#16a34a' }} />
              Zucchetti: <strong className="ms-1" style={{ color: '#16a34a' }}>{proc.zucchettiId}</strong>
            </div>
          )}
        </div>
      </div>

      {/* ── Stepper ──────────────────────────────────────────────────── */}
      <div className="card-cmcc" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div className="process-stepper">
          {STEPS.map((step, idx) => {
            let stepState: 'done' | 'active' | '' = '';
            if (proc.status === 'annullato' || proc.status === 'respinto') {
              stepState = '';
            } else if (idx < currentStepIdx) {
              stepState = 'done';
            } else if (idx === currentStepIdx) {
              stepState = 'active';
            }

            const clickData = getStepClickData(step.status);
            const isClickable = !!clickData;

            return (
              <div
                key={step.status}
                className={`step-item${stepState ? ' ' + stepState : ''}${isClickable ? ' step-item-clickable' : ''}`}
                onClick={isClickable ? () => setStepModal(step.status as ProcessStatus) : undefined}
                style={isClickable ? { cursor: 'pointer' } : undefined}
                title={isClickable ? `Azione: ${clickData!.title}` : undefined}
              >
                <div className={`step-circle${isClickable ? ' step-circle-clickable' : ''}`}>
                  {stepState === 'done'
                    ? <i className="bi bi-check" />
                    : isClickable
                    ? <i className="bi bi-lightning-fill" style={{ fontSize: 11 }} />
                    : <span>{idx}</span>
                  }
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            );
          })}
        </div>

        {(proc.status === 'annullato' || proc.status === 'respinto') && (
          <div className="alert-cmcc danger mt-2" style={{ marginBottom: 0 }}>
            <i className={`bi ${proc.status === 'annullato' ? 'bi-x-circle-fill' : 'bi-x-octagon-fill'} me-2`} />
            Processo <strong>{proc.status === 'annullato' ? 'annullato' : 'respinto'}</strong>.
          </div>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="cmcc-tabs">
        {(
          [
            { id: 'dettaglio',    label: 'Dettaglio',   icon: 'bi-info-circle' },
            { id: 'documenti',    label: 'Documenti',   icon: 'bi-paperclip',  count: proc.documents.length },
            { id: 'approvazioni', label: 'Approvazioni',icon: 'bi-person-check', count: proc.approvals.length },
            { id: 'storia',       label: 'Storia',      icon: 'bi-clock-history', count: proc.history.length },
          ] as { id: TabId; label: string; icon: string; count?: number }[]
        ).map(t => (
          <button
            key={t.id}
            className={`cmcc-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <i className={`bi ${t.icon}`} />
            {t.label}
            {t.count !== undefined && (
              <span
                style={{
                  fontSize: 10, fontWeight: 700, background: activeTab === t.id ? '#295fa9' : '#e2e8f0',
                  color: activeTab === t.id ? 'white' : '#64748b',
                  borderRadius: 10, padding: '1px 6px', marginLeft: 2,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Dettaglio ───────────────────────────────────────────── */}
      {activeTab === 'dettaglio' && (
        <div>
          {/* Informazioni richiesta */}
          <div className="summary-section card-cmcc mb-3">
            <SectionHeader icon="bi-file-earmark-text" title="Informazioni Richiesta" />
            <SummaryRow label="ID Processo"      value={<span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{proc.id}</span>} />
            <SummaryRow label="Tipo Operazione"  value={OPERATION_LABELS[proc.operationType] ?? proc.operationType} />
            <SummaryRow label="Richiedente"      value={proc.requestedBy} />
            <SummaryRow label="Email richiedente" value={proc.requestedByEmail} />
            <SummaryRow label="Unità"            value={proc.unitName} />
            <SummaryRow label="Progetto"         value={`${proc.projectCode} — ${proc.projectName}`} />
            <SummaryRow label="Centro di Costo"  value={proc.costCenter} />
            <SummaryRow label="Urgente"          value={proc.isUrgent ? <span className="tag tag-amber">Sì</span> : 'No'} />
            {proc.notes && <SummaryRow label="Note" value={proc.notes} />}
            {proc.contractType && (
              <SummaryRow label="Tipo Contratto" value={CONTRACT_TYPE_LABELS[proc.contractType] ?? proc.contractType} />
            )}
            {proc.contractCategory && (
              <SummaryRow label="Categoria"      value={proc.contractCategory === 'subordinato' ? 'Subordinato' : 'Non Subordinato'} />
            )}
            {proc.modType && (
              <SummaryRow label="Modulo"         value={proc.modType.toUpperCase()} />
            )}
          </div>

          {/* Risorsa */}
          <div className="summary-section card-cmcc mb-3">
            <SectionHeader icon="bi-person-circle" title="Risorsa" />
            {proc.isNewResource ? (
              <>
                <SummaryRow label="Nome"   value={<><span className="tag tag-green me-2">Nuovo</span>{proc.newResourceName}</>} />
                <SummaryRow label="Email"  value={proc.newResourceEmail} />
              </>
            ) : proc.resource ? (
              <>
                <SummaryRow label="Nome completo"      value={proc.resource.fullName} />
                <SummaryRow label="Email istituzionale" value={proc.resource.email} />
                {proc.resource.emailPrivate && <SummaryRow label="Email privata" value={proc.resource.emailPrivate} />}
                <SummaryRow label="Codice Fiscale"     value={<span style={{ fontFamily: 'monospace' }}>{proc.resource.cf}</span>} />
                <SummaryRow label="Data di nascita"    value={fmt(proc.resource.birthDate)} />
                <SummaryRow label="Paese nascita"      value={proc.resource.birthCountry} />
                <SummaryRow label="Paese residenza"    value={proc.resource.residenceCountry} />
                <SummaryRow label="Unità"              value={proc.resource.unit} />
                <SummaryRow label="Sede"               value={proc.resource.sede} />
                <SummaryRow label="Professione"        value={proc.resource.profession} />
                <SummaryRow label="Qualifica Prof."    value={proc.resource.qualProf} />
                <SummaryRow label="Titolo di studio"   value={proc.resource.study} />
                <SummaryRow label="Tipo Contratto att." value={proc.resource.contractType} />
                <SummaryRow label="Natura Contratto"   value={proc.resource.contractNature} />
                <SummaryRow label="CCNL"               value={proc.resource.ccnl} />
                {proc.resource.ccnlLevel && <SummaryRow label="Livello CCNL" value={proc.resource.ccnlLevel} />}
                <SummaryRow label="Part-time"          value={proc.resource.isPartTime ? `Sì — ${proc.resource.partTimePercent}%` : 'No'} />
                <SummaryRow label="UE"                 value={proc.resource.isEU ? 'Sì' : 'No'} />
                <SummaryRow label="Inizio contratto"   value={fmt(proc.resource.startDate)} />
                {proc.resource.endDate && <SummaryRow label="Fine contratto" value={fmt(proc.resource.endDate)} />}
              </>
            ) : (
              <div className="summary-row" style={{ color: '#64748b', fontStyle: 'italic' }}>
                Nessuna risorsa associata
              </div>
            )}
          </div>

          {/* MOD09 */}
          {proc.modType === 'mod09' && proc.mod09 && (
            <div className="summary-section card-cmcc mb-3">
              <SectionHeader icon="bi-file-earmark-text" title="Dati Contratto MOD09" />
              <SummaryRow label="Tipo Contratto"       value={proc.mod09.contractTypeMod09} />
              <SummaryRow label="Oggetto Attività"     value={proc.mod09.activityObject} />
              <SummaryRow label="Deliverable"          value={proc.mod09.deliverables} />
              <SummaryRow label="Data Inizio"          value={fmt(proc.mod09.startDate)} />
              <SummaryRow label="Data Fine"            value={fmt(proc.mod09.endDate)} />
              <SummaryRow label="Compenso Lordo (€/mese)"
                value={proc.mod09.grossCompensation.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
              />
              <SummaryRow label="Cadenza Pagamento"    value={proc.mod09.paymentSchedule} />
              <SummaryRow label="IVA"                  value={proc.mod09.vatRequired ? `Sì — P.IVA ${proc.mod09.vatNumber}` : 'Non richiesta'} />
              <SummaryRow label="Luogo di lavoro"      value={proc.mod09.workLocation} />
              <SummaryRow label="Strumenti forniti"    value={proc.mod09.tools} />
              <SummaryRow label="Riferisce a"          value={proc.mod09.reportTo} />
            </div>
          )}

          {/* MOD10 */}
          {proc.modType === 'mod10' && proc.mod10 && (
            <div className="summary-section card-cmcc mb-3">
              <SectionHeader icon="bi-file-earmark-text" title="Dati Contratto MOD10" />
              <SummaryRow label="Tipo Contratto"       value={proc.mod10.contractTypeMod10} />
              <SummaryRow label="Livello CCNL"         value={proc.mod10.ccnlLevel} />
              <SummaryRow label="Mansione"             value={proc.mod10.mansione} />
              <SummaryRow label="Qualifica"            value={proc.mod10.qualifica} />
              <SummaryRow label="Lordo FT (€/anno)"
                value={proc.mod10.grossSalaryFT.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
              />
              <SummaryRow label="Part-time"
                value={(proc.mod10.partTimePercent > 0 && proc.mod10.partTimePercent < 100)
                  ? `Sì — ${proc.mod10.partTimePercent}%` : 'No'} />
              <SummaryRow label="Data Inizio"          value={fmt(proc.mod10.startDate)} />
              <SummaryRow label="Data Fine"            value={fmt(proc.mod10.endDate)} />
              <SummaryRow label="Descrizione Attività" value={proc.mod10.activityDescription} />
              <SummaryRow label="Luogo di lavoro"      value={proc.mod10.workLocation} />
              <SummaryRow label="Expat"                value={proc.mod10.isExpat ? `Sì — ${proc.mod10.expatCountry}` : 'No'} />
            </div>
          )}

          {/* Checklist Moduli */}
          <div className="card-cmcc" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="summary-section-header" style={{ borderRadius: 0 }}>
              <i className="bi bi-check2-all text-cmcc-blue" />
              Checklist Moduli
            </div>
            <div style={{ padding: '14px' }}>
              <ChecklistItem
                label="MOD13 — Comunicazione Avvio Collaborazione"
                desc="Modulo obbligatorio per avvio di ogni nuova collaborazione"
                submitted={proc.mod13Submitted}
                required={true}
                onToggle={() => toggleMod('mod13Submitted')}
              />
              {proc.mod138Required && (
                <ChecklistItem
                  label="MOD13.8 — Dichiarazione Antimafia"
                  desc="Richiesta per contratti superiori a soglia normativa"
                  submitted={proc.mod138Submitted}
                  required={true}
                  onToggle={() => toggleMod('mod138Submitted')}
                />
              )}
              {proc.mod102Required && (
                <ChecklistItem
                  label="MOD102 — Comunicazione Obbligatoria (CO)"
                  desc="Comunicazione obbligatoria ai centri per l'impiego"
                  submitted={proc.mod102Submitted}
                  required={true}
                  onToggle={() => toggleMod('mod102Submitted')}
                />
              )}
              {proc.mod14Required && (
                <ChecklistItem
                  label="MOD14 — Comunicazione Trasformazione Contratto"
                  desc="Richiesta in caso di trasformazione contrattuale"
                  submitted={proc.mod14Submitted}
                  required={true}
                  onToggle={() => toggleMod('mod14Submitted')}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Documenti ───────────────────────────────────────────── */}
      {activeTab === 'documenti' && (
        <div className="card-cmcc" style={{ padding: 20 }}>
          {proc.documents.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <div className="empty-icon"><i className="bi bi-paperclip" /></div>
              <div className="empty-title">Nessun documento</div>
              <div className="empty-desc">Non ci sono documenti associati a questo processo</div>
            </div>
          ) : (
            proc.documents.map(doc => (
              <div key={doc.id} className="doc-item">
                <span className="doc-icon" style={{ color: '#295fa9' }}>
                  <i className={docIcon(doc.type)} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="doc-name">{doc.name}</div>
                  <div className="doc-meta">
                    {doc.type.toUpperCase()}
                    {doc.required && <span className="tag tag-amber ms-2">Richiesto</span>}
                    {doc.uploadedAt && <> · Caricato {fmtDateTime(doc.uploadedAt)}</>}
                    {doc.uploadedBy && <> da {doc.uploadedBy}</>}
                  </div>
                </div>
                <span className="doc-status-badge" style={docStatusStyle(doc.status)}>
                  {docStatusLabel(doc.status)}
                </span>
                {doc.status === 'attesa' && (
                  <button
                    className="btn btn-cmcc-secondary ms-2"
                    style={{ padding: '4px 12px', fontSize: 12 }}
                    onClick={() => handleDocUpload(doc.id)}
                  >
                    <i className="bi bi-upload me-1" />
                    Carica
                  </button>
                )}
                {doc.status === 'caricato' && (
                  <button
                    className="btn btn-cmcc-ghost ms-2"
                    style={{ padding: '4px 12px', fontSize: 12 }}
                    disabled
                  >
                    <i className="bi bi-eye me-1" />
                    Visualizza
                  </button>
                )}
                {doc.status === 'verificato' && (
                  <button
                    className="btn btn-cmcc-ghost ms-2"
                    style={{ padding: '4px 12px', fontSize: 12 }}
                    disabled
                  >
                    <i className="bi bi-eye me-1" />
                    Visualizza
                  </button>
                )}
              </div>
            ))
          )}

          {/* Alert for missing required docs */}
          {proc.documents.some(d => d.required && d.status === 'attesa') && (
            <div className="alert-cmcc warning mt-3">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              Ci sono documenti richiesti ancora in attesa di caricamento.
            </div>
          )}
          {proc.documents.every(d => !d.required || d.status !== 'attesa') && proc.documents.length > 0 && (
            <div className="alert-cmcc success mt-3">
              <i className="bi bi-check-circle-fill me-2" />
              Tutti i documenti richiesti sono stati caricati.
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Approvazioni ────────────────────────────────────────── */}
      {activeTab === 'approvazioni' && (
        <div className="card-cmcc" style={{ padding: 20 }}>
          {proc.approvals.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <div className="empty-icon"><i className="bi bi-person-check" /></div>
              <div className="empty-title">Nessuna approvazione</div>
              <div className="empty-desc">
                {proc.status === 'bozza'
                  ? 'Invia il processo per avviare il flusso di approvazioni'
                  : 'Non ci sono approvazioni associate a questo processo'}
              </div>
            </div>
          ) : (
            proc.approvals.map(approval => {
              const canAct =
                approval.status === 'pending' &&
                (
                  (approval.role === 'rs' && currentRole === 'rs') ||
                  (approval.role === 'direttore' && currentRole === 'direttore') ||
                  (approval.role === 'gru' && currentRole === 'gru') ||
                  (approval.role === 'amm' && currentRole === 'amm')
                );

              const approvalStatusStyle: React.CSSProperties =
                approval.status === 'approved'
                  ? { background: '#dcfce7', color: '#166534' }
                  : approval.status === 'rejected'
                  ? { background: '#fee2e2', color: '#991b1b' }
                  : { background: '#f1f5f9', color: '#64748b' };

              const approvalStatusLabel =
                approval.status === 'approved' ? 'Approvato' :
                approval.status === 'rejected' ? 'Respinto' : 'In attesa';

              return (
                <div key={approval.id}>
                  <div className="approval-row">
                    <div
                      className="approval-avatar"
                      style={{ background: avatarColor(approval.name) }}
                    >
                      {initials(approval.name).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="approval-name">{approval.name}</div>
                      <div className="approval-role">
                        <span className={roleChipClass(approval.role)}>
                          {roleLabel(approval.role)}
                        </span>
                        {approval.timestamp && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>
                            {fmtDateTime(approval.timestamp)}
                          </span>
                        )}
                      </div>
                      {approval.notes && (
                        <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
                          "{approval.notes}"
                        </div>
                      )}
                    </div>
                    <div className="approval-action">
                      <span
                        className="doc-status-badge"
                        style={{ ...approvalStatusStyle, padding: '3px 10px', fontSize: 12, borderRadius: 20 }}
                      >
                        {approval.status === 'approved' && <i className="bi bi-check-circle-fill me-1" />}
                        {approval.status === 'rejected' && <i className="bi bi-x-circle-fill me-1" />}
                        {approval.status === 'pending'  && <i className="bi bi-clock me-1" />}
                        {approvalStatusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Inline action if this role can act */}
                  {canAct && (
                    <div
                      className="card-cmcc"
                      style={{ margin: '-2px 0 12px 52px', padding: 14, background: '#f8fbff', border: '1.5px solid #295fa918' }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#295fa9', marginBottom: 8 }}>
                        <i className="bi bi-pencil-square me-2" />
                        La tua azione è richiesta
                      </div>
                      <textarea
                        className="form-control mb-2"
                        rows={2}
                        placeholder="Note opzionali (motivazione, osservazioni…)"
                        style={{ fontSize: 12, resize: 'none' }}
                        value={approvalNotes[approval.id] ?? ''}
                        onChange={e => setApprovalNotes(n => ({ ...n, [approval.id]: e.target.value }))}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-cmcc-success"
                          style={{ fontSize: 13, padding: '6px 18px' }}
                          onClick={() => handleApproval(approval, true)}
                        >
                          <i className="bi bi-check-lg me-2" />
                          Approva
                        </button>
                        <button
                          className="btn btn-cmcc-danger"
                          style={{ fontSize: 13, padding: '6px 18px' }}
                          onClick={() => handleApproval(approval, false)}
                        >
                          <i className="bi bi-x-lg me-2" />
                          Respingi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {proc.approvals.every(a => a.status === 'approved') && proc.approvals.length > 0 && (
            <div className="alert-cmcc success mt-2">
              <i className="bi bi-check-circle-fill me-2" />
              Tutte le approvazioni sono state ottenute.
            </div>
          )}
          {proc.approvals.some(a => a.status === 'rejected') && (
            <div className="alert-cmcc danger mt-2">
              <i className="bi bi-x-octagon-fill me-2" />
              Una o più approvazioni sono state rifiutate.
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Storia ─────────────────────────────────────────────── */}
      {activeTab === 'storia' && (
        <div className="card-cmcc" style={{ padding: '20px 24px' }}>
          {proc.history.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <div className="empty-icon"><i className="bi bi-clock-history" /></div>
              <div className="empty-title">Nessuna storia</div>
              <div className="empty-desc">Non ci sono eventi registrati per questo processo</div>
            </div>
          ) : (
            <div className="timeline">
              {[...proc.history].reverse().map((entry, idx) => {
                const isFirst = idx === 0;
                return (
                  <div key={entry.id} className="timeline-item">
                    <div className={`timeline-dot${isFirst ? ' active' : ' done'}`}>
                      <i className={`bi ${isFirst ? 'bi-circle-fill' : 'bi-check'}`} style={{ fontSize: 9 }} />
                    </div>
                    <div className="timeline-time">{fmtDateTime(entry.timestamp)}</div>
                    <div className="timeline-action">{entry.action}</div>
                    <div className="timeline-actor">
                      {entry.actor}
                      <span style={{ marginLeft: 6 }}>
                        <span className={roleChipClass(
                          entry.actorRole === 'RS' ? 'rs' :
                          entry.actorRole === 'GRU' ? 'gru' :
                          entry.actorRole === 'Direttore' ? 'direttore' :
                          entry.actorRole === 'AMM' ? 'amm' : 'rs'
                        )}>
                          {entry.actorRole}
                        </span>
                      </span>
                      {entry.toStatus && (
                        <span style={{ marginLeft: 8 }}>
                          <StatusBadge status={entry.toStatus} size="sm" />
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="timeline-notes">"{entry.notes}"</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Bottom contextual action panel ──────────────────────────── */}
      {proc.status === 'anagrafica' && (
        <div className="card-cmcc mt-4" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#0f172a' }}>
            <i className="bi bi-person-vcard me-2 text-cmcc-blue" />
            Fase Anagrafica — Checklist
          </div>
          <ChecklistItem
            label="MOD13 inviato"
            desc="Comunicazione avvio collaborazione"
            submitted={proc.mod13Submitted}
            required={true}
            onToggle={() => toggleMod('mod13Submitted')}
          />
          {proc.mod138Required && (
            <ChecklistItem
              label="MOD13.8 inviato"
              desc="Dichiarazione antimafia"
              submitted={proc.mod138Submitted}
              required={true}
              onToggle={() => toggleMod('mod138Submitted')}
            />
          )}
          {proc.mod102Required && (
            <ChecklistItem
              label="MOD102 inviato"
              desc="Comunicazione obbligatoria CO"
              submitted={proc.mod102Submitted}
              required={true}
              onToggle={() => toggleMod('mod102Submitted')}
            />
          )}
          {proc.mod14Required && (
            <ChecklistItem
              label="MOD14 inviato"
              desc="Comunicazione trasformazione"
              submitted={proc.mod14Submitted}
              required={true}
              onToggle={() => toggleMod('mod14Submitted')}
            />
          )}
          {allModsSubmitted && currentRole === 'amm' && (
            <div className="alert-cmcc success mt-3">
              <i className="bi bi-check-circle-fill me-2" />
              Tutti i moduli sono stati inviati. Puoi avanzare il processo alla fase Zucchetti.
              <button
                className="btn btn-cmcc-primary ms-3"
                style={{ fontSize: 13 }}
                onClick={() => advanceStatus('zucchetti', 'Ufficio AMM', 'Fase anagrafica completata — avanzamento a Zucchetti')}
              >
                <i className="bi bi-arrow-right-circle me-2" />
                Avanza a Zucchetti
              </button>
            </div>
          )}
          {!allModsSubmitted && (
            <div className="alert-cmcc warning mt-3">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              Completa tutti i moduli richiesti prima di procedere al caricamento su Zucchetti.
            </div>
          )}
        </div>
      )}

      {/* ── Stepper click modal ──────────────────────────────────────── */}
      {stepModal && (() => {
        const data = getStepClickData(stepModal);
        if (!data) return null;
        return (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(15,23,42,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={e => { if (e.target === e.currentTarget) { setStepModal(null); setStepModalNotes(''); } }}
          >
            <div
              className="card-cmcc"
              style={{ width: 420, maxWidth: '92vw', padding: 28, position: 'relative' }}
            >
              <button
                className="btn btn-cmcc-ghost"
                style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px', fontSize: 14 }}
                onClick={() => { setStepModal(null); setStepModalNotes(''); }}
              >
                <i className="bi bi-x-lg" />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#295fa9', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}
                >
                  <i className="bi bi-lightning-fill" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{data.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{data.desc}</div>
                </div>
              </div>
              <textarea
                className="form-control mb-3"
                rows={3}
                placeholder="Note opzionali (motivazione, osservazioni…)"
                style={{ fontSize: 13, resize: 'none' }}
                value={stepModalNotes}
                onChange={e => setStepModalNotes(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-cmcc-ghost"
                  style={{ fontSize: 13 }}
                  onClick={() => { setStepModal(null); setStepModalNotes(''); }}
                >
                  Annulla
                </button>
                {data.canReject && data.onReject && (
                  <button
                    className="btn btn-cmcc-danger"
                    style={{ fontSize: 13 }}
                    onClick={data.onReject}
                  >
                    <i className="bi bi-x-lg me-2" />
                    Respingi
                  </button>
                )}
                <button
                  className="btn btn-cmcc-success"
                  style={{ fontSize: 13 }}
                  onClick={data.onApprove}
                >
                  <i className="bi bi-check-lg me-2" />
                  {data.canReject ? 'Approva' : 'Conferma'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
