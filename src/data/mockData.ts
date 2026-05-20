import type { Resource, ContractProcess, Unit, Project } from '../types';

// ── Units (from DossierRisorse DSUNIT field) ───────────────────────────────
export const UNITS: Unit[] = [
  { code: 'ICR',  name: 'Istituto per la Resilienza Climatica',           shortName: 'ICR',  director: 'Prof. Andrea Bianchi',   directorEmail: 'andrea.bianchi@cmcc.it',   city: 'Viterbo' },
  { code: 'IESP', name: 'Istituto per la Previsione del Sistema Terrestre',shortName: 'IESP', director: 'Prof. Laura Conti',      directorEmail: 'laura.conti@cmcc.it',      city: 'Bologna' },
  { code: 'EIEE', name: 'Istituto Europeo sull\'Economia e l\'Ambiente',  shortName: 'EIEE', director: 'Prof. Marco Ferretti',   directorEmail: 'marco.ferretti@cmcc.it',   city: 'Milano' },
  { code: 'IAFES',name: 'Istituto Analisi dei Sistemi ed Informatica',    shortName: 'IAFES',director: 'Prof. Giulia Romano',    directorEmail: 'giulia.romano@cmcc.it',    city: 'Sassari' },
  { code: 'REMHI',name: 'Regional Models and geo-Hydrological Impacts',   shortName: 'REMHI',director: 'Prof. Stefano Russo',    directorEmail: 'stefano.russo@cmcc.it',    city: 'Viterbo' },
  { code: 'ASC',  name: 'Advanced Scientific Computing',                   shortName: 'ASC',  director: 'Ing. Carlo Gentile',    directorEmail: 'carlo.gentile@cmcc.it',    city: 'Lecce' },
];

export const PROJECTS: Project[] = [
  { code: 'EU-HORIZON-2024-01', name: 'ClimAdapt - Climate Adaptation Tools',      unitCode: 'ICR',  pi: 'Prof. Bianchi',   endDate: '2026-12-31', costCenter: 'EU-HA01' },
  { code: 'EU-HORIZON-2024-02', name: 'OceanPredict - Atlantic Forecasting',        unitCode: 'IESP', pi: 'Prof. Conti',     endDate: '2027-06-30', costCenter: 'EU-OP02' },
  { code: 'PNRR-2023-ICR-01',  name: 'RETURN - Multi-Risk Science for Resilience', unitCode: 'ICR',  pi: 'Prof. Bianchi',   endDate: '2025-12-31', costCenter: 'PN-RE01' },
  { code: 'PNRR-2023-EIEE-01', name: 'GRINS - Growing Resilient, Inclusive Italy', unitCode: 'EIEE', pi: 'Prof. Ferretti',  endDate: '2025-12-31', costCenter: 'PN-GR01' },
  { code: 'MUR-2024-IESP-01',  name: 'PRIN 2023 - Ciclo Idrologico Mediterraneo',  unitCode: 'IESP', pi: 'Prof. Conti',     endDate: '2026-09-30', costCenter: 'MU-PR01' },
  { code: 'CMCC-CORE-IAFES',   name: 'Institutional Core Activity - IAFES',         unitCode: 'IAFES',pi: 'Prof. Romano',    endDate: '2026-12-31', costCenter: 'CO-IA01' },
  { code: 'EU-LIFE-2023-01',   name: 'LIFE CLIMAX - Extreme Events Atlas',           unitCode: 'REMHI',pi: 'Prof. Russo',     endDate: '2026-06-30', costCenter: 'EU-LI01' },
  { code: 'ASC-CORE-2024',     name: 'HPC Infrastructure & Operations',              unitCode: 'ASC',  pi: 'Ing. Gentile',    endDate: '2025-12-31', costCenter: 'CO-AS01' },
];

// ── Picklist MOD09 — da Excel MOD09-GRU rev42 ────────────────────────────

/** Tipologia contratto (dropdown MOD09, cella B8) */
export const MOD09_CONTRACT_TYPES = [
  { code: 'COCOCO',    label: 'Collaborazione Coordinata e Continuativa', aliquotaPiena: 0.3503, aliquotaAgevolata: 0.24 },
  { code: 'OCCASIONALE', label: 'Collaborazione Autonoma Occasionale',    aliquotaPiena: 0.3503, aliquotaAgevolata: 0.24 },
  { code: 'CONSULENZA',  label: 'Consulenza',                             aliquotaPiena: 0,      aliquotaAgevolata: 0    },
  { code: 'CONS_EST',    label: 'Consulenza Estera',                      aliquotaPiena: 0,      aliquotaAgevolata: 0    },
];

/** Modalità di selezione (dropdown MOD09, da codifiche AT13-AT17) */
export const MOD09_SELECTION_MODES = [
  { code: 'JOB_CALL',    label: 'Job Call (selezione pubblica)' },
  { code: 'ATS',         label: 'CV presente in ATS (Application Tracking System)', fromRecruiting: true },
  { code: 'AFFILIATO',   label: 'Affiliato (da oltre 24 mesi)' },
  { code: 'CHIARA_FAMA', label: 'Chiara Fama' },
];

/** Lingue del contratto (dropdown MOD09) */
export const MOD09_LANGUAGES = ['Italiano', 'Inglese'];

/** Termini di pagamento (dropdown MOD09, AT115-AT119) */
export const MOD09_PAYMENT_TERMS = ['Mensile', 'Bimestrale', 'Trimestrale', 'Altro'];

/** Impegno (dropdown MOD09) */
export const MOD09_ENGAGEMENT = ['Full Time', 'Parziale'];

/** Aliquote contributi (da tabella MOD09) */
export const MOD09_ALIQUOTE = {
  inps:  { piena: 0.3503, agevolata: 0.24 },
  inail: { piena: 0.004,  agevolata: 0.004 },
};

// ── Picklist MOD10 — da Excel MOD10-10BIS-GRU rev21 ──────────────────────

/** Tipologia contratto subordinato (dropdown MOD10, AM47-AM53) */
export const MOD10_CONTRACT_TYPES = [
  { code: 'IMP_TI', label: 'Impiegato a tempo indeterminato', isIndeterminate: true,  isQuadro: false, isDir: false },
  { code: 'IMP_TD', label: 'Impiegato a tempo determinato',   isIndeterminate: false, isQuadro: false, isDir: false },
  { code: 'QUA_TI', label: 'Quadro a tempo indeterminato',    isIndeterminate: true,  isQuadro: true,  isDir: false },
  { code: 'QUA_TD', label: 'Quadro a tempo determinato',      isIndeterminate: false, isQuadro: true,  isDir: false },
  { code: 'DIR',    label: 'Dirigente',                       isIndeterminate: true,  isQuadro: false, isDir: true  },
];

/** Rinnovo/Trasformazione (dropdown MOD10, AG22-AG24) */
export const MOD10_RINNOVO_TYPES = [
  { code: 'PROROGA_TD',     label: 'Proroga Tempo Determinato' },
  { code: 'TRASFORMAZIONE', label: 'Trasformazione (TD → TI)' },
];

/** Livelli CCNL Terziario Confcommercio (da MOD10, AG11-AG20) */
export const CCNL_LEVELS_TERZ = [
  { code: '1', label: '1° Livello' },
  { code: '2', label: '2° Livello' },
  { code: '3', label: '3° Livello' },
  { code: '4', label: '4° Livello' },
  { code: '5', label: '5° Livello' },
  { code: '6', label: '6° Livello' },
  { code: '7', label: '7° Livello' },
  { code: 'QA', label: 'Quadro A' },
  { code: 'QB', label: 'Quadro B' },
  { code: 'D',  label: 'Dirigente' },
];

/** Assicurazione viaggio (dropdown MOD10) */
export const MOD10_INSURANCE = [
  { code: 'FREQ',  label: 'Sì — Viaggiatore Frequente' },
  { code: 'OCC',   label: 'Sì — Viaggiatore Occasionale' },
  { code: 'NO',    label: 'No' },
];

// ── Qualifiche con range retributivi (foglio QUALIFICHE di MOD09) ─────────

export interface QualificaRange {
  code: string;
  label: string;
  minLordo: number | null;
  maxLordo: number | null;
  rateOrariaMin: number | null;
  rateOrariaMax: number | null;
  descrizione: string;
}

