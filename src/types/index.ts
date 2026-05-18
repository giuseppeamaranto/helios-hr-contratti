export type ContractCategory = 'non-subordinato' | 'subordinato';

export type ContractType =
  | 'cococo'
  | 'borsa-studio'
  | 'tirocinio'
  | 'consulenza-it'
  | 'consulenza-es'
  | 'subordinato-td'
  | 'subordinato-ti'
  | 'distacco';

export type OperationType =
  | 'nuova-assunzione'
  | 'proroga'
  | 'trasformazione'
  | 'integrazione';

export type ProcessStatus =
  | 'bozza'
  | 'approvazione-rs'
  | 'approvazione-dir'
  | 'verifica-gru'
  | 'elaborazione-gru'
  | 'contratto-preparazione'
  | 'lettera-presentazione'
  | 'contratto-firma'
  | 'anagrafica'
  | 'zucchetti'
  | 'completato'
  | 'annullato'
  | 'respinto';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type UserRole = 'rs' | 'gru' | 'direttore' | 'amm';

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
  role: 'rs' | 'direttore' | 'gru' | 'amm';
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
  collaborationType: string;
  activityObject: string;
  deliverables: string;
  startDate: string;
  endDate: string;
  grossCompensation: number;
  paymentSchedule: 'mensile' | 'trimestrale' | 'saldo';
  vatRequired: boolean;
  vatNumber: string;
  isExclusive: boolean;
  workLocation: string;
  tools: string;
  reportTo: string;
}

export interface Mod10Data {
  ccnl: string;
  contractLevel: string;
  profession: string;
  qualProf: string;
  ral: number;
  isPartTime: boolean;
  partTimePercent: number;
  startDate: string;
  endDate: string;
  isTimeIndeterminate: boolean;
  activityDescription: string;
  workLocation: string;
  isExpat: boolean;
  expatCountry: string;
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
