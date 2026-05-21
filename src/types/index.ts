export type ContractCategory = 'non-subordinato' | 'subordinato';

export type ContractType =
  | 'cococo'
  | 'occasionale'       // MOD09 OCCASIONALE — collaborazione autonoma occasionale
  | 'borsa-studio'
  | 'tirocinio'
  | 'consulenza-it'
  | 'consulenza-es'
  | 'subordinato-td'
  | 'subordinato-ti'
  | 'distacco';

/** Filone di ingresso del wizard. Discriminator unico per UI + filtri tipi. */
export type WizardEntryMode = 'recruiting' | 'existing' | 'external-mod09';

export type OperationType =
  | 'nuova-assunzione'
  | 'proroga'
  | 'trasformazione'
  | 'integrazione';

// ── Stati processo allineati al FlowChart CMCC ──────────────────────────────
// Pipeline a 13 step (incluso 'bozza').
//   bozza → approvazione-rs → verifica-gru →
//   approvazione-dir → approvazione-organo  ⟵ skip se requestedAmount < 1000 €
//                                              e/o non Direzione Scientifica
//   redazione → anteprima → firma-presidente →
//   protocollo → applicativi → anagrafica → monitoraggio → completato
// Le vecchie etichette ('elaborazione-gru', 'lettera-presentazione',
// 'contratto-preparazione', 'contratto-firma', 'zucchetti') sono mantenute
// come alias retro-compatibili (verranno mappate nella status-config).
export type ProcessStatus =
  | 'bozza'
  | 'approvazione-rs'
  | 'verifica-gru'
  | 'approvazione-dir'
  | 'approvazione-organo'   // NEW — Comitato Esecutivo / Governance
  | 'redazione'             // NEW — Redazione contratto (HR Admin)
  | 'anteprima'             // NEW — Anteprima alla Risorsa
  | 'firma-presidente'      // NEW — Firma del Presidente
  | 'protocollo'            // NEW — Protocollo Segreteria
  | 'applicativi'           // NEW — Inserimento Zucchetti/Helios/SAP
  | 'anagrafica'
  | 'monitoraggio'          // NEW — Monitoraggio post-firma
  | 'completato'
  // legacy aliases (manteniamo per non rompere MOCK_PROCESSES vecchi)
  | 'elaborazione-gru'
  | 'lettera-presentazione'
  | 'contratto-preparazione'
  | 'contratto-firma'
  | 'zucchetti'
  | 'annullato'
  | 'respinto';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// Ruoli simulati: 4 storici + 3 nuovi (Presidente/Governance/Segreteria)
export type UserRole = 'rs' | 'gru' | 'direttore' | 'amm' | 'presidente' | 'governance' | 'segreteria';

export interface Resource {
  idSubject: string;
  idEmploy: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  emailPrivate?: string;
  sex: 'M' | 'F';
  birthDate: string;
  birthCountry: string;
  residenceCountry: string;
  cf: string;
  contractType: string;
  contractNature: string;
  unit: string;
  unitCode: string;
  sede: string;
  profession: string;
  qualProf: string;
  study: string;
  isPartTime: boolean;
  partTimePercent: number;
  startDate: string;
  endDate?: string;
  ccnl: string;
  ccnlLevel?: string;
  isEU: boolean;
}

export interface Approval {
  id: string;
  role: 'rs' | 'direttore' | 'gru' | 'amm' | 'presidente' | 'governance' | 'segreteria';
  name: string;
  status: ApprovalStatus;
  timestamp?: string;
  notes?: string;
}

export interface ProcessDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt?: string;
  uploadedBy?: string;
  required: boolean;
  status: 'attesa' | 'caricato' | 'verificato';
  modType?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: string;
  notes?: string;
  toStatus?: ProcessStatus;
}

export interface Mod09Data {
  contractTypeMod09: string;        // from MOD09_CONTRACT_TYPES
  selectionMode: string;            // from MOD09_SELECTION_MODES
  language: string;                 // Italiano | Inglese
  isProroga: boolean;
  prorogaContractId?: string;
  activityObject: string;
  deliverables: string;
  startDate: string;
  endDate: string;
  qualifica: string;                // from QUALIFICHE_RANGES
  grossCompensation: number;
  numRate: number;
  paymentSchedule: string;          // from MOD09_PAYMENT_TERMS
  aliquota: 'piena' | 'agevolata';
  vatRequired: boolean;
  vatNumber: string;
  engagement: string;               // Full Time | Parziale
  engagementPercent: number;
  workLocation: string;             // from SEDI
  isPNRR: boolean;
  project: string;
  workPackage: string;
  orgUnit: string;
  costCenter: string;
  allocationProject: string;
  reportTo: string;
  tools: string;
  notes: string;
  directorName: string;
  directorDivisionName: string;
  welfare: number;
}