export const QUALIFICHE_RANGES: QualificaRange[] = [
  { code: 'PRINCIPAL_SCI', label: 'Principal Scientist',       minLordo: 70000, maxLordo: null,  rateOrariaMin: 50.31, rateOrariaMax: null,  descrizione: 'Coordina gruppi e programmi di ricerca; supporta la Direzione Scientifica. Min 13 anni esperienza + PhD.' },
  { code: 'SR_SCI',        label: 'Senior Scientist',          minLordo: 60000, maxLordo: null,  rateOrariaMin: 43.12, rateOrariaMax: null,  descrizione: 'Coordina gruppi di lavoro e progetti; autonomo su problemi complessi. Min 10 anni + PhD.' },
  { code: 'SCI',           label: 'Scientist',                 minLordo: 40000, maxLordo: 80000, rateOrariaMin: 28.75, rateOrariaMax: 57.5,  descrizione: 'Autonomo nell\'attività di ricerca; gestisce WP di progetto; collabora alla presentazione di proposte. Min 6 anni + PhD.' },
  { code: 'JR_SCI',        label: 'Junior Scientist',          minLordo: 33000, maxLordo: 65000, rateOrariaMin: 23.72, rateOrariaMax: 46.72, descrizione: 'Collabora in progetti nazionali/internazionali; partecipa alla pubblicazione. Min 3 anni + PhD.' },
  { code: 'POST_DOC',      label: 'Post Doc',                  minLordo: 28000, maxLordo: 55000, rateOrariaMin: 20.12, rateOrariaMax: 39.54, descrizione: 'Realizza ricerca su procedure prestabilite; contribuisce alla pubblicazione. Richiesto Dottorato.' },
  { code: 'POST_DEGREE',   label: 'Post Degree',               minLordo: 17000, maxLordo: 30000, rateOrariaMin: 12.22, rateOrariaMax: 21.56, descrizione: 'Collabora in progetti su procedure prestabilite. Richiesta Laurea Specialistica. Durata di riferimento: 1 anno.' },
  { code: 'PRINCIPAL_AS',  label: 'Principal Associate Scientist', minLordo: 70000, maxLordo: null,  rateOrariaMin: 50.31, rateOrariaMax: null,  descrizione: 'Supporta la Direzione strategica; guida nuovi filoni di ricerca. Min 13 anni.' },
  { code: 'SR_AS',         label: 'Senior Associate Scientist', minLordo: 50000, maxLordo: 70000, rateOrariaMin: 35.94, rateOrariaMax: 50.31, descrizione: 'Consulenza/supporto tecnico-scientifico avanzato; coordina attività di assistenza. Min 10 anni.' },
  { code: 'AS',            label: 'Associate Scientist',       minLordo: 35000, maxLordo: 60000, rateOrariaMin: 25.16, rateOrariaMax: 43.12, descrizione: 'Supporto tecnico-scientifico per analisi dati e sviluppo modelli. Min 3 anni.' },
  { code: 'JR_AS',         label: 'Junior Associate Scientist', minLordo: 21000, maxLordo: 40000, rateOrariaMin: 15.09, rateOrariaMax: 28.75, descrizione: 'Progetta e analizza dati; manutenzione e sviluppo software. Diploma o cultura equivalente.' },
  { code: 'PRINCIPAL_MGR', label: 'Principal Scientific Manager', minLordo: 38000, maxLordo: null,  rateOrariaMin: 27.31, rateOrariaMax: null,  descrizione: 'Coordina gestione di attività e progetti complessi; rappresenta la Fondazione. Min 10 anni + Laurea.' },
  { code: 'SR_MGR',        label: 'Senior Scientific Manager',  minLordo: 33000, maxLordo: null,  rateOrariaMin: 23.72, rateOrariaMax: null,  descrizione: 'Gestisce portafogli di progetti; coordina team; sviluppa strategie a lungo termine. Min 8 anni.' },
  { code: 'JR_MGR',        label: 'Junior Scientific Manager',  minLordo: 22000, maxLordo: 45000, rateOrariaMin: 15.81, rateOrariaMax: 32.34, descrizione: 'Collabora alla gestione di progetti; applica best practice; supervisiona attività. Laurea.' },
  { code: 'TEC_MAN',       label: 'Personale Tecnico-Manageriale', minLordo: null,  maxLordo: null,  rateOrariaMin: null,  rateOrariaMax: null,  descrizione: 'Inquadramento definito in base al posizionamento in organigramma e responsabilità (CCNL di riferimento).' },
];

// ── Centri di Costo (da colonna AS del MOD09 e AW del MOD10) ─────────────

export const COST_CENTERS = [
  { code: '23100000', label: '23100000 - IPSO' },
  { code: '23101001', label: '23101001 - ICC' },
  { code: '23101002', label: '23101002 - PSEO' },
  { code: '23101003', label: '23101003 - GCNF' },
  { code: '23101004', label: '23101004 - AIML' },
  { code: '23101100', label: '23101100 - ICR' },
  { code: '23101102', label: '23101102 - IAFES' },
  { code: '23101103', label: '23101103 - RAAS' },
  { code: '23101104', label: '23101104 - REMHI' },
  { code: '23101106', label: '23101106 - SOWAS' },
  { code: '23101200', label: '23101200 - EIEE' },
  { code: '23101201', label: '23101201 - SEME' },
  { code: '23101202', label: '23101202 - ECIP' },
  { code: '23101203', label: '23101203 - TCT' },
  { code: '23101300', label: '23101300 - IESP' },
  { code: '23101305', label: '23101305 - GOCO' },
  { code: '23101306', label: '23101306 - ESYDA' },
  { code: '23101307', label: '23101307 - CLIVAP' },
  { code: '23101308', label: '23101308 - ROFS' },
  { code: '23101400', label: '23101400 - ATEC' },
  { code: '23101500', label: '23101500 - ADIC' },
  { code: '23102101', label: '23102101 - CDA, Comitato Esec.' },
  { code: '23102102', label: '23102102 - Collegio Revisori' },
  { code: '23102103', label: '23102103 - Consiglio Scientifico' },
  { code: '23102104', label: '23102104 - Organismo di Vigilanza' },
  { code: '23102201', label: '23102201 - Fund Raising' },
  { code: '23102202', label: '23102202 - Communication e Science Outreach' },
  { code: '23102203', label: '23102203 - IT' },
  { code: '23102204', label: '23102204 - AF' },
  { code: '23102205', label: '23102205 - Legal e Contract Advisory' },
  { code: '23102206', label: '23102206 - People e Culture' },
  { code: '23102207', label: '23102207 - Executive Office' },
  { code: '23102208', label: '23102208 - Division Manager' },
  { code: '23102209', label: '23102209 - Facility Mgmt e HSE' },
  { code: '23102210', label: '23102210 - Amministrazione Generico' },
  { code: '23102211', label: '23102211 - Altri costi centrali' },
  { code: '23102212', label: '23102212 - General Counsel' },
  { code: '23102213', label: '23102213 - Public Procurement' },
  { code: '23102214', label: '23102214 - Project Admin & Management Control' },
  { code: '23102220', label: '23102220 - Licenze e Acquisti IT' },
  { code: '23102301', label: '23102301 - Old Data Center' },
  { code: '23102302', label: '23102302 - Data Center' },
  { code: '23102303', label: '23102303 - Conness. reti e dati' },
  { code: '23102304', label: '23102304 - Servizi Cybersecurity' },
  { code: '23102401', label: '23102401 - Comitato strategico' },
  { code: '23102402', label: '23102402 - Partecipazioni' },
  { code: '23102403', label: '23102403 - Annual meeting' },
  { code: '23102404', label: '23102404 - Cooperaz. Scientif.' },
  { code: '23102405', label: '23102405 - Fellows programme' },
  { code: '23102406', label: '23102406 - Direzione Scientific' },
  { code: '23102407', label: '23102407 - Leadership Group' },
  { code: '23102408', label: '23102408 - Riviste abbonamenti servizi alla ricerca' },
  { code: '23103010', label: '23103010 - Bologna' },
  { code: '23103020', label: '23103020 - Caserta' },
  { code: '23103030', label: '23103030 - Lecce' },
  { code: '23103031', label: '23103031 - Lecce Spazio' },
  { code: '23103040', label: '23103040 - Milano Base' },
  { code: '23103050', label: '23103050 - Torino' },
  { code: '23103060', label: '23103060 - Civitavecchia' },
  { code: '23103070', label: '23103070 - Milano Regus' },
  { code: '23103080', label: '23103080 - Sassari' },
  { code: '23103090', label: '23103090 - Venezia' },
  { code: '23103100', label: '23103100 - Viterbo' },
  { code: '23103110', label: '23103110 - Milano Via Savona' },
  { code: '23104000', label: '23104000 - Altra Formazione Superiore' },
  { code: '23106000', label: '23106000 - Infrastrutture' },
  { code: '23107100', label: '23107100 - Direzione Operations' },
];

// ── Sedi (da colonne AT del MOD09 e AO del MOD10) ────────────────────────

