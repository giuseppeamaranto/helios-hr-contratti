import { useState } from 'react';
import type { ContractProcess, UserRole, ProcessStatus, Approval } from '../../types';
import { STATUS_CONFIG, OPERATION_LABELS, CONTRACT_TYPE_LABELS, ROLE_LABELS, RESOURCES } from '../../data/mockData';
import { StatusBadge } from '../ui/StatusBadge';
import { avatarColor, initials } from '../../utils/avatar';

interface Props {
  process: ContractProcess;
  currentRole: UserRole;
  onBack: () => void;
  onUpdate: (updates: Partial<ContractProcess>) => void;
}

type TabId = 'dettaglio' | 'documenti' | 'approvazioni' | 'storia';

// ── Stepper definition (allineato al FlowChart CMCC) ────────────────────────
// 13 step in pipeline + 2 stati terminali (annullato/respinto).
const STEPS: { status: ProcessStatus | string; label: string }[] = [
  { status: 'bozza',                label: 'Bozza' },
  { status: 'approvazione-rs',      label: 'Approv. Resp.' },
  { status: 'verifica-gru',         label: 'Verifica HR' },
  { status: 'approvazione-dir',     label: 'Approv. Dir.' },
  { status: 'approvazione-organo',  label: 'Approv. Organo' },
  { status: 'redazione',            label: 'Redazione' },
  { status: 'anteprima',            label: 'Anteprima' },
  { status: 'firma-presidente',     label: 'Firma Pres.' },
  { status: 'protocollo',           label: 'Protocollo' },
  { status: 'applicativi',          label: 'Applicativi' },
  { status: 'anagrafica',           label: 'Anagrafica' },
  { status: 'monitoraggio',         label: 'Monitoraggio' },
  { status: 'completato',           label: 'Completato' },
];

// Mappa di compatibilità: legacy status → step nuovo, per non rompere processi
// salvati prima del refactor.
const LEGACY_TO_NEW: Record<string, ProcessStatus> = {
  'elaborazione-gru':       'redazione',
  'lettera-presentazione':  'anteprima',
  'contratto-preparazione': 'redazione',
  'contratto-firma':        'firma-presidente',
  'zucchetti':              'applicativi',
};

function normalizeStatus(s: string): string {
  return LEGACY_TO_NEW[s] ?? s;
}

function getStepIndex(status: string): number {
  const norm = normalizeStatus(status);
  const idx = STEPS.findIndex(s => s.status === norm);
  return idx >= 0 ? idx : -1;
}

/** Determina se uno step deve essere mostrato per un dato processo.
 *  - Approv. Direttore + Approv. Organo sono saltati se importo < 1000 €. */