export interface Mod10Data {
  contractTypeMod10: string;        // from MOD10_CONTRACT_TYPES code
  isRinnovo: boolean;
  rinnovoType?: string;             // from MOD10_RINNOVO_TYPES
  startDate: string;
  endDate: string;
  mansione: string;
  workLocation: string;             // from SEDI
  qualifica: string;                // from QUALIFICHE_RANGES
  ccnlLevel: string;                // from CCNL_LEVELS_TERZ
  grossSalaryFT: number;            // lordo collaboratore FT
  partTimePercent: number;
  welfare: number;
  fondi: number;
  orgUnit: string;
  costCenter: string;               // from COST_CENTERS
  activityDescription: string;
  insurance: string;                // from MOD10_INSURANCE
  isExpat: boolean;
  expatCountry: string;
  directorName: string;
  notes: string;
}

export interface RecruitingCandidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  jobCallCode: string;
  jobCallTitle: string;
  unitCode: string;
  unitName: string;
  selectionDate: string;
  proposedQualifica: string;
  proposedContractType: string;
  nationality: string;
  isEU: boolean;
  study: string;
  cvUrl: string;
}

export interface ContractProcess {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ProcessStatus;
  operationType: OperationType;
  requestedBy: string;
  requestedByEmail: string;
  unitCode: string;
  unitName: string;
  projectCode: string;
  projectName: string;
  costCenter: string;
  isUrgent: boolean;
  notes: string;
  contractCategory?: ContractCategory;
  contractType?: ContractType;
  modType?: 'mod09' | 'mod10';
  resourceId?: string;
  resource?: Resource;
  isNewResource: boolean;
  newResourceName?: string;
  newResourceEmail?: string;
  fromRecruiting: boolean;
  recruitingCandidateId?: string;
  jobCallCode?: string;
  jobCallTitle?: string;
  mod09?: Mod09Data;
  mod10?: Mod10Data;
  approvals: Approval[];
  documents: ProcessDocument[];
  history: HistoryEntry[];
  mod13Submitted: boolean;
  mod138Required: boolean;
  mod138Submitted: boolean;
  mod102Required: boolean;
  mod102Submitted: boolean;
  mod14Required: boolean;
  mod14Submitted: boolean;
  zucchettiId?: string;
  zucchettiLoaded: boolean;
  /** Per i nuovi assunti (isNewResource=true): la fase Anagrafica richiede di
   *  riconciliare il profilo con la collection DossierRisorse (master Zucchetti)
   *  prima di poter avanzare a Monitoraggio/Completato. */
  zucchettiReconciled?: boolean;

  // ── FlowChart fields (gating + tracking) ────────────────────────────────
  /** Importo annuo lordo della richiesta. Sotto i 1000€ saltiamo i gate
   *  Direttore Esecutivo + Organo di competenza (CE/CdA). */
  requestedAmount?: number;
  /** Se true → l'approvazione passa per il Comitato Esecutivo (CE);
   *  se false → passa per Governance (CdA). */
  isDirezioneScientifica?: boolean;
  /** Per contratti subordinati: invio info allo studio esterno (Babbo)
   *  durante la redazione. Sotto-task non bloccante. */
  babboSent?: boolean;
  /** Stato del passaggio "Anteprima alla Risorsa":
   *  - 'pending'  → in attesa di feedback della risorsa
   *  - 'changes' → la risorsa ha segnalato modifiche → loop a redazione
   *  - 'approved' → ok, prosegue verso firma Presidente */
  previewStatus?: 'pending' | 'changes' | 'approved';
  /** Eventuali note di modifica dalla risorsa nel passaggio Anteprima. */
  previewNotes?: string;
  /** Numero di protocollo assegnato dalla Segreteria. */
  protocolNumber?: string;
  /** Data di scadenza monitorata in fase post-firma per future proroghe. */
  monitoringEndDate?: string;

  /** Filone di ingresso scelto in WizardEntry. Opzionale per retro-compat con
   *  MOCK_PROCESSES storici (deriveEntryMode lo ricostruisce dai flag legacy). */
  entryMode?: WizardEntryMode;

  /** Regola contract-action CMCC: il processo produce un nuovo contratto
   *  oppure una modifica al contratto esistente. Calcolato dal wizard in
   *  base a tipologia/continuità/interruzione/rinnovo. */
  contractAction?: 'new-contract' | 'modify-contract';
  /** Motivazione human-readable della decisione contractAction. */
  contractActionReason?: string;
  /** Giorni di interruzione fra fine contratto attuale e inizio nuovo. */
  interruptionDays?: number;
}

export interface Unit {
  code: string;
  name: string;
  shortName: string;
  director: string;
  directorEmail: string;
  city: string;
}

export interface Project {
  code: string;
  name: string;
  unitCode: string;
  pi: string;
  endDate: string;
  costCenter: string;
}