export const SEDI = [
  'Lecce - Via Marco Biagi, 5',
  'Bologna - Viale C. Berti Pichat 6/2',
  'Caserta - Via Thomas Alva Edison s.n.c.',
  'Milano - Largo Francesco Richini, 6',
  'Milano - Via Bergognone, 34',
  'Milano - Via Savona',
  'Sassari - Via De Nicola, 9',
  'Venezia Marghera - Via della Libertà, 12',
  'Viterbo - Via Igino Garbini, 51',
  'Remoto',
  'Misto (presenza + remoto)',
];

// ── Unità Organizzative (da colonna AU del MOD09 / AG del MOD10) ──────────
//
// `ORG_UNITS` è la lista strutturata (code, name, parent Istituto) usata dalle
// dropdown "Unità Organizzative" in Step1Avvio e dai moduli MOD09/MOD10.
// Il parent serve a filtrare i progetti (vincolati al codice Istituto).

export interface OrgUnit {
  code: string;          // es. 'ESYDA', 'CLIVAP', 'GOCO', 'ROFS', 'ICR'
  name: string;          // es. 'Earth System Model Data and Analytics'
  parentInstitute: string; // 'ICR' | 'IESP' | 'EIEE' | 'ASC' | 'CENTRALE' | 'IND'
  group: 'Istituti' | 'Divisioni Scientifiche' | 'Centri Tecnici' | 'Divisioni di Supporto';
}

