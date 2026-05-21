// Source-of-truth della relazione fra `ContractType` (wizard) e il codice
// granulare usato nei moduli (`MOD09_CONTRACT_TYPES` codici, MOD10 codici).
//
// Senza questa mappa il codice di Step3 (wizard) e Step4Mod09 (modulo)
// derivano in modo indipendente, producendo incoerenze tipo
// `contractType='borsa-studio'` ma `mod09.contractTypeMod09='COCOCO'`
// (vista nel mock PROC-2024-004).

import type { ContractType } from '../types';

export type Mod09Code = 'COCOCO' | 'OCCASIONALE' | 'CONSULENZA' | 'CONS_EST';
export type Mod10Code = 'IMP_TI' | 'IMP_TD' | 'QUA_TI' | 'QUA_TD' | 'DIR';
export type ModType   = 'mod09' | 'mod10';

interface ContractTypeMeta {
  modType: ModType;
  /** Valorizzato solo se modType==='mod09'. È il codice da scrivere in
   *  Mod09Data.contractTypeMod09 e da usare per il calcolo aliquote. */
  mod09Code?: Mod09Code;
  /** Codici MOD10 ammessi per questo ContractType (usato per filtrare il
   *  dropdown in Step4Mod10). */
  mod10Hint?: Mod10Code[];
  /** Tipi "esterni" (non recruiting, non dipendenti): occasionali,
   *  consulenze, borse di studio e tirocini. Selezionabili dal filone
   *  external-mod09. */
  isExternal: boolean;
}

export const CONTRACT_TYPE_MAP: Record<ContractType, ContractTypeMeta> = {
  'cococo':         { modType: 'mod09', mod09Code: 'COCOCO',      isExternal: false },
  'occasionale':    { modType: 'mod09', mod09Code: 'OCCASIONALE', isExternal: true  },
  'consulenza-it':  { modType: 'mod09', mod09Code: 'CONSULENZA',  isExternal: true  },
  'consulenza-es':  { modType: 'mod09', mod09Code: 'CONS_EST',    isExternal: true  },
  'borsa-studio':   { modType: 'mod09', mod09Code: 'COCOCO',      isExternal: true  },
  'tirocinio':      { modType: 'mod09', mod09Code: 'COCOCO',      isExternal: true  },
  'subordinato-td': { modType: 'mod10', mod10Hint: ['IMP_TD','QUA_TD'],         isExternal: false },
  'subordinato-ti': { modType: 'mod10', mod10Hint: ['IMP_TI','QUA_TI','DIR'],   isExternal: false },
  'distacco':       { modType: 'mod10', mod10Hint: ['IMP_TD','IMP_TI'],         isExternal: false },
};

export const modTypeOf      = (t: ContractType): ModType  => CONTRACT_TYPE_MAP[t].modType;
export const mod09CodeOf    = (t: ContractType): Mod09Code | undefined => CONTRACT_TYPE_MAP[t].mod09Code;
export const isExternalType = (t: ContractType): boolean  => CONTRACT_TYPE_MAP[t].isExternal;