function isStepApplicable(stepStatus: string, proc: ContractProcess): boolean {
  const amount = proc.requestedAmount ?? 0;
  const isLowAmount = amount > 0 && amount < 1000;
  if (isLowAmount && (stepStatus === 'approvazione-dir' || stepStatus === 'approvazione-organo')) {
    return false;
  }
  return true;
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

function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

function roleChipClass(role: string): string {
  // mappa al CSS class esistente (rs/dir/gru/amm); i nuovi ruoli fallback a 'amm'
  const map: Record<string, string> = {
    rs: 'rs', direttore: 'dir', gru: 'gru', amm: 'amm',
    presidente: 'dir', governance: 'dir', segreteria: 'amm',
  };
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

// 2-col compact summary grid — usata nelle sezioni con molte coppie label/valore.
function SummaryGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  const visible = items.filter(it => it.value !== undefined && it.value !== null && it.value !== '');
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '4px 24px',
        padding: '8px 16px 14px',
      }}
    >
      {visible.map((it, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 10,
            padding: '6px 0',
            borderBottom: '1px dashed #e2e8f0',
            minWidth: 0,
          }}
        >
          <span style={{ color: '#64748b', fontWeight: 500, fontSize: 12, flexShrink: 0 }}>
            {it.label}
          </span>
          <span
            style={{
              color: '#0f172a',
              fontWeight: 600,
              fontSize: 13,
              textAlign: 'right',
              wordBreak: 'break-word',
              minWidth: 0,
            }}
          >
            {it.value || '—'}
          </span>
        </div>
      ))}
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
  // Posizione del popover ancorata alla bounding box dello step cliccato.
  // null → popover renderizzato al centro (fallback).
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  // Ricerca per il pannello di riconciliazione Zucchetti (anagrafica step).
  const [zucchettiQuery, setZucchettiQuery] = useState('');

  const currentStepIdx = getStepIndex(proc.status);

  // ── Resource name display
  const resourceName = proc.resource?.fullName ?? proc.newResourceName ?? '—';

  // ── Next status map — pipeline FlowChart CMCC con branching su importo.
  // Se requestedAmount < 1000 € saltiamo Approv. Direttore + Approv. Organo
  // (gate "Importo inferiore a 1000,00€?" del flowchart).
  const lowAmount = (proc.requestedAmount ?? 0) > 0 && (proc.requestedAmount ?? 0) < 1000;
  const nextStatusMap: Partial<Record<ProcessStatus, ProcessStatus>> = {
    'bozza':              'approvazione-rs',
    'approvazione-rs':    'verifica-gru',
    'verifica-gru':       lowAmount ? 'redazione' : 'approvazione-dir',
    'approvazione-dir':   'approvazione-organo',
    'approvazione-organo':'redazione',
    'redazione':          'anteprima',
    'anteprima':          'firma-presidente',
    'firma-presidente':   'protocollo',
    'protocollo':         'applicativi',
    'applicativi':        'anagrafica',
    'anagrafica':         'monitoraggio',
    'monitoraggio':       'completato',
    // legacy
    'elaborazione-gru':       'anteprima',
    'lettera-presentazione':  'firma-presidente',
    'contratto-preparazione': 'firma-presidente',
    'contratto-firma':        'protocollo',
    'zucchetti':              'anagrafica',
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

    let newStatus: ProcessStatus = normalizeStatus(proc.status) as ProcessStatus;
    let action = '';

    if (approved) {
      const next = nextStatusMap[normalizeStatus(proc.status) as ProcessStatus];
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
    const isAdmin = currentRole === 'amm';
    const targetIdx = getStepIndex(stepStatus);
    const isCurrent = normalizeStatus(proc.status) === normalizeStatus(stepStatus);
    const isPast    = targetIdx >= 0 && targetIdx < currentStepIdx;
    const isFuture  = targetIdx > currentStepIdx;
    const actor = isAdmin
      ? 'Ufficio AMM (override)'
      : `${proc.requestedBy} (${roleLabel(currentRole)})`;
    const closeModal = () => { setStepModal(null); setStepModalNotes(''); setPopoverAnchor(null); };

    // ── PAST step → riapertura/rollback ────────────────────────────────────
    // Cliccando su uno step già completato si può riportare il processo a
    // quella fase (utile per correzioni). Tracciato in history come riapertura.
    if (isPast) {
      const targetStatus = stepStatus as ProcessStatus;
      return {
        title: `Riapri "${STEPS[targetIdx].label}"`,
        desc: 'Riporta il processo a questo step (rollback). Le azioni successive andranno rifatte.',
        canReject: false,
        onApprove: () => {
          advanceStatus(targetStatus, actor, `Riapertura step "${STEPS[targetIdx].label}"`, stepModalNotes || undefined);
          closeModal();
        },
      };
    }

    // ── FUTURE step → salto in avanti (qualsiasi ruolo) ────────────────────
    // Marca come approvate tutte le approvazioni pendenti tra qui e il target.
    if (isFuture) {
      const targetStatus = stepStatus as ProcessStatus;
      return {
        title: `Salta a "${STEPS[targetIdx].label}"`,
        desc: 'Avanza direttamente a questo step. Le approvazioni intermedie pendenti vengono marcate come approvate.',
        canReject: true,
        onApprove: () => {
          const now = new Date().toISOString();
          const newApprovals = proc.approvals.map(a =>
            a.status === 'pending'
              ? { ...a, status: 'approved' as const, timestamp: now, notes: `(skip via ${roleLabel(currentRole)})` }
              : a
          );
          const newHistory = [
            ...proc.history,
            {
              id: `H${proc.history.length + 1}`,
              timestamp: now,
              action: `Salto manuale a "${STEPS[targetIdx].label}"`,
              actor,
              actorRole: roleLabel(currentRole),
              notes: stepModalNotes || undefined,
              toStatus: targetStatus,
            },
          ];
          onUpdate({ status: targetStatus, approvals: newApprovals, updatedAt: now, history: newHistory });
          closeModal();
        },
        onReject: () => {
          advanceStatus('respinto', actor, 'Processo respinto', stepModalNotes || undefined);
          closeModal();
        },
      };
    }

    // ── CURRENT step → azione contestuale per status ───────────────────────
    // Niente gating per ruolo: ogni ruolo può agire (le restrizioni sono solo
    // narrative, non operative — questa è una demo/mockup). L'history traccia
    // chi ha agito e con che ruolo.
    const adminDesc = isAdmin ? ' (override AMM)' : '';
    const next = nextStatusMap[normalizeStatus(proc.status) as ProcessStatus];

    switch (normalizeStatus(stepStatus) as ProcessStatus) {
      // 0. BOZZA → Submit (o annulla la bozza)
      case 'bozza':
        return {
          title: 'Invia per Approvazione',
          desc: `Il processo verrà inviato al Responsabile di Struttura.${adminDesc}`,
          canReject: true,
          onApprove: () => { advanceStatus('approvazione-rs', actor, 'Processo inviato per approvazione RS', stepModalNotes || undefined); closeModal(); },
          onReject:  () => { advanceStatus('annullato',     actor, 'Bozza annullata',                       stepModalNotes || undefined); closeModal(); },
        };

      // 1. APPROV. RESP. (Divisione → autorizza richiesta)
      case 'approvazione-rs': {
        const appr = proc.approvals.find(a => a.role === 'rs' && a.status === 'pending');
        return {
          title: 'Approvazione Responsabile',
          desc: `Autorizza la richiesta di contratto.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            if (appr) handleApproval(appr, true, stepModalNotes || undefined);
            else advanceStatus(next!, actor, 'Approv. RS — override AMM', stepModalNotes || undefined);
            closeModal();
          },
          onReject: () => {
            if (appr) handleApproval(appr, false, stepModalNotes || undefined);
            else advanceStatus('respinto', actor, 'Processo respinto in fase RS — override AMM', stepModalNotes || undefined);
            closeModal();
          },
        };
      }

      // 2. VERIFICA HR ADMIN (HR Admin riceve doc, archivia, prepara prospetti)
      case 'verifica-gru':
        return {
          title: 'Verifica HR Admin',
          desc: lowAmount
            ? `Importo < 1000 €: si salta l'organo di competenza, si va direttamente a Redazione.${adminDesc}`
            : `Conferma la verifica dei documenti e prepara i prospetti per l'organo.${adminDesc}`,
          canReject: true,
          onApprove: () => { advanceStatus(next!, isAdmin ? actor : 'HR Admin', 'Verifica HR Admin completata', stepModalNotes || undefined); closeModal(); },
          onReject:  () => { advanceStatus('respinto', actor, 'Verifica HR Admin respinta', stepModalNotes || undefined); closeModal(); },
        };

      // 3. APPROV. DIR. ESEC. (skippato se <1000€)
      case 'approvazione-dir': {
        const appr = proc.approvals.find(a => a.role === 'direttore' && a.status === 'pending');
        return {
          title: 'Approvazione Direttore Esecutivo',
          desc: `Approva o respingi la richiesta come Direttore Esecutivo.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            if (appr) handleApproval(appr, true, stepModalNotes || undefined);
            else advanceStatus(next!, actor, 'Approv. Direttore — override AMM', stepModalNotes || undefined);
            closeModal();
          },
          onReject: () => {
            if (appr) handleApproval(appr, false, stepModalNotes || undefined);
            else advanceStatus('respinto', actor, 'Processo respinto dal Direttore — override AMM', stepModalNotes || undefined);
            closeModal();
          },
        };
      }

      // 4. APPROV. ORGANO (CE se Direzione Scientifica, altrimenti Governance/CdA)
      case 'approvazione-organo': {
        const appr = proc.approvals.find(a => a.role === 'governance' && a.status === 'pending');
        const organo = proc.isDirezioneScientifica ? 'Comitato Esecutivo (CE)' : 'Governance (CdA)';
        return {
          title: `Approvazione Organo — ${organo}`,
          desc: `Decisione finale dell'organo di competenza.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            if (appr) handleApproval(appr, true, stepModalNotes || `Approvato da ${organo}`);
            else advanceStatus(next!, actor, `Approvato da ${organo} — override AMM`, stepModalNotes || undefined);
            closeModal();
          },
          onReject: () => {
            if (appr) handleApproval(appr, false, stepModalNotes || `Respinto da ${organo}`);
            else advanceStatus('respinto', actor, `Respinto da ${organo} — override AMM`, stepModalNotes || undefined);
            closeModal();
          },
        };
      }

      // 5. REDAZIONE — HR Admin redige il contratto; sotto-task Babbo per subordinati
      case 'redazione':
        return {
          title: 'Redazione Contratto',
          desc: proc.contractCategory === 'subordinato'
            ? `Contratto subordinato → ricordati di inviare info allo studio esterno (Babbo).${adminDesc}`
            : `Completa la redazione del contratto e passa all'anteprima.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            const now = new Date().toISOString();
            const upd: Partial<ContractProcess> = {
              status: 'anteprima',
              updatedAt: now,
              previewStatus: 'pending',
              history: [...proc.history, {
                id: `H${proc.history.length + 1}`,
                timestamp: now,
                action: 'Contratto redatto — inviata anteprima alla risorsa',
                actor: isAdmin ? actor : 'HR Admin',
                actorRole: 'HR Admin',
                notes: stepModalNotes || undefined,
                toStatus: 'anteprima',
              }],
            };
            onUpdate(upd);
            closeModal();
          },
          onReject: () => { advanceStatus('respinto', actor, 'Redazione contratto interrotta', stepModalNotes || undefined); closeModal(); },
        };

      // 6. ANTEPRIMA RISORSA — può tornare a Redazione se modifiche segnalate
      case 'anteprima':
        return {
          title: 'Anteprima alla Risorsa',
          desc: `Conferma se la risorsa ha approvato l'anteprima del contratto.${adminDesc}`,
          canReject: true,   // "Respingi" = la risorsa ha chiesto modifiche → torna a redazione
          onApprove: () => {
            advanceStatus(next!, isAdmin ? actor : 'HR Admin', 'Risorsa ha approvato l\'anteprima — in firma al Presidente', stepModalNotes || undefined);
            onUpdate({ previewStatus: 'approved' });
            closeModal();
          },
          onReject: () => {
            const now = new Date().toISOString();
            onUpdate({
              status: 'redazione',
              previewStatus: 'changes',
              previewNotes: stepModalNotes || 'Modifiche richieste dalla risorsa',
              updatedAt: now,
              history: [...proc.history, {
                id: `H${proc.history.length + 1}`,
                timestamp: now,
                action: 'Modifiche segnalate dalla risorsa — ritorno a Redazione',
                actor: isAdmin ? actor : 'HR Admin',
                actorRole: 'HR Admin',
                notes: stepModalNotes || undefined,
                toStatus: 'redazione',
              }],
            });
            closeModal();
          },
        };

      // 7. FIRMA PRESIDENTE
      case 'firma-presidente': {
        const appr = proc.approvals.find(a => a.role === 'presidente' && a.status === 'pending');
        return {
          title: 'Firma del Presidente',
          desc: `Segna il contratto come firmato dal Presidente.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            if (appr) handleApproval(appr, true, stepModalNotes || 'Contratto firmato dal Presidente');
            else advanceStatus(next!, actor, 'Firma Presidente — override AMM', stepModalNotes || undefined);
            closeModal();
          },
          onReject: () => {
            if (appr) handleApproval(appr, false, stepModalNotes || 'Firma negata dal Presidente');
            else advanceStatus('respinto', actor, 'Firma Presidente negata', stepModalNotes || undefined);
            closeModal();
          },
        };
      }

      // 8. PROTOCOLLO (Segreteria/Dorella)
      case 'protocollo':
        return {
          title: 'Protocollo Segreteria',
          desc: `Assegna numero di protocollo e archivia il contratto firmato.${adminDesc}`,
          canReject: true,
          onReject: () => { advanceStatus('respinto', actor, 'Protocollazione respinta', stepModalNotes || undefined); closeModal(); },
          onApprove: () => {
            const now = new Date().toISOString();
            const protocolNumber = `PROT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
            onUpdate({
              status: 'applicativi',
              protocolNumber,
              updatedAt: now,
              history: [...proc.history, {
                id: `H${proc.history.length + 1}`,
                timestamp: now,
                action: `Protocollato — Nr. ${protocolNumber}`,
                actor: isAdmin ? actor : 'Segreteria',
                actorRole: 'Segreteria',
                notes: stepModalNotes || undefined,
                toStatus: 'applicativi',
              }],
            });
            closeModal();
          },
        };

      // 9. APPLICATIVI (Zucchetti, Helios/SAP)
      case 'applicativi':
        return {
          title: 'Inserimento Applicativi',
          desc: `Inserisci i dati in Zucchetti / Helios / SAP.${adminDesc}`,
          canReject: true,
          onApprove: () => { handleZucchetti(); closeModal(); },
          onReject:  () => { advanceStatus('respinto', actor, 'Inserimento applicativi sospeso', stepModalNotes || undefined); closeModal(); },
        };

      // 10. ANAGRAFICA (MOD13/138/102/14 + riconciliazione Zucchetti)
      case 'anagrafica': {
        const needsReconcile = proc.isNewResource && !proc.zucchettiReconciled;
        const blocked = needsReconcile;
        const desc = blocked
          ? `Nuovo assunto non ancora riconciliato con Zucchetti/DossierRisorse: collega prima l'anagrafica dal pannello qui sotto.${adminDesc}`
          : allModsSubmitted
            ? 'Tutti i moduli inviati. Apri il monitoraggio post-firma.'
            : `Attenzione: alcuni moduli non sono ancora stati inviati. Forzando si avanza comunque.${adminDesc}`;
        return {
          title: 'Anagrafica → Monitoraggio',
          desc,
          canReject: true,
          onApprove: () => {
            if (blocked && !isAdmin) return;  // gate: solo AMM può forzare
            advanceStatus('monitoraggio', actor, 'Anagrafica completata — monitoraggio attivo', stepModalNotes || undefined);
            closeModal();
          },
          onReject: () => { advanceStatus('respinto', actor, 'Fase anagrafica respinta', stepModalNotes || undefined); closeModal(); },
        };
      }

      // 11. MONITORAGGIO — chiude con monitoringEndDate (data scadenza)
      case 'monitoraggio':
        return {
          title: 'Chiudi Processo',
          desc: `Imposta la data di scadenza per la notifica di proroga e chiudi il processo.${adminDesc}`,
          canReject: true,
          onApprove: () => {
            const monitoringEndDate = proc.mod09?.endDate || proc.mod10?.endDate || proc.resource?.endDate;
            advanceStatus('completato', isAdmin ? actor : 'Sistema', 'Processo completato — monitoraggio scadenza attivo', stepModalNotes || undefined);
            if (monitoringEndDate) onUpdate({ monitoringEndDate });
            closeModal();
          },
          onReject: () => { advanceStatus('respinto', actor, 'Monitoraggio interrotto', stepModalNotes || undefined); closeModal(); },
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
        {currentRole === 'amm' && (
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
            <i className="bi bi-shield-lock me-2" style={{ color: '#f1a20e' }} />
            Modalità <strong>AMM (admin)</strong>: clicca uno step futuro per saltare direttamente a quella fase.
          </div>
        )}
        <div className="process-stepper">
          {STEPS.map((step, idx) => {
            const skipped = !isStepApplicable(step.status, proc); // skip Dir.+Organo se <1000€
            let stepState: 'done' | 'active' | '' = '';
            if (proc.status === 'annullato' || proc.status === 'respinto') {
              stepState = '';
            } else if (idx < currentStepIdx) {
              stepState = 'done';
            } else if (idx === currentStepIdx) {
              stepState = 'active';
            }

            // Ogni step è cliccabile, anche se il processo è in stato
            // terminale (respinto/annullato): in tal caso il click su uno step
            // serve a "revocare" e riportare il processo a quella fase.
            const clickData = getStepClickData(step.status);
            const isClickable = !!clickData;
            // Pulse animation solo sullo step current per evitare rumore visivo
            // quando ogni step è cliccabile (jump/halo collidenti).
            const isCurrentClickable = isClickable && idx === currentStepIdx;

            return (
              <div
                key={step.status}
                className={`step-item${stepState ? ' ' + stepState : ''}${isClickable ? ' step-item-clickable' : ''}`}
                onClick={isClickable ? (e) => {
                  setStepModal(step.status as ProcessStatus);
                  setPopoverAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
                } : undefined}
                style={{
                  ...(isClickable ? { cursor: 'pointer' } : undefined),
                  ...(skipped ? { opacity: 0.35 } : undefined),
                }}
                title={
                  skipped ? `Step saltato (importo < 1000 €)`
                  : isClickable ? `Azione: ${clickData!.title}` : undefined
                }
              >
                <div className={`step-circle${isCurrentClickable ? ' step-circle-clickable' : ''}`}>
                  {skipped
                    ? <i className="bi bi-dash" />
                    : stepState === 'done'
                    ? <i className="bi bi-check" />
                    : isClickable
                    ? <i className="bi bi-lightning-fill" style={{ fontSize: 11 }} />
                    : <span>{idx}</span>
                  }
                </div>
                <div className="step-label">{step.label}{skipped && <div style={{ fontSize: 9, fontStyle: 'italic' }}>(skip)</div>}</div>
              </div>
            );
          })}
        </div>

        {(proc.status === 'annullato' || proc.status === 'respinto') && (() => {
          // Recupera l'ultimo stato non-terminale dalla history per la revoca.
          const lastNonTerminal = [...proc.history].reverse().find(h =>
            h.toStatus && h.toStatus !== 'annullato' && h.toStatus !== 'respinto'
          );
          const restoreTo = lastNonTerminal?.toStatus ?? 'bozza';
          const handleRevoke = () => {
            const now = new Date().toISOString();
            advanceStatus(
              restoreTo,
              `${proc.requestedBy} (${roleLabel(currentRole)})`,
              `Revoca ${proc.status} — ripristino a "${STATUS_CONFIG[restoreTo]?.label ?? restoreTo}"`,
              undefined,
            );
            void now;
          };
          return (
            <div
              className="alert-cmcc danger mt-2"
              style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <i className={`bi ${proc.status === 'annullato' ? 'bi-x-circle-fill' : 'bi-x-octagon-fill'} me-2`} />
                Processo <strong>{proc.status === 'annullato' ? 'annullato' : 'respinto'}</strong>.
                Puoi revocare e tornare allo step precedente, oppure cliccare uno step nella pipeline per riaprire.
              </div>
              <button
                className="btn btn-cmcc-secondary"
                style={{ fontSize: 12, padding: '5px 14px', flexShrink: 0 }}
                onClick={handleRevoke}
              >
                <i className="bi bi-arrow-counterclockwise me-2" />
                Revoca {proc.status === 'annullato' ? 'annullamento' : 'rifiuto'}
              </button>
            </div>
          );
        })()}
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
          {/* HR Portal - Costs (placeholder) — punto 7 ─────────────────────── */}
          <div
            className="card-cmcc mb-3"
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'linear-gradient(90deg, #f1a20e10, #295fa908)',
              borderLeft: '4px solid #f1a20e',
            }}
          >
            <i className="bi bi-graph-up-arrow" style={{ fontSize: 22, color: '#f1a20e' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                HR Portal — Costs
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Cruscotto costi del contratto (allocazione su progetti, scadenze, oneri).
                <span className="tag tag-gray ms-2" style={{ fontSize: 9 }}>placeholder</span>
              </div>
            </div>
            <a
              href="#"
              className="btn btn-cmcc-secondary"
              style={{ fontSize: 12, padding: '6px 14px', flexShrink: 0 }}
              onClick={e => { e.preventDefault(); /* placeholder: collegare URL reale */ }}
              title={`Apri HR Portal - Costs per ${proc.id}`}
            >
              <i className="bi bi-box-arrow-up-right me-2" />
              Apri Costs
            </a>
          </div>

          {/* Informazioni richiesta — layout grid 2-col (punto 6) ──────────── */}
          <div className="summary-section card-cmcc mb-3">
            <SectionHeader icon="bi-file-earmark-text" title="Informazioni Richiesta" />
            <SummaryGrid items={[
              { label: 'ID Processo',     value: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{proc.id}</span> },
              { label: 'Tipo Operazione', value: OPERATION_LABELS[proc.operationType] ?? proc.operationType },
              { label: 'Richiedente',     value: proc.requestedBy },
              { label: 'Email richiedente', value: proc.requestedByEmail },
              { label: 'Unità Organizzativa', value: proc.unitName },
              { label: 'Progetto',        value: `${proc.projectCode} — ${proc.projectName}` },
              { label: 'Centro di Costo', value: proc.costCenter },
              { label: 'Urgente',         value: proc.isUrgent ? <span className="tag tag-amber">Sì</span> : 'No' },
              ...(proc.contractType ? [{ label: 'Tipo Contratto', value: CONTRACT_TYPE_LABELS[proc.contractType] ?? proc.contractType }] : []),
              ...(proc.contractCategory ? [{ label: 'Categoria', value: proc.contractCategory === 'subordinato' ? 'Subordinato' : 'Non Subordinato' }] : []),
              ...(proc.modType ? [{ label: 'Modulo', value: proc.modType.toUpperCase() }] : []),
              ...(proc.requestedAmount ? [{
                label: 'Importo annuo',
                value: (
                  <span>
                    {proc.requestedAmount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                    {proc.requestedAmount < 1000 && <span className="tag tag-gray ms-2" style={{ fontSize: 10 }}>&lt; 1000 € — skip Dir./Organo</span>}
                  </span>
                ),
              }] : []),
              ...(proc.contractAction ? [{
                label: 'Effetto sul contratto',
                value: (
                  <span>
                    <span className={`tag ${proc.contractAction === 'new-contract' ? 'tag-amber' : 'tag-blue'}`}>
                      <i className={`bi ${proc.contractAction === 'new-contract' ? 'bi-file-earmark-plus' : 'bi-pencil-square'} me-1`} />
                      {proc.contractAction === 'new-contract' ? 'Nuovo contratto' : 'Modifica contratto'}
                    </span>
                    {!!proc.interruptionDays && proc.interruptionDays > 0 && (
                      <span className="tag tag-gray ms-2" style={{ fontSize: 10 }}>
                        {proc.interruptionDays}gg interruzione
                      </span>
                    )}
                  </span>
                ),
              }] : []),
              { label: 'Organo competente', value: proc.isDirezioneScientifica ? 'Comitato Esecutivo (CE)' : 'Governance (CdA)' },
              ...(proc.protocolNumber ? [{ label: 'Nr. Protocollo', value: <span style={{ fontFamily: 'monospace' }}>{proc.protocolNumber}</span> }] : []),
              ...(proc.monitoringEndDate ? [{ label: 'Scadenza monitorata', value: fmt(proc.monitoringEndDate) }] : []),
            ]} />
            {proc.notes && (
              <div style={{ padding: '4px 16px 12px', fontSize: 12, color: '#64748b' }}>
                <strong>Note:</strong> {proc.notes}
              </div>
            )}
          </div>

          {/* Risorsa — layout grid 2-col compatto */}
          <div className="summary-section card-cmcc mb-3">
            <SectionHeader icon="bi-person-circle" title="Risorsa" />
            {proc.isNewResource ? (
              <SummaryGrid items={[
                { label: 'Nome',  value: <><span className="tag tag-green me-2">Nuovo</span>{proc.newResourceName}</> },
                { label: 'Email', value: proc.newResourceEmail },
              ]} />
            ) : proc.resource ? (
              <SummaryGrid items={[
                { label: 'Nome completo',       value: proc.resource.fullName },
                { label: 'Email istituzionale', value: proc.resource.email },
                ...(proc.resource.emailPrivate ? [{ label: 'Email privata', value: proc.resource.emailPrivate }] : []),
                { label: 'Codice Fiscale',      value: <span style={{ fontFamily: 'monospace' }}>{proc.resource.cf}</span> },
                { label: 'Data di nascita',     value: fmt(proc.resource.birthDate) },
                { label: 'Paese nascita',       value: proc.resource.birthCountry },
                { label: 'Paese residenza',     value: proc.resource.residenceCountry },
                { label: 'Unità',               value: proc.resource.unit },
                { label: 'Sede',                value: proc.resource.sede },
                { label: 'Professione',         value: proc.resource.profession },
                { label: 'Qualifica Prof.',     value: proc.resource.qualProf },
                { label: 'Titolo di studio',    value: proc.resource.study },
                { label: 'Tipo Contratto att.', value: proc.resource.contractType },
                { label: 'Natura Contratto',    value: proc.resource.contractNature },
                { label: 'CCNL',                value: proc.resource.ccnl },
                ...(proc.resource.ccnlLevel ? [{ label: 'Livello CCNL', value: proc.resource.ccnlLevel }] : []),
                { label: 'Part-time',           value: proc.resource.isPartTime ? `Sì — ${proc.resource.partTimePercent}%` : 'No' },
                { label: 'UE',                  value: proc.resource.isEU ? 'Sì' : 'No' },
                { label: 'Inizio contratto',    value: fmt(proc.resource.startDate) },
                ...(proc.resource.endDate ? [{ label: 'Fine contratto', value: fmt(proc.resource.endDate) }] : []),
              ]} />
            ) : (
              <div style={{ padding: '14px 16px', color: '#64748b', fontStyle: 'italic', fontSize: 13 }}>
                Nessuna risorsa associata
              </div>
            )}
          </div>

          {/* MOD09 */}
          {proc.modType === 'mod09' && proc.mod09 && (
            <div className="summary-section card-cmcc mb-3">
              <SectionHeader icon="bi-file-earmark-text" title="Dati Contratto MOD09" />
              <SummaryGrid items={[
                { label: 'Tipo Contratto',          value: proc.mod09.contractTypeMod09 },
                { label: 'Data Inizio',             value: fmt(proc.mod09.startDate) },
                { label: 'Data Fine',               value: fmt(proc.mod09.endDate) },
                { label: 'Compenso Lordo (€/mese)', value: proc.mod09.grossCompensation.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }) },
                { label: 'Cadenza Pagamento',       value: proc.mod09.paymentSchedule },
                { label: 'IVA',                     value: proc.mod09.vatRequired ? `Sì — P.IVA ${proc.mod09.vatNumber}` : 'Non richiesta' },
                { label: 'Luogo di lavoro',         value: proc.mod09.workLocation },
                { label: 'Riferisce a',             value: proc.mod09.reportTo },
              ]} />
              <div style={{ padding: '4px 16px 14px', fontSize: 12, color: '#64748b' }}>
                <div><strong>Oggetto Attività:</strong> {proc.mod09.activityObject || '—'}</div>
                {proc.mod09.deliverables && <div style={{ marginTop: 4 }}><strong>Deliverable:</strong> {proc.mod09.deliverables}</div>}
                {proc.mod09.tools && <div style={{ marginTop: 4 }}><strong>Strumenti forniti:</strong> {proc.mod09.tools}</div>}
              </div>
            </div>
          )}

          {/* MOD10 */}
          {proc.modType === 'mod10' && proc.mod10 && (
            <div className="summary-section card-cmcc mb-3">
              <SectionHeader icon="bi-file-earmark-text" title="Dati Contratto MOD10" />
              <SummaryGrid items={[
                { label: 'Tipo Contratto',     value: proc.mod10.contractTypeMod10 },
                { label: 'Livello CCNL',       value: proc.mod10.ccnlLevel },
                { label: 'Mansione',           value: proc.mod10.mansione },
                { label: 'Qualifica',          value: proc.mod10.qualifica },
                { label: 'Lordo FT (€/anno)',  value: proc.mod10.grossSalaryFT.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }) },
                { label: 'Part-time',          value: (proc.mod10.partTimePercent > 0 && proc.mod10.partTimePercent < 100) ? `Sì — ${proc.mod10.partTimePercent}%` : 'No' },
                { label: 'Data Inizio',        value: fmt(proc.mod10.startDate) },
                { label: 'Data Fine',          value: fmt(proc.mod10.endDate) },
                { label: 'Luogo di lavoro',    value: proc.mod10.workLocation },
                { label: 'Expat',              value: proc.mod10.isExpat ? `Sì — ${proc.mod10.expatCountry}` : 'No' },
              ]} />
              {proc.mod10.activityDescription && (
                <div style={{ padding: '4px 16px 14px', fontSize: 12, color: '#64748b' }}>
                  <strong>Descrizione Attività:</strong> {proc.mod10.activityDescription}
                </div>
              )}
            </div>
          )}

          {/* Sotto-task Babbo (solo subordinati, durante Redazione/Anteprima) */}
          {proc.contractCategory === 'subordinato' &&
           (normalizeStatus(proc.status) === 'redazione' || normalizeStatus(proc.status) === 'anteprima') && (
            <div
              className="card-cmcc mb-3"
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderLeft: '4px solid #295fa9',
              }}
            >
              <input
                type="checkbox"
                checked={!!proc.babboSent}
                onChange={() => onUpdate({ babboSent: !proc.babboSent, updatedAt: new Date().toISOString() })}
                style={{ width: 18, height: 18, accentColor: '#295fa9', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  Invia info allo studio esterno (Babbo)
                  <span className="tag tag-purple ms-2" style={{ fontSize: 10 }}>solo subordinati</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Sub-task contestuale alla redazione del contratto subordinato. Spunta quando hai inviato i dati allo studio esterno.
                </div>
              </div>
              {proc.babboSent && <span className="tag tag-green">Inviato</span>}
            </div>
          )}

          {/* Alert "modifiche segnalate dalla risorsa" */}
          {proc.previewStatus === 'changes' && (
            <div className="alert-cmcc warning mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              <strong>Modifiche segnalate dalla risorsa</strong>
              {proc.previewNotes && <div style={{ fontSize: 12, marginTop: 4 }}>"{proc.previewNotes}"</div>}
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Il processo è tornato in Redazione per applicare le modifiche prima di reinviare l'anteprima.
              </div>
            </div>
          )}

          {/* Riconciliazione Zucchetti (solo nuovi assunti in fase anagrafica) */}
          {proc.isNewResource && !proc.zucchettiReconciled && normalizeStatus(proc.status) === 'anagrafica' && (() => {
            const candidateName = (proc.newResourceName || '').toLowerCase();
            const baseList = candidateName
              ? RESOURCES.filter(r =>
                  r.fullName.toLowerCase().includes(candidateName.split(' ')[0]) ||
                  candidateName.includes(r.lastName.toLowerCase())
                )
              : RESOURCES;
            const filtered = zucchettiQuery.trim()
              ? RESOURCES.filter(r => {
                  const q = zucchettiQuery.toLowerCase();
                  return r.fullName.toLowerCase().includes(q)
                      || r.email.toLowerCase().includes(q)
                      || r.cf.toLowerCase().includes(q)
                      || (r.idEmploy || '').toLowerCase().includes(q);
                })
              : baseList.slice(0, 8);
            const reconcileWith = (r: typeof RESOURCES[number]) => {
              const now = new Date().toISOString();
              onUpdate({
                resourceId: r.idSubject,
                resource: r,
                isNewResource: false,
                zucchettiReconciled: true,
                updatedAt: now,
                history: [...proc.history, {
                  id: `H${proc.history.length + 1}`,
                  timestamp: now,
                  action: `Riconciliato con DossierRisorse: ${r.fullName} (matr. ${r.idEmploy})`,
                  actor: proc.requestedBy,
                  actorRole: roleLabel(currentRole),
                  toStatus: proc.status,
                }],
              });
            };
            return (
              <div
                className="card-cmcc mb-3"
                style={{ padding: 14, borderLeft: '4px solid #f1a20e', background: '#fffbeb' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <i className="bi bi-link-45deg" style={{ fontSize: 22, color: '#f1a20e' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      Riconciliazione con Zucchetti
                      <span className="tag tag-amber ms-2" style={{ fontSize: 10 }}>Richiesto</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Il nuovo assunto <strong>{proc.newResourceName ?? '—'}</strong> non è ancora collegato al
                      master <strong>DossierRisorse</strong>. Cerca e seleziona la voce corrispondente
                      per popolare l'anagrafica e proseguire con il processo.
                    </div>
                  </div>
                </div>
                <div className="search-wrapper mb-2">
                  <i className="bi bi-search" />
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Cerca in DossierRisorse: nome, email, CF, matricola…"
                    value={zucchettiQuery}
                    onChange={e => setZucchettiQuery(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filtered.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#64748b', padding: 12, textAlign: 'center' }}>
                      Nessuna corrispondenza trovata.
                    </div>
                  ) : (
                    filtered.map(r => (
                      <div
                        key={r.idSubject}
                        className="resource-card"
                        style={{ cursor: 'pointer', padding: '10px 12px' }}
                        onClick={() => reconcileWith(r)}
                      >
                        <div
                          className="resource-avatar"
                          style={{ background: avatarColor(r.fullName), flexShrink: 0, width: 34, height: 34, fontSize: 12 }}
                        >
                          {initials(r.fullName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {r.fullName}
                            <span style={{ fontSize: 10, color: '#64748b', marginLeft: 8, fontFamily: 'monospace' }}>
                              matr. {r.idEmploy}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {r.email} · {r.unitCode} · {r.contractType}
                          </div>
                        </div>
                        <button
                          className="btn btn-cmcc-primary"
                          style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}
                          onClick={(e) => { e.stopPropagation(); reconcileWith(r); }}
                        >
                          <i className="bi bi-link me-1" />
                          Collega
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}
          {proc.isNewResource && proc.zucchettiReconciled && proc.resource && normalizeStatus(proc.status) === 'anagrafica' && (
            <div className="alert-cmcc success mb-3" style={{ fontSize: 12 }}>
              <i className="bi bi-check-circle-fill me-2" />
              Anagrafica <strong>riconciliata</strong> con DossierRisorse (matr. {proc.resource.idEmploy}). Puoi avanzare allo step successivo.
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
                  label="MOD138 — Lettera di Presentazione Personale Scientifico"
                  desc="Lettera formale di presentazione per personale scientifico"
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
              label="MOD138 inviato"
              desc="Lettera di presentazione personale scientifico"
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

      {/* ── Stepper popover (floating, ancorato allo step cliccato) ─────── */}
      {stepModal && (() => {
        const data = getStepClickData(stepModal);
        if (!data) return null;

        // Posizionamento esatto: il popover viene ancorato al bordo dello
        // step usando `bottom`/`top` CSS, così non serve stimarne l'altezza.
        const POP_W = 320;
        const MARGIN = 12;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = vw / 2 - POP_W / 2;
        let arrowSide: 'bottom' | 'top' = 'bottom';
        let arrowLeft = '50%';
        let cssBottom: number | undefined;
        let cssTop:    number | undefined;

        if (popoverAnchor) {
          const cx = popoverAnchor.left + popoverAnchor.width / 2;
          left = Math.min(Math.max(8, cx - POP_W / 2), vw - POP_W - 8);
          arrowLeft = `${cx - left}px`;
          const spaceAbove = popoverAnchor.top;
          const spaceBelow = vh - popoverAnchor.bottom;
          if (spaceAbove >= 200 || spaceAbove >= spaceBelow) {
            // sopra lo step: ancorato al BOTTOM del popover
            cssBottom = vh - popoverAnchor.top + MARGIN;
            arrowSide = 'bottom';
          } else {
            // sotto lo step: ancorato al TOP del popover
            cssTop = popoverAnchor.bottom + MARGIN;
            arrowSide = 'top';
          }
        } else {
          cssTop = vh / 2 - 100;
        }

        return (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }}
              onClick={() => { setStepModal(null); setStepModalNotes(''); setPopoverAnchor(null); }}
            />
            <div
              role="dialog"
              style={{
                position: 'fixed',
                ...(cssBottom !== undefined ? { bottom: cssBottom } : {}),
                ...(cssTop    !== undefined ? { top:    cssTop    } : {}),
                left, width: POP_W,
                zIndex: 9999,
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 10px 30px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.08)',
                border: '1px solid #e2e8f0',
                padding: 14,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: arrowLeft,
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 12, height: 12,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  ...(arrowSide === 'bottom'
                    ? { bottom: -7, borderTop: 'none', borderLeft: 'none' }
                    : { top: -7,    borderBottom: 'none', borderRight: 'none' }),
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#295fa9', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, flexShrink: 0,
                  }}
                >
                  <i className="bi bi-lightning-fill" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>{data.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, lineHeight: 1.35 }}>{data.desc}</div>
                </div>
                <button
                  className="btn btn-cmcc-ghost"
                  style={{ padding: '2px 6px', fontSize: 11, flexShrink: 0 }}
                  onClick={() => { setStepModal(null); setStepModalNotes(''); setPopoverAnchor(null); }}
                  aria-label="Chiudi"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <textarea
                className="form-control mb-2"
                rows={2}
                placeholder="Nota (opzionale)…"
                style={{ fontSize: 12, resize: 'none' }}
                value={stepModalNotes}
                onChange={e => setStepModalNotes(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {data.canReject && data.onReject && (
                  <button
                    className="btn btn-cmcc-danger"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                    onClick={data.onReject}
                  >
                    <i className="bi bi-x-lg me-1" />
                    Rifiuta
                  </button>
                )}
                <button
                  className="btn btn-cmcc-success"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={data.onApprove}
                >
                  <i className="bi bi-check-lg me-1" />
                  {data.canReject ? 'Approva' : 'Conferma'}
                </button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
