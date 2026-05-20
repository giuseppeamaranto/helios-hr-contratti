// Regole di transizione contrattuale CMCC.
// Sono qui per essere usate sia dal wizard (Step1Avvio + Step3Contratto)
// sia da eventuali altre viste future.
//
// Convenzioni dei contratti in DossierRisorse:
//   resource.contractNature  = "Lavoro dipendente" | "Collaborazione coord.continuativa" | ...
//   resource.contractType    = "Tempo determinato" | "Tempo indeterminato" | ...
//   resource.ccnl            = "Terziario Confcommercio" | "Contratto CO.CO.CO" | ...

import type { ContractType, OperationType, Resource } from '../types';

/** Categoria contrattuale corrente della risorsa, derivata dai campi anagrafici. */
export type ResourceContractCategory =
  | 'cococo'          // CO.CO.CO / Collaborazione
  | 'subordinato-td'  // Tempo Determinato (dipendente)
  | 'subordinato-ti'  // Tempo Indeterminato (dipendente)
  | 'altro';          // Tirocinio, borsa, distacco, sconosciuto

export function detectResourceCategory(r: Resource | null | undefined): ResourceContractCategory {
  if (!r) return 'altro';
  const nat = (r.contractNature || '').toLowerCase();
  const typ = (r.contractType || '').toLowerCase();
  const ccnl = (r.ccnl || '').toLowerCase();

  const isCoCoCo =
    nat.includes('collaborazione') ||
    ccnl.includes('co.co.co') ||
    ccnl.includes('cococo');
  if (isCoCoCo) return 'cococo';

  const isDip = nat.includes('dipendente') || ccnl.includes('terziario') || ccnl.includes('dirig');
  if (isDip) {
    if (typ.includes('determinato')) return 'subordinato-td';
    if (typ.includes('indeterminato')) return 'subordinato-ti';
  }
  return 'altro';
}

/** Operazioni ammesse a partire dal contratto corrente.
 *  Regole CMCC:
 *  - CoCoCo  → proroga ✓ | trasformazione (verso subordinato) ✓ | integrazione ✓
 *  - Sub-TD  → proroga ✓ | trasformazione (verso TI) ✓ | integrazione ✓
 *  - Sub-TI  → proroga ✗ | trasformazione ✗ | integrazione ✓
 *  - altro   → tutte (default permissivo)
 */
export function allowedOperationsFor(category: ResourceContractCategory): OperationType[] {
  switch (category) {
    case 'cococo':
      return ['proroga', 'trasformazione', 'integrazione'];
    case 'subordinato-td':
      return ['proroga', 'trasformazione', 'integrazione'];
    case 'subordinato-ti':
      return ['integrazione']; // contratto stabile → nessuna proroga/trasformazione
    default:
      return ['proroga', 'trasformazione', 'integrazione'];
  }
}

/** Tipi contrattuali destinazione ammessi per una trasformazione,
 *  in funzione del contratto corrente.
 *  - Da CoCoCo → si può andare verso Subordinato TD o TI (ed eventualmente Distacco).
 *  - Da Sub-TD → si può andare solo a Sub-TI (mai tornare a CoCoCo).
 *  - Da Sub-TI → nessuna trasformazione (regola CMCC).
 *  - Da altro  → permissivo: ammette tutto.
 */
export function allowedTargetTypes(category: ResourceContractCategory): ContractType[] {
  switch (category) {
    case 'cococo':
      return ['subordinato-td', 'subordinato-ti', 'distacco'];
    case 'subordinato-td':
      return ['subordinato-ti'];
    case 'subordinato-ti':
      return []; // nessun upgrade possibile
    default:
      return [
        'cococo', 'borsa-studio', 'tirocinio', 'consulenza-it', 'consulenza-es',
        'subordinato-td', 'subordinato-ti', 'distacco',
      ];
  }
}