export const ORG_UNITS: OrgUnit[] = [
  // Istituti — sono "ombrello"; il parent coincide con se stessi
  { code: 'ICR',  name: 'Istituto per la Resilienza Climatica',                  parentInstitute: 'ICR',  group: 'Istituti' },
  { code: 'IESP', name: 'Istituto Euro-Mediterraneo per le Previsioni e Scenari',parentInstitute: 'IESP', group: 'Istituti' },
  { code: 'EIEE', name: 'Istituto Economia e Impatti dell\'Energia',             parentInstitute: 'EIEE', group: 'Istituti' },
  { code: 'ASC',  name: 'Adaptation and Mitigation Science Center',              parentInstitute: 'ASC',  group: 'Istituti' },

  // Divisioni Scientifiche — mappate al parent Istituto via numerazione cost-center
  { code: 'IAFES', name: 'Impacts on Agriculture, Forests and Ecosystem Services', parentInstitute: 'ICR',  group: 'Divisioni Scientifiche' },
  { code: 'RAAS',  name: 'Regional Analysis and Atmospheric Science',              parentInstitute: 'ICR',  group: 'Divisioni Scientifiche' },
  { code: 'REMHI', name: 'Regional Models and geo-Hydrological Impacts',           parentInstitute: 'ICR',  group: 'Divisioni Scientifiche' },
  { code: 'SOWAS', name: 'Sustainable Use of Water Resources in the Alpine Region',parentInstitute: 'ICR',  group: 'Divisioni Scientifiche' },
  { code: 'SEME',  name: 'Sustainable Marine Ecosystems',                          parentInstitute: 'EIEE', group: 'Divisioni Scientifiche' },
  { code: 'ECIP',  name: 'Economic Analysis of Climate Impacts and Policy',        parentInstitute: 'EIEE', group: 'Divisioni Scientifiche' },
  { code: 'TCT',   name: 'Transdisciplinary Themes in Climate Change',             parentInstitute: 'EIEE', group: 'Divisioni Scientifiche' },
  { code: 'GOCO',  name: 'Global Carbon Cycle',                                    parentInstitute: 'IESP', group: 'Divisioni Scientifiche' },
  { code: 'ESYDA', name: 'Earth System Model Data and Analytics',                  parentInstitute: 'IESP', group: 'Divisioni Scientifiche' },
  { code: 'CLIVAP',name: 'Climate Variability and Prediction',                     parentInstitute: 'IESP', group: 'Divisioni Scientifiche' },
  { code: 'ROFS',  name: 'Regional Ocean and Forecast System',                     parentInstitute: 'IESP', group: 'Divisioni Scientifiche' },
  { code: 'OPA',   name: 'Ocean Physics and Assimilation',                         parentInstitute: 'IESP', group: 'Divisioni Scientifiche' },
  { code: 'MEOM',  name: 'Marine Ecosystems and Observations Methods',             parentInstitute: 'IESP', group: 'Divisioni Scientifiche' },

  // Centri Tecnici — ASC fa da parent storico
  { code: 'HPCC',  name: 'High Performance Computing Center',                      parentInstitute: 'ASC',  group: 'Centri Tecnici' },
  { code: 'ADIC',  name: 'Advanced Digital Innovation Center',                     parentInstitute: 'ASC',  group: 'Centri Tecnici' },
  { code: 'ATEC',  name: 'Advanced Training and Education Center',                 parentInstitute: 'ASC',  group: 'Centri Tecnici' },

  // Divisioni di Supporto — strutture centrali (parent CENTRALE)
  { code: 'EXEC',   name: 'Executive Office',                              parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'GC',     name: 'General Counsel',                               parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'LEGAL',  name: 'Legal & Contract Advisory',                     parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'PEOPLE', name: 'People & Culture',                              parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'AF',     name: 'Administration & Finance',                      parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'PROC',   name: 'Public Procurement',                            parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'PAMC',   name: 'Project Administration & Management Control',   parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'IT',     name: 'Information Technology',                        parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'FMHSE',  name: 'Facility Management & HSE',                     parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'COMM',   name: 'Communication & Science Outreach',              parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
  { code: 'FUND',   name: 'Fund-Raising',                                  parentInstitute: 'CENTRALE', group: 'Divisioni di Supporto' },
];

/** Returns the parent Institute code for an org-unit code, or '' if not found. */
export function instituteForOrgUnit(code: string): string {
  return ORG_UNITS.find(u => u.code === code)?.parentInstitute ?? '';
}

/** Returns the full "CODE — Name" display string for an org-unit code. */
export function orgUnitLabel(code: string): string {
  const u = ORG_UNITS.find(x => x.code === code);
  return u ? `${u.code} — ${u.name}` : code;
}

// Legacy export — string list mantenuta per compatibilità con MOD09/MOD10
export const ORG_UNITS_LIST = [
  // ── Istituti ──────────────────────────────────────────
  'ICR — Istituto per la Resilienza Climatica',
  'IESP — Istituto Euro-Mediterraneo per le Previsioni e Scenari',
  'EIEE — Istituto Economia e Impatti dell\'Energia',
  'ASC — Adaptation and Mitigation Science Center',

  // ── Divisioni Scientifiche ────────────────────────────
  'IAFES — Impacts on Agriculture, Forests and Ecosystem Services',
  'RAAS — Regional Analysis and Atmospheric Science',
  'REMHI — Regional Models and geo-Hydrological Impacts',
  'SOWAS — Sustainable Use of Water Resources in the Alpine Region',
  'SEME — Sustainable Marine Ecosystems',
  'ECIP — Economic Analysis of Climate Impacts and Policy',
  'TCT — Transdisciplinary Themes in Climate Change',
  'ROFS — Regional Ocean and Forecast System',
  'ESYDA — Earth System Model Data and Analytics',
  'GOCO — Global Carbon Cycle',
  'CLIVAP — Climate Variability and Prediction',
  'OPA — Ocean Physics and Assimilation',
  'MEOM — Marine Ecosystems and Observations Methods',

  // ── Centri Tecnici ────────────────────────────────────
  'HPCC — High Performance Computing Center',
  'ADIC — Advanced Digital Innovation Center',
  'ATEC — Advanced Training and Education Center',

  // ── Divisioni di Supporto ─────────────────────────────
  'Executive Office',
  'General Counsel',
  'Legal & Contract Advisory',
  'People & Culture',
  'Administration & Finance',
  'Public Procurement',
  'Project Administration & Management Control',
  'Information Technology',
  'Facility Management & HSE',
  'Communication & Science Outreach',
  'Fund-Raising',
];

// ── Legacy exports (mantenuti per compatibilità) ──────────────────────────

export const CCNL_TYPES = [
  { code: 'COCOCO', label: 'Collaborazione Coordinata e Continuativa' },
  { code: 'TERZ',   label: 'Terziario Confcommercio' },
  { code: 'DIRIG',  label: 'Dirigenti Terziario' },
];

export const CCNL_LEVELS: Record<string, { code: string; label: string }[]> = {
  TERZ:  CCNL_LEVELS_TERZ,
  DIRIG: [{ code: 'D', label: 'Dirigente' }],
};

export const PROFESSIONS = QUALIFICHE_RANGES.map(q => q.label.toUpperCase());

// ── Candidati da Recruiting (pre-alimentati dal flusso ATS) ──────────────

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

export const RECRUITING_CANDIDATES: RecruitingCandidate[] = [
  {
    id: 'REC-2025-001',
    firstName: 'Lorenzo', lastName: 'Marchetti', fullName: 'Lorenzo Marchetti',
    email: 'lorenzo.marchetti@cmcc.it',
    jobCallCode: 'JC-IESP-2025-03', jobCallTitle: 'Ricercatore Modellistica Atmosferica',
    unitCode: 'IESP', unitName: 'IESP - Istituto per la Previsione del Sistema Terrestre',
    selectionDate: '2025-05-10', proposedQualifica: 'Post Doc',
    proposedContractType: 'COLLABORAZIONE COORDINATA E CONTINUATIVA',
    nationality: 'ITALIA', isEU: true, study: 'PHD', cvUrl: '#',
  },
  {
    id: 'REC-2025-002',
    firstName: 'Amira', lastName: 'Ben Salah', fullName: 'Amira Ben Salah',
    email: 'amira.bensalah@cmcc.it',
    jobCallCode: 'JC-ICR-2025-07', jobCallTitle: 'Junior Researcher — Coastal Resilience',
    unitCode: 'ICR', unitName: 'ICR - Istituto per la Resilienza Climatica',
    selectionDate: '2025-05-14', proposedQualifica: 'Junior Associate Scientist',
    proposedContractType: 'COLLABORAZIONE COORDINATA E CONTINUATIVA',
    nationality: 'TUNISIA', isEU: false, study: 'Laurea', cvUrl: '#',
  },
  {
    id: 'REC-2025-003',
    firstName: 'Elena', lastName: 'Voss', fullName: 'Elena Voss',
    email: 'elena.voss@cmcc.it',
    jobCallCode: 'JC-EIEE-2025-02', jobCallTitle: 'Economist — Climate Policy Modelling',
    unitCode: 'EIEE', unitName: "EIEE - Istituto Europeo sull'Economia e l'Ambiente",
    selectionDate: '2025-05-16', proposedQualifica: 'Junior Scientist',
    proposedContractType: 'COLLABORAZIONE COORDINATA E CONTINUATIVA',
    nationality: 'GERMANIA', isEU: true, study: 'PHD', cvUrl: '#',
  },
  {
    id: 'REC-2025-004',
    firstName: 'Giulio', lastName: 'De Santis', fullName: 'Giulio De Santis',
    email: 'giulio.desantis@cmcc.it',
    jobCallCode: 'JC-ASC-2025-01', jobCallTitle: 'HPC System Engineer',
    unitCode: 'ASC', unitName: 'ASC - Advanced Scientific Computing',
    selectionDate: '2025-05-12', proposedQualifica: 'Junior Associate Scientist',
    proposedContractType: 'Impiegato a tempo determinato',
    nationality: 'ITALIA', isEU: true, study: 'Laurea', cvUrl: '#',
  },
];

// ── Resources (from DossierRisorse - 30 sample entries) ───────────────────
export const RESOURCES: Resource[] = [
  {
    idSubject: 'ACCGAB000001', idEmploy: '0004311', fullName: 'Accarino Gabriele',
    firstName: 'Gabriele', lastName: 'Accarino', email: 'gabriele.accarino@cmcc.it',
    emailPrivate: 'gabriele.accarino@gmail.com', sex: 'M', birthDate: '1992-05-09',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'CCRGRL92E09E506V',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'IESP - Istituto per la Previsione del Sistema Terrestre', unitCode: 'IESP',
    sede: 'Sede Legale (Lecce)', profession: 'JUNIOR SCIENTIST', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2023-02-01',
    endDate: '2024-09-30', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: true,
  },
  {
    idSubject: 'ACIARI000001', idEmploy: '0004303', fullName: 'Acierno Arianna',
    firstName: 'Arianna', lastName: 'Acierno', email: 'arianna.acierno@cmcc.it',
    emailPrivate: 'maybole3.14@gmail.com', sex: 'F', birthDate: '1982-12-15',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'CRNRNN82T55A462J',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'ICR - Istituto per la Resilienza Climatica', unitCode: 'ICR',
    sede: 'Sede Legale (Lecce)', profession: 'SENIOR SCIENTIFIC MANAGER', qualProf: 'GESTIONALE MANAGEMENT',
    study: 'Laurea', isPartTime: false, partTimePercent: 100, startDate: '2022-12-01',
    endDate: '2026-12-31', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: true,
  },
  {
    idSubject: 'ADAMAR000001', idEmploy: '0004725', fullName: 'Adani Mario',
    firstName: 'Mario', lastName: 'Adani', email: 'mario.adani@cmcc.it',
    emailPrivate: 'adanimario.asa@gmail.com', sex: 'M', birthDate: '1977-08-04',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'DNAMRA77M04F257U',
    contractType: 'Tempo determinato', contractNature: 'Lavoro dipendente',
    unit: 'IESP - Istituto per la Previsione del Sistema Terrestre', unitCode: 'IESP',
    sede: 'Bologna', profession: 'SCIENTIST', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2023-11-01',
    endDate: '2025-10-31', ccnl: 'Terziario Confcommercio', ccnlLevel: '002', isEU: true,
  },
  {
    idSubject: 'ADEODU000001', idEmploy: '0005026', fullName: 'Adeniyi Odunayo David',
    firstName: 'Odunayo David', lastName: 'Adeniyi', email: 'odunayodavid.adeniyi@cmcc.it',
    emailPrivate: 'adeniyiodunayo3@gmail.com', sex: 'M', birthDate: '1993-12-05',
    birthCountry: 'NIGERIA', residenceCountry: 'NIGERIA', cf: 'DNYDYD93T05Z335R',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'ICR - Istituto per la Resilienza Climatica', unitCode: 'ICR',
    sede: 'Viterbo', profession: 'POST DOC', qualProf: 'TECNICO SCIENTIFICO',
    study: 'Laurea', isPartTime: false, partTimePercent: 100, startDate: '2024-11-04',
    endDate: '2026-08-31', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: false,
  },
  {
    idSubject: 'ABOLAR000001', idEmploy: '0004627', fullName: 'Abou Chehade Lara',
    firstName: 'Lara', lastName: 'Abou Chehade', email: 'lara.chehade@cmcc.it',
    emailPrivate: 'chehadeh.lara@gmail.com', sex: 'F', birthDate: '1990-07-28',
    birthCountry: 'LIBANO', residenceCountry: 'ITALIA', cf: 'BCHLRA90L68Z229L',
    contractType: 'Tempo determinato', contractNature: 'Lavoro dipendente',
    unit: 'ICR - Istituto per la Resilienza Climatica', unitCode: 'ICR',
    sede: 'Sassari', profession: 'JUNIOR ASSOCIATE SCIENTIST', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2023-07-14',
    endDate: '2026-04-30', ccnl: 'Terziario Confcommercio', ccnlLevel: '003', isEU: false,
  },
  {
    idSubject: 'ABDMOA000001', idEmploy: '0004980', fullName: 'Abdelhamid Abdelnaby Moaz Mohammed Reyad',
    firstName: 'Moaz Mohammed', lastName: 'Abdelhamid', email: 'moaz.reyad@cmcc.it',
    emailPrivate: undefined, sex: 'M', birthDate: '1980-12-18',
    birthCountry: 'EGITTO', residenceCountry: 'EGITTO', cf: 'BDLMMH80T18Z336R',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'IESP - Istituto per la Previsione del Sistema Terrestre', unitCode: 'IESP',
    sede: 'Bologna', profession: 'SENIOR RESEARCH ASSOCIATE', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2024-09-16',
    endDate: '2026-09-15', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: false,
  },
  {
    idSubject: 'ABOARM000001', idEmploy: '0005279', fullName: 'Aboudrar-Meda Armande',
    firstName: 'Armande', lastName: 'Aboudrar-Meda', email: 'armande.aboudrar-meda@cmcc.it',
    emailPrivate: 'armandeam01@gmail.com', sex: 'F', birthDate: '2001-11-19',
    birthCountry: 'FRANCIA', residenceCountry: 'FRANCIA', cf: 'BDRRND01S59Z110O',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'EIEE - Istituto Europeo sull\'Economia e l\'Ambiente', unitCode: 'EIEE',
    sede: 'Venezia', profession: 'JUNIOR RESEARCH ASSOCIATE', qualProf: 'TECNICO SCIENTIFICO',
    study: 'Laurea', isPartTime: false, partTimePercent: 100, startDate: '2025-09-15',
    endDate: '2026-09-15', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: true,
  },
  {
    idSubject: 'ALIBEA000001', idEmploy: '0004850', fullName: 'Alibei Beatrice',
    firstName: 'Beatrice', lastName: 'Alibei', email: 'beatrice.alibei@cmcc.it',
    emailPrivate: 'b.alibei@gmail.com', sex: 'F', birthDate: '1988-03-22',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'LBABTR88C62I551K',
    contractType: 'Tempo indeterminato', contractNature: 'Lavoro dipendente',
    unit: 'EIEE - Istituto Europeo sull\'Economia e l\'Ambiente', unitCode: 'EIEE',
    sede: 'Milano c/o Via Savona', profession: 'SENIOR SCIENTIST', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2019-04-01',
    ccnl: 'Terziario Confcommercio', ccnlLevel: '001', isEU: true,
  },
  {
    idSubject: 'AMBFED000001', idEmploy: '0003100', fullName: 'Ambrosino Federico',
    firstName: 'Federico', lastName: 'Ambrosino', email: 'federico.ambrosino@cmcc.it',
    emailPrivate: 'f.ambrosino@hotmail.it', sex: 'M', birthDate: '1985-07-15',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'MBRFRC85L15F839P',
    contractType: 'Tempo indeterminato', contractNature: 'Lavoro dipendente',
    unit: 'REMHI - Regional Models', unitCode: 'REMHI',
    sede: 'Viterbo', profession: 'SCIENTIFIC MANAGER', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2015-01-05',
    ccnl: 'Terziario Confcommercio', ccnlLevel: '002', isEU: true,
  },
  {
    idSubject: 'BALCAR000001', idEmploy: '0004520', fullName: 'Balestra Carlo',
    firstName: 'Carlo', lastName: 'Balestra', email: 'carlo.balestra@cmcc.it',
    emailPrivate: 'carlo.balestra@gmail.com', sex: 'M', birthDate: '1991-11-08',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'BLSCRL91S08H501X',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'ICR - Istituto per la Resilienza Climatica', unitCode: 'ICR',
    sede: 'Viterbo', profession: 'POST DOC', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2024-01-15',
    endDate: '2025-12-31', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: true,
  },
  {
    idSubject: 'BARVIO000001', idEmploy: '0004610', fullName: 'Barra Viola',
    firstName: 'Viola', lastName: 'Barra', email: 'viola.barra@cmcc.it',
    emailPrivate: 'viola.barra@yahoo.it', sex: 'F', birthDate: '1994-02-14',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'BRRVLA94B54F205Q',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'IAFES', unitCode: 'IAFES',
    sede: 'Sassari', profession: 'JUNIOR RESEARCH ASSOCIATE', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2023-10-01',
    endDate: '2025-09-30', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: true,
  },
  {
    idSubject: 'CANGIA000001', idEmploy: '0004200', fullName: 'Canu Gianluca',
    firstName: 'Gianluca', lastName: 'Canu', email: 'gianluca.canu@cmcc.it',
    emailPrivate: undefined, sex: 'M', birthDate: '1987-09-30',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'CNAGLC87P30B354Z',
    contractType: 'Tempo indeterminato', contractNature: 'Lavoro dipendente',
    unit: 'ASC - Advanced Scientific Computing', unitCode: 'ASC',
    sede: 'Sede Legale (Lecce)', profession: 'PERSONALE TECNICO MANAGERIALE', qualProf: 'AMMINISTRATIVO',
    study: 'Laurea', isPartTime: false, partTimePercent: 100, startDate: '2018-06-01',
    ccnl: 'Terziario Confcommercio', ccnlLevel: '003', isEU: true,
  },
  {
    idSubject: 'DELPAO000001', idEmploy: '0004900', fullName: 'Dell\'Aquila Paolo',
    firstName: 'Paolo', lastName: 'Dell\'Aquila', email: 'paolo.dellaquila@cmcc.it',
    emailPrivate: 'p.dellaquila@gmail.com', sex: 'M', birthDate: '1979-05-20',
    birthCountry: 'ITALIA', residenceCountry: 'ITALIA', cf: 'DLLPLA79E20H501V',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'REMHI - Regional Models', unitCode: 'REMHI',
    sede: 'Viterbo', profession: 'SENIOR SCIENTIST', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2024-03-01',
    endDate: '2025-12-31', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: true,
  },
  {
    idSubject: 'FERROB000001', idEmploy: '0004750', fullName: 'Ferrari Roberto',
    firstName: 'Roberto', lastName: 'Ferrari', email: 'roberto.ferrari@cmcc.it',
    emailPrivate: 'r.ferrari@libero.it', sex: 'M', birthDate: '1983-01-12',
    birthCountry: 'STATI UNITI D\'AMERICA', residenceCountry: 'ITALIA', cf: 'FRRRRT83A12Z404T',
    contractType: 'Tempo determinato', contractNature: 'Lavoro dipendente',
    unit: 'EIEE - Istituto Europeo sull\'Economia e l\'Ambiente', unitCode: 'EIEE',
    sede: 'Milano c/o Via Savona', profession: 'SENIOR RESEARCH ASSOCIATE', qualProf: 'TECNICO SCIENTIFICO',
    study: 'PHD', isPartTime: false, partTimePercent: 100, startDate: '2023-06-01',
    endDate: '2025-05-31', ccnl: 'Terziario Confcommercio', ccnlLevel: '002', isEU: false,
  },
  {
    idSubject: 'GRESOF000001', idEmploy: '0004400', fullName: 'Greco Sofia',
    firstName: 'Sofia', lastName: 'Greco', email: 'sofia.greco@cmcc.it',
    emailPrivate: 'sofia.greco92@gmail.com', sex: 'F', birthDate: '1992-08-25',
    birthCountry: 'GRECIA', residenceCountry: 'ITALIA', cf: 'GRCSFO92M65Z115F',
    contractType: 'Tempo determinato', contractNature: 'Collaborazione coord.continuativa',
    unit: 'IESP - Istituto per la Previsione del Sistema Terrestre', unitCode: 'IESP',
    sede: 'Bologna', profession: 'POST DEGREE', qualProf: 'TECNICO SCIENTIFICO',
    study: 'Laurea', isPartTime: false, partTimePercent: 100, startDate: '2024-06-01',
    endDate: '2025-05-31', ccnl: 'Contratto CO.CO.CO', ccnlLevel: 'C', isEU: true,
  },
];

// ── Mock Contract Processes ────────────────────────────────────────────────
export const MOCK_PROCESSES: ContractProcess[] = [
  {
    id: 'PROC-2025-001',
    createdAt: '2025-04-10T09:00:00Z',
    updatedAt: '2025-05-15T14:30:00Z',
    status: 'completato',
    operationType: 'nuova-assunzione',
    requestedBy: 'Prof. Laura Conti',
    requestedByEmail: 'laura.conti@cmcc.it',
    unitCode: 'IESP',
    unitName: 'IESP - Istituto per la Previsione del Sistema Terrestre',
    projectCode: 'MUR-2024-IESP-01',
    projectName: 'PRIN 2023 - Ciclo Idrologico Mediterraneo',
    costCenter: 'MU-PR01',
    isUrgent: false,
    notes: 'Ricercatore per attività di modellistica oceanografica',
    contractCategory: 'non-subordinato',
    contractType: 'cococo',
    modType: 'mod09',
    resourceId: 'ABDMOA000001',
    resource: RESOURCES.find(r => r.idSubject === 'ABDMOA000001'),
    isNewResource: false,
    fromRecruiting: false,
    jobCallCode: undefined,
    jobCallTitle: undefined,
    mod09: {
      contractTypeMod09: 'COCOCO',
      selectionMode: 'JOB_CALL',
      language: 'Italiano',
      isProroga: false,
      activityObject: 'Sviluppo e validazione di modelli oceanografici per la previsione del sistema terrestre',
      deliverables: 'Report trimestrali, articoli scientifici, dataset elaborati',
      startDate: '2024-09-16',
      endDate: '2026-09-15',
      qualifica: 'POST_DOC',
      grossCompensation: 2800,
      numRate: 24,
      paymentSchedule: 'mensile',
      aliquota: 'piena',
      vatRequired: false,
      vatNumber: '',
      engagement: 'Full Time',
      engagementPercent: 100,
      workLocation: 'Bologna - Viale C. Berti Pichat 6/2',
      isPNRR: false,
      project: '',
      workPackage: '',
      orgUnit: '',
      costCenter: '',
      allocationProject: '',
      reportTo: 'Prof. Laura Conti',
      tools: 'HPC CMCC, NEMO model, Python',
      notes: '',
      directorName: '',
      directorDivisionName: '',
      welfare: 0,
    },
    approvals: [
      { id: 'A1', role: 'rs', name: 'Prof. Laura Conti', status: 'approved', timestamp: '2025-04-11T10:00:00Z', notes: 'Approvato per progetto PRIN' },
      { id: 'A2', role: 'direttore', name: 'Prof. Laura Conti', status: 'approved', timestamp: '2025-04-12T14:00:00Z' },
      { id: 'A3', role: 'gru', name: 'Team GRU', status: 'approved', timestamp: '2025-04-15T09:00:00Z', notes: 'Documentazione completa e conforme' },
      { id: 'A4', role: 'amm', name: 'Ufficio AMM', status: 'approved', timestamp: '2025-04-20T11:00:00Z' },
    ],
    documents: [
      { id: 'D1', name: 'CV Abdelhamid.pdf', type: 'cv', uploadedAt: '2025-04-11T09:30:00Z', uploadedBy: 'moaz.reyad@cmcc.it', required: true, status: 'verificato' },
      { id: 'D3', name: 'Passaporto.pdf', type: 'documento-identita', uploadedAt: '2025-04-12T10:00:00Z', uploadedBy: 'moaz.reyad@cmcc.it', required: true, status: 'verificato' },
      { id: 'D4', name: 'Codice Fiscale.pdf', type: 'codice-fiscale', uploadedAt: '2025-04-12T10:05:00Z', uploadedBy: 'moaz.reyad@cmcc.it', required: true, status: 'verificato' },
    ],
    history: [
      { id: 'H1', timestamp: '2025-04-10T09:00:00Z', action: 'Processo avviato', actor: 'Prof. Laura Conti', actorRole: 'Responsabile Struttura', toStatus: 'approvazione-rs' },
      { id: 'H2', timestamp: '2025-04-11T10:00:00Z', action: 'Approvato dalla Responsabile di Struttura', actor: 'Prof. Laura Conti', actorRole: 'RS', toStatus: 'approvazione-dir' },
      { id: 'H3', timestamp: '2025-04-12T14:00:00Z', action: 'Approvato dal Direttore', actor: 'Prof. Laura Conti', actorRole: 'Direttore', toStatus: 'verifica-gru' },
      { id: 'H4', timestamp: '2025-04-15T09:00:00Z', action: 'Verificato e approvato da GRU', actor: 'Team GRU', actorRole: 'GRU', toStatus: 'contratto-preparazione' },
      { id: 'H5', timestamp: '2025-04-20T11:00:00Z', action: 'Contratto predisposto da AMM', actor: 'Ufficio AMM', actorRole: 'AMM', toStatus: 'contratto-firma' },
      { id: 'H6', timestamp: '2025-04-25T16:00:00Z', action: 'Contratto firmato da tutte le parti', actor: 'Sistema', actorRole: 'Sistema', toStatus: 'anagrafica' },
      { id: 'H7', timestamp: '2025-05-05T10:00:00Z', action: 'Anagrafica completata (MOD13, MOD102)', actor: 'moaz.reyad@cmcc.it', actorRole: 'Collaboratore', toStatus: 'zucchetti' },
      { id: 'H8', timestamp: '2025-05-15T14:30:00Z', action: 'Caricato su Zucchetti — ID: ZUC-004980', actor: 'Ufficio AMM', actorRole: 'AMM', toStatus: 'completato' },
    ],
    mod13Submitted: true,
    mod138Required: true,
    mod138Submitted: true,
    mod102Required: true,
    mod102Submitted: true,
    mod14Required: false,
    mod14Submitted: false,
    zucchettiId: 'ZUC-004980',
    zucchettiLoaded: true,
  },
  {
    id: 'PROC-2025-002',
    createdAt: '2025-05-02T10:15:00Z',
    updatedAt: '2025-05-16T09:00:00Z',
    status: 'verifica-gru',
    operationType: 'proroga',
    requestedBy: 'Prof. Andrea Bianchi',
    requestedByEmail: 'andrea.bianchi@cmcc.it',
    unitCode: 'ICR',
    unitName: 'ICR - Istituto per la Resilienza Climatica',
    projectCode: 'PNRR-2023-ICR-01',
    projectName: 'RETURN - Multi-Risk Science for Resilience',
    costCenter: 'PN-RE01',
    isUrgent: true,
    notes: 'Proroga per completamento attività di ricerca RETURN',
    contractCategory: 'non-subordinato',
    contractType: 'cococo',
    modType: 'mod09',
    resourceId: 'BALCAR000001',
    resource: RESOURCES.find(r => r.idSubject === 'BALCAR000001'),
    isNewResource: false,
    fromRecruiting: false,
    jobCallCode: undefined,
    jobCallTitle: undefined,
    mod09: {
      contractTypeMod09: 'COCOCO',
      selectionMode: 'JOB_CALL',
      language: 'Italiano',
      isProroga: true,
      activityObject: 'Analisi della resilienza climatica dei sistemi costieri nel Mediterraneo',
      deliverables: 'Dataset, report scientifici, presentazioni',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      qualifica: 'POST_DOC',
      grossCompensation: 2500,
      numRate: 12,
      paymentSchedule: 'mensile',
      aliquota: 'piena',
      vatRequired: false,
      vatNumber: '',
      engagement: 'Full Time',
      engagementPercent: 100,
      workLocation: 'Viterbo - Via Igino Garbini, 51',
      isPNRR: true,
      project: '',
      workPackage: '',
      orgUnit: '',
      costCenter: '',
      allocationProject: '',
      reportTo: 'Prof. Andrea Bianchi',
      tools: 'Python, R, GIS tools',
      notes: '',
      directorName: '',
      directorDivisionName: '',
      welfare: 0,
    },
    approvals: [
      { id: 'A1', role: 'rs', name: 'Prof. Andrea Bianchi', status: 'approved', timestamp: '2025-05-03T09:00:00Z' },
      { id: 'A2', role: 'direttore', name: 'Prof. Andrea Bianchi', status: 'approved', timestamp: '2025-05-05T11:00:00Z' },
      { id: 'A3', role: 'gru', name: 'Team GRU', status: 'pending' },
      { id: 'A4', role: 'amm', name: 'Ufficio AMM', status: 'pending' },
    ],
    documents: [
      { id: 'D2', name: 'Documento_Identità.pdf', type: 'documento-identita', required: true, status: 'caricato' },
    ],
    history: [
      { id: 'H1', timestamp: '2025-05-02T10:15:00Z', action: 'Richiesta di proroga avviata', actor: 'Prof. Andrea Bianchi', actorRole: 'RS', toStatus: 'approvazione-rs' },
      { id: 'H2', timestamp: '2025-05-03T09:00:00Z', action: 'Approvato dal RS', actor: 'Prof. Andrea Bianchi', actorRole: 'RS', toStatus: 'approvazione-dir' },
      { id: 'H3', timestamp: '2025-05-05T11:00:00Z', action: 'Approvato dal Direttore', actor: 'Prof. Andrea Bianchi', actorRole: 'Direttore', toStatus: 'verifica-gru' },
    ],
    mod13Submitted: false,
    mod138Required: true,
    mod138Submitted: false,
    mod102Required: true,
    mod102Submitted: false,
    mod14Required: false,
    mod14Submitted: false,
    zucchettiLoaded: false,
  },
  {
    id: 'PROC-2025-003',
    createdAt: '2025-05-08T14:00:00Z',
    updatedAt: '2025-05-17T11:00:00Z',
    status: 'approvazione-dir',
    operationType: 'trasformazione',
    requestedBy: 'Prof. Marco Ferretti',
    requestedByEmail: 'marco.ferretti@cmcc.it',
    unitCode: 'EIEE',
    unitName: 'EIEE - Istituto Europeo sull\'Economia e l\'Ambiente',
    projectCode: 'PNRR-2023-EIEE-01',
    projectName: 'GRINS - Growing Resilient, Inclusive Italy',
    costCenter: 'PN-GR01',
    isUrgent: false,
    notes: 'Trasformazione da CoCoCo a Subordinato TD per senior researcher',
    contractCategory: 'subordinato',
    contractType: 'subordinato-td',
    modType: 'mod10',
    resourceId: 'ALIBEA000001',
    resource: RESOURCES.find(r => r.idSubject === 'ALIBEA000001'),
    isNewResource: false,
    fromRecruiting: false,
    jobCallCode: undefined,
    jobCallTitle: undefined,
    mod10: {
      contractTypeMod10: 'IMP_TD',
      isRinnovo: false,
      startDate: '2025-07-01',
      endDate: '2027-06-30',
      mansione: 'Ricerca su modelli di economia dell\'ambiente e scenari climatici',
      workLocation: 'Milano - Via Savona',
      qualifica: 'SR_SCI',
      ccnlLevel: '001',
      grossSalaryFT: 52000,
      partTimePercent: 100,
      welfare: 400,
      fondi: 400,
      orgUnit: '',
      costCenter: '',
      activityDescription: 'Ricerca su modelli di economia dell\'ambiente e scenari climatici',
      insurance: 'NO',
      isExpat: false,
      expatCountry: '',
      directorName: '',
      notes: '',
    },
    approvals: [
      { id: 'A1', role: 'rs', name: 'Prof. Marco Ferretti', status: 'approved', timestamp: '2025-05-09T10:00:00Z', notes: 'Profilo eccellente, risorsa strategica' },
      { id: 'A2', role: 'direttore', name: 'Prof. Marco Ferretti', status: 'pending' },
      { id: 'A3', role: 'gru', name: 'Team GRU', status: 'pending' },
      { id: 'A4', role: 'amm', name: 'Ufficio AMM', status: 'pending' },
    ],
    documents: [
      { id: 'D2', name: 'CV_Alibei.pdf', type: 'cv', required: true, status: 'caricato' },
    ],
    history: [
      { id: 'H1', timestamp: '2025-05-08T14:00:00Z', action: 'Avviata trasformazione contrattuale', actor: 'Prof. Marco Ferretti', actorRole: 'RS', toStatus: 'approvazione-rs' },
      { id: 'H2', timestamp: '2025-05-09T10:00:00Z', action: 'Approvato dal RS', actor: 'Prof. Marco Ferretti', actorRole: 'RS', toStatus: 'approvazione-dir' },
    ],
    mod13Submitted: false,
    mod138Required: true,
    mod138Submitted: false,
    mod102Required: false,
    mod102Submitted: false,
    mod14Required: true,
    mod14Submitted: false,
    zucchettiLoaded: false,
  },
  {
    id: 'PROC-2025-004',
    createdAt: '2025-05-12T08:30:00Z',
    updatedAt: '2025-05-18T10:00:00Z',
    status: 'firma-presidente',
    operationType: 'nuova-assunzione',
    requestedBy: 'Prof. Giulia Romano',
    requestedByEmail: 'giulia.romano@cmcc.it',
    unitCode: 'IAFES',
    unitName: 'IAFES',
    projectCode: 'CMCC-CORE-IAFES',
    projectName: 'Institutional Core Activity - IAFES',
    costCenter: 'CO-IA01',
    isUrgent: true,
    notes: 'Nuova borsa di studio per attività HPC e sviluppo software',
    contractCategory: 'non-subordinato',
    contractType: 'borsa-studio',
    modType: 'mod09',
    isNewResource: true,
    newResourceName: 'Valentina Esposito',
    newResourceEmail: 'valentina.esposito@cmcc.it',
    fromRecruiting: false,
    jobCallCode: undefined,
    jobCallTitle: undefined,
    mod09: {
      contractTypeMod09: 'COCOCO',
      selectionMode: 'JOB_CALL',
      language: 'Italiano',
      isProroga: false,
      activityObject: 'Sviluppo algoritmi di ottimizzazione per cluster HPC',
      deliverables: 'Codice sorgente, documentazione tecnica, report finale',
      startDate: '2025-06-01',
      endDate: '2026-05-31',
      qualifica: 'POST_DEGREE',
      grossCompensation: 1500,
      numRate: 12,
      paymentSchedule: 'mensile',
      aliquota: 'piena',
      vatRequired: false,
      vatNumber: '',
      engagement: 'Full Time',
      engagementPercent: 100,
      workLocation: 'Sassari - Via De Nicola, 9',
      isPNRR: false,
      project: '',
      workPackage: '',
      orgUnit: '',
      costCenter: '',
      allocationProject: '',
      reportTo: 'Prof. Giulia Romano',
      tools: 'C++, Python, MPI, SLURM',
      notes: '',
      directorName: '',
      directorDivisionName: '',
      welfare: 0,
    },
    approvals: [
      { id: 'A1', role: 'rs', name: 'Prof. Giulia Romano', status: 'approved', timestamp: '2025-05-13T09:00:00Z' },
      { id: 'A2', role: 'direttore', name: 'Prof. Giulia Romano', status: 'approved', timestamp: '2025-05-14T14:00:00Z' },
      { id: 'A3', role: 'gru', name: 'Team GRU', status: 'approved', timestamp: '2025-05-15T10:00:00Z', notes: 'OK, da completare MOD13 post-firma' },
      { id: 'A4', role: 'amm', name: 'Ufficio AMM', status: 'approved', timestamp: '2025-05-16T11:00:00Z' },
    ],
    documents: [
      { id: 'D2', name: 'CV_Esposito.pdf', type: 'cv', uploadedAt: '2025-05-12T09:10:00Z', uploadedBy: 'giulia.romano@cmcc.it', required: true, status: 'verificato' },
      { id: 'D3', name: 'Contratto_bozza.pdf', type: 'contratto', uploadedAt: '2025-05-16T11:30:00Z', uploadedBy: 'amm@cmcc.it', required: true, status: 'caricato' },
    ],
    history: [
      { id: 'H1', timestamp: '2025-05-12T08:30:00Z', action: 'Processo avviato', actor: 'Prof. Giulia Romano', actorRole: 'RS', toStatus: 'approvazione-rs' },
      { id: 'H2', timestamp: '2025-05-13T09:00:00Z', action: 'Approvato RS', actor: 'Prof. Giulia Romano', actorRole: 'RS', toStatus: 'approvazione-dir' },
      { id: 'H3', timestamp: '2025-05-14T14:00:00Z', action: 'Approvato Direttore', actor: 'Prof. Giulia Romano', actorRole: 'Direttore', toStatus: 'verifica-gru' },
      { id: 'H4', timestamp: '2025-05-15T10:00:00Z', action: 'Verificato GRU', actor: 'Team GRU', actorRole: 'GRU', toStatus: 'contratto-preparazione' },
      { id: 'H5', timestamp: '2025-05-16T11:00:00Z', action: 'Contratto predisposto', actor: 'Ufficio AMM', actorRole: 'AMM', toStatus: 'contratto-firma' },
    ],
    mod13Submitted: false,
    mod138Required: false,
    mod138Submitted: false,
    mod102Required: false,
    mod102Submitted: false,
    mod14Required: false,
    mod14Submitted: false,
    zucchettiLoaded: false,
  },
  {
    id: 'PROC-2025-005',
    createdAt: '2025-05-16T15:00:00Z',
    updatedAt: '2025-05-18T08:00:00Z',
    status: 'bozza',
    operationType: 'proroga',
    requestedBy: 'Prof. Stefano Russo',
    requestedByEmail: 'stefano.russo@cmcc.it',
    unitCode: 'REMHI',
    unitName: 'REMHI - Regional Models and geo-Hydrological Impacts',
    projectCode: 'EU-LIFE-2023-01',
    projectName: 'LIFE CLIMAX - Extreme Events Atlas',
    costCenter: 'EU-LI01',
    isUrgent: false,
    notes: '',
    contractCategory: 'non-subordinato',
    contractType: 'cococo',
    modType: 'mod09',
    resourceId: 'DELPAO000001',
    resource: RESOURCES.find(r => r.idSubject === 'DELPAO000001'),
    isNewResource: false,
    fromRecruiting: false,
    jobCallCode: undefined,
    jobCallTitle: undefined,
    mod09: {
      contractTypeMod09: 'COCOCO',
      selectionMode: 'JOB_CALL',
      language: 'Italiano',
      isProroga: true,
      activityObject: 'Analisi e catalogazione eventi estremi nel bacino Mediterraneo',
      deliverables: 'Atlas eventi estremi, database climatico',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      qualifica: 'SCI',
      grossCompensation: 3000,
      numRate: 6,
      paymentSchedule: 'mensile',
      aliquota: 'piena',
      vatRequired: false,
      vatNumber: '',
      engagement: 'Full Time',
      engagementPercent: 100,
      workLocation: 'Viterbo - Via Igino Garbini, 51',
      isPNRR: false,
      project: '',
      workPackage: '',
      orgUnit: '',
      costCenter: '',
      allocationProject: '',
      reportTo: 'Prof. Stefano Russo',
      tools: 'Python, NetCDF, Copernicus Data',
      notes: '',
      directorName: '',
      directorDivisionName: '',
      welfare: 0,
    },
    approvals: [
      { id: 'A1', role: 'rs', name: 'Prof. Stefano Russo', status: 'pending' },
      { id: 'A2', role: 'direttore', name: 'Prof. Stefano Russo', status: 'pending' },
      { id: 'A3', role: 'gru', name: 'Team GRU', status: 'pending' },
      { id: 'A4', role: 'amm', name: 'Ufficio AMM', status: 'pending' },
    ],
    documents: [],
    history: [
      { id: 'H1', timestamp: '2025-05-16T15:00:00Z', action: 'Bozza creata', actor: 'Prof. Stefano Russo', actorRole: 'RS', toStatus: 'bozza' },
    ],
    mod13Submitted: false,
    mod138Required: true,
    mod138Submitted: false,
    mod102Required: true,
    mod102Submitted: false,
    mod14Required: false,
    mod14Submitted: false,
    zucchettiLoaded: false,
  },
  {
    id: 'PROC-2025-006',
    createdAt: '2025-05-10T09:00:00Z',
    updatedAt: '2025-05-18T12:00:00Z',
    status: 'anagrafica',
    operationType: 'nuova-assunzione',
    requestedBy: 'Ing. Carlo Gentile',
    requestedByEmail: 'carlo.gentile@cmcc.it',
    unitCode: 'ASC',
    unitName: 'ASC - Advanced Scientific Computing',
    projectCode: 'ASC-CORE-2024',
    projectName: 'HPC Infrastructure & Operations',
    costCenter: 'CO-AS01',
    isUrgent: false,
    notes: 'Sistemista per gestione cluster HPC',
    contractCategory: 'subordinato',
    contractType: 'subordinato-td',
    modType: 'mod10',
    isNewResource: true,
    newResourceName: 'Marco Vitale',
    newResourceEmail: 'marco.vitale@cmcc.it',
    fromRecruiting: false,
    jobCallCode: undefined,
    jobCallTitle: undefined,
    mod10: {
      contractTypeMod10: 'IMP_TD',
      isRinnovo: false,
      startDate: '2025-06-01',
      endDate: '2026-05-31',
      mansione: 'Gestione e manutenzione infrastruttura HPC CMCC',
      workLocation: 'Lecce - Via Marco Biagi, 5',
      qualifica: 'TEC_MAN',
      ccnlLevel: '003',
      grossSalaryFT: 38000,
      partTimePercent: 100,
      welfare: 400,
      fondi: 400,
      orgUnit: '',
      costCenter: '',
      activityDescription: 'Gestione e manutenzione infrastruttura HPC CMCC',
      insurance: 'NO',
      isExpat: false,
      expatCountry: '',
      directorName: '',
      notes: '',
    },
    approvals: [
      { id: 'A1', role: 'rs', name: 'Ing. Carlo Gentile', status: 'approved', timestamp: '2025-05-11T10:00:00Z' },
      { id: 'A2', role: 'direttore', name: 'Ing. Carlo Gentile', status: 'approved', timestamp: '2025-05-12T14:00:00Z' },
      { id: 'A3', role: 'gru', name: 'Team GRU', status: 'approved', timestamp: '2025-05-13T09:00:00Z' },
      { id: 'A4', role: 'amm', name: 'Ufficio AMM', status: 'approved', timestamp: '2025-05-14T11:00:00Z' },
    ],
    documents: [
      { id: 'D2', name: 'CV_Vitale.pdf', type: 'cv', required: true, status: 'verificato', uploadedAt: '2025-05-10T09:35:00Z', uploadedBy: 'carlo.gentile@cmcc.it' },
      { id: 'D3', name: 'Contratto_firmato.pdf', type: 'contratto', required: true, status: 'verificato', uploadedAt: '2025-05-16T11:00:00Z', uploadedBy: 'amm@cmcc.it' },
    ],
    history: [
      { id: 'H1', timestamp: '2025-05-10T09:00:00Z', action: 'Processo avviato', actor: 'Ing. Carlo Gentile', actorRole: 'RS', toStatus: 'approvazione-rs' },
      { id: 'H2', timestamp: '2025-05-11T10:00:00Z', action: 'Approvato RS', actor: 'Ing. Carlo Gentile', actorRole: 'RS', toStatus: 'approvazione-dir' },
      { id: 'H3', timestamp: '2025-05-12T14:00:00Z', action: 'Approvato Direttore', actor: 'Ing. Carlo Gentile', actorRole: 'Direttore', toStatus: 'verifica-gru' },
      { id: 'H4', timestamp: '2025-05-13T09:00:00Z', action: 'Approvato GRU', actor: 'Team GRU', actorRole: 'GRU', toStatus: 'contratto-preparazione' },
      { id: 'H5', timestamp: '2025-05-14T11:00:00Z', action: 'Contratto predisposto', actor: 'Ufficio AMM', actorRole: 'AMM', toStatus: 'contratto-firma' },
      { id: 'H6', timestamp: '2025-05-17T09:00:00Z', action: 'Contratto firmato', actor: 'Sistema', actorRole: 'Sistema', toStatus: 'anagrafica' },
    ],
    mod13Submitted: false,
    mod138Required: true,
    mod138Submitted: false,
    mod102Required: false,
    mod102Submitted: false,
    mod14Required: true,
    mod14Submitted: true,
    zucchettiLoaded: false,
  },
];

export const CURRENT_USER = {
  name: 'ADMIN USER',
  email: 'admin.user@cmcc.it',
  role: 'gru' as const,
  unit: 'GRU - Gestione Risorse Umane',
};

// STATUS_CONFIG — allineato al FlowChart CMCC (13 step + 2 terminali)
// step numbering segue STEPS in ProcessDetail.tsx
export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; step: number }> = {
  'bozza':                  { label: 'Bozza',              color: '#64748b', bg: '#f1f5f9', icon: 'bi-file-earmark',        step: 0 },
  'approvazione-rs':        { label: 'Approv. Resp.',      color: '#d97706', bg: '#fef3c7', icon: 'bi-person-check',        step: 1 },
  'verifica-gru':           { label: 'Verifica HR Admin',  color: '#1d4ed8', bg: '#dbeafe', icon: 'bi-clipboard-check',     step: 2 },
  'approvazione-dir':       { label: 'Approv. Dir. Esec.', color: '#7c3aed', bg: '#ede9fe', icon: 'bi-person-badge',        step: 3 },
  'approvazione-organo':    { label: 'Approv. Organo',     color: '#a21caf', bg: '#fae8ff', icon: 'bi-bank',                step: 4 },
  'redazione':              { label: 'Redazione',          color: '#0891b2', bg: '#cffafe', icon: 'bi-pencil-square',       step: 5 },
  'anteprima':              { label: 'Anteprima Risorsa',  color: '#059669', bg: '#d1fae5', icon: 'bi-eye',                 step: 6 },
  'firma-presidente':       { label: 'Firma Presidente',   color: '#b45309', bg: '#fef9c3', icon: 'bi-pen',                 step: 7 },
  'protocollo':             { label: 'Protocollo',         color: '#9333ea', bg: '#f3e8ff', icon: 'bi-file-earmark-medical',step: 8 },
  'applicativi':            { label: 'Applicativi',        color: '#4338ca', bg: '#e0e7ff', icon: 'bi-upload',              step: 9 },
  'anagrafica':             { label: 'Anagrafica',         color: '#0f766e', bg: '#ccfbf1', icon: 'bi-person-vcard',        step: 10 },
  'monitoraggio':           { label: 'Monitoraggio',       color: '#0284c7', bg: '#e0f2fe', icon: 'bi-radar',               step: 11 },
  'completato':             { label: 'Completato',         color: '#16a34a', bg: '#dcfce7', icon: 'bi-check-circle-fill',   step: 12 },
  // legacy aliases — mappati al loro corrispondente nuovo step
  'elaborazione-gru':       { label: 'Elaborazione GRU',   color: '#0891b2', bg: '#cffafe', icon: 'bi-gear',                step: 5 },
  'lettera-presentazione':  { label: 'Lettera Present.',   color: '#059669', bg: '#d1fae5', icon: 'bi-envelope-paper',      step: 6 },
  'contratto-preparazione': { label: 'Prep. Contratto',    color: '#dc2626', bg: '#fee2e2', icon: 'bi-file-earmark-text',   step: 5 },
  'contratto-firma':        { label: 'Contratto in Firma', color: '#b45309', bg: '#fef9c3', icon: 'bi-pen',                 step: 7 },
  'zucchetti':              { label: 'Caric. Zucchetti',   color: '#4338ca', bg: '#e0e7ff', icon: 'bi-upload',              step: 9 },
  'annullato':              { label: 'Annullato',          color: '#dc2626', bg: '#fee2e2', icon: 'bi-x-circle-fill',       step: -1 },
  'respinto':               { label: 'Respinto',           color: '#dc2626', bg: '#fee2e2', icon: 'bi-x-octagon-fill',      step: -1 },
};

/** Label leggibile per i ruoli — usata da Header switcher e Approvazioni tab. */
export const ROLE_LABELS: Record<string, string> = {
  rs:          'Responsabile Struttura',
  gru:         'HR Admin (GRU)',
  direttore:   'Direttore Esecutivo',
  amm:         'Amministrazione',
  presidente:  'Presidente',
  governance:  'Governance (CE/CdA)',
  segreteria:  'Segreteria',
};

export const OPERATION_LABELS: Record<string, string> = {
  'nuova-assunzione': 'Nuova Assunzione',
  'proroga':          'Proroga',
  'trasformazione':   'Trasformazione Contrattuale',
  'integrazione':     'Integrazione',
};

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  'cococo':           'CO.CO.CO.',
  'borsa-studio':     'Borsa di Studio',
  'tirocinio':        'Tirocinio',
  'consulenza-it':    'Consulenza Italiana',
  'consulenza-es':    'Consulenza Estera',
  'subordinato-td':   'Subordinato TD',
  'subordinato-ti':   'Subordinato TI',
  'distacco':         'Distacco',
};