/** Decisione "nuovo contratto" vs "modifica contratto", secondo le regole CMCC.
 *
 *  Si crea un NUOVO contratto quando:
 *  - cambia la tipologia (es. CoCoCo → Subordinato)
 *  - è un rinnovo (operazione esplicita)
 *  - c'è almeno 1 giorno di interruzione fra contratto attuale e nuovo
 *
 *  Si MODIFICA il contratto esistente quando la tipologia è la stessa e
 *  non ci sono giorni di interruzione (variazioni di importo, RAL, livello,
 *  inquadramento sono comunque ammesse all'interno della modifica).
 */
export type ContractAction = 'new-contract' | 'modify-contract';

export interface ContractActionDecision {
  action: ContractAction;
  reason: string;
  interruptionDays: number; // numero di giorni di gap tra fine attuale e inizio nuovo
  sameCategory: boolean;
}

const CATEGORY_OF: Record<string, ResourceContractCategory> = {
  'cococo':           'cococo',
  'borsa-studio':     'altro',
  'tirocinio':        'altro',
  'consulenza-it':    'altro',
  'consulenza-es':    'altro',
  'subordinato-td':   'subordinato-td',
  'subordinato-ti':   'subordinato-ti',
  'distacco':         'altro',
};

export function decideContractAction(args: {
  resource: Resource | null | undefined;
  newContractType: string | undefined;
  newStartDate: string | undefined;
  isRenewal?: boolean;
}): ContractActionDecision | null {
  if (!args.resource || !args.newContractType) return null;

  const currentCat = detectResourceCategory(args.resource);
  const newCat = CATEGORY_OF[args.newContractType] ?? 'altro';
  const sameCategory = currentCat === newCat;

  // Calcolo giorni di interruzione fra fine attuale e inizio nuovo
  let interruptionDays = 0;
  if (args.resource.endDate && args.newStartDate) {
    const end = new Date(args.resource.endDate).getTime();
    const start = new Date(args.newStartDate).getTime();
    if (!Number.isNaN(end) && !Number.isNaN(start)) {
      const diff = Math.floor((start - end) / (1000 * 60 * 60 * 24));
      // Continuità: il nuovo parte il giorno successivo alla fine → 1 giorno è
      // considerato continuità, > 1 giorno è interruzione.
      interruptionDays = Math.max(0, diff - 1);
    }
  }

  if (args.isRenewal) {
    return {
      action: 'new-contract',
      reason: 'Rinnovo contrattuale: si genera un nuovo contratto.',
      interruptionDays, sameCategory,
    };
  }
  if (!sameCategory) {
    return {
      action: 'new-contract',
      reason: `Cambio tipologia (${currentCat} → ${newCat}): nuovo contratto.`,
      interruptionDays, sameCategory,
    };
  }
  if (interruptionDays > 0) {
    return {
      action: 'new-contract',
      reason: `Stessa tipologia ma ${interruptionDays} ${interruptionDays === 1 ? 'giorno' : 'giorni'} di interruzione: nuovo contratto.`,
      interruptionDays, sameCategory,
    };
  }
  return {
    action: 'modify-contract',
    reason: 'Stessa tipologia, continuità di rapporto: modifica del contratto esistente.',
    interruptionDays, sameCategory,
  };
}

/** Spiegazione human-readable della regola (per tooltip/alert). */
export function explainRule(category: ResourceContractCategory): string {
  switch (category) {
    case 'cococo':
      return 'CoCoCo: può essere prorogato o trasformato in contratto subordinato (TD/TI).';
    case 'subordinato-td':
      return 'Subordinato Tempo Determinato: può essere prorogato o trasformato in Tempo Indeterminato.';
    case 'subordinato-ti':
      return 'Subordinato Tempo Indeterminato: non può essere prorogato né trasformato — sono ammesse solo integrazioni.';
    default:
      return 'Tipo di contratto attuale non riconosciuto: nessuna restrizione applicata.';
  }
}
