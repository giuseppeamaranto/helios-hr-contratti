import { useEffect } from 'react';
import type { ContractCategory, ContractType } from '../../../types';
import type { WizardState } from '../ContractWizard';
import { allowedTargetTypes, decideContractAction, detectResourceCategory, explainRule } from '../../../data/resourceRules';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const NON_SUBORDINATO_TYPES: { value: ContractType; icon: string; label: string; desc: string }[] = [
  { value: 'cococo',       icon: '🤝', label: 'CO.CO.CO.',           desc: 'Collaborazione Coordinata e Continuativa' },
  { value: 'borsa-studio', icon: '🎓', label: 'Borsa di Studio',     desc: 'Per laureati e dottorandi, attività di ricerca' },
  { value: 'tirocinio',    icon: '📚', label: 'Tirocinio',           desc: 'Formazione on-the-job, max 6 mesi' },
  { value: 'consulenza-it',icon: '💼', label: 'Consulenza Italiana', desc: 'Professionista con P.IVA italiana' },
  { value: 'consulenza-es',icon: '🌍', label: 'Consulenza Estera',   desc: 'Professionista con P.IVA estera' },
];

const SUBORDINATO_TYPES: { value: ContractType; icon: string; label: string; desc: string }[] = [
  { value: 'subordinato-td', icon: '📋', label: 'Subordinato TD',  desc: 'Tempo Determinato — con data di scadenza' },
  { value: 'subordinato-ti', icon: '♾️',  label: 'Subordinato TI',  desc: 'Tempo Indeterminato — contratto stabile' },
  { value: 'distacco',       icon: '🔗', label: 'Distacco',         desc: 'Distacco presso ente terzo o da ente terzo' },
];

const TYPE_INFO: Record<string, { mod: string; note: string }> = {
  'cococo':        { mod: 'MOD09', note: 'Richiede modulo MOD09, MOD13 e MOD102 post-attivazione. Contribuzione gestione separata INPS.' },
  'borsa-studio':  { mod: 'MOD09', note: 'Richiede modulo MOD09 e MOD13. Esenzione contributi previdenziali.' },
  'tirocinio':     { mod: 'MOD09', note: 'Richiede modulo MOD09. Obbligatoria convenzione con ente formativo.' },
  'consulenza-it': { mod: 'MOD09', note: 'Richiede modulo MOD09. Il professionista deve avere P.IVA attiva.' },
  'consulenza-es': { mod: 'MOD09', note: 'Richiede modulo MOD09. Normativa fiscale internazionale applicabile.' },
  'subordinato-td':{ mod: 'MOD10', note: 'Richiede modulo MOD10 e MOD14. Applicazione CCNL Terziario Confcommercio.' },
  'subordinato-ti':{ mod: 'MOD10', note: 'Richiede modulo MOD10 e MOD14. Contratto a tempo indeterminato.' },
  'distacco':      { mod: 'MOD10', note: 'Richiede modulo MOD10. Disciplina specifica distacco ex art. 30 D.Lgs. 276/2003.' },
};

export function Step3Contratto({ state, onChange }: Props) {
  // Per operazioni di trasformazione su una risorsa esistente, restringiamo i
  // tipi destinazione in base al contratto corrente (regole CMCC).
  const isTransformation = state.operationType === 'trasformazione' && !!state.resource;
  const isProroga        = state.operationType === 'proroga' && !!state.resource;
  const resourceCategory = detectResourceCategory(state.resource);
  const allowedTargets   = isTransformation ? allowedTargetTypes(resourceCategory) : null;

  // Per la proroga il tipo contratto deve coincidere con quello attuale —
  // non si "trasforma", si estende solo la durata. Calcoliamo il tipo di base.
  const currentTypeForProroga: ContractType | '' =
    resourceCategory === 'cococo' ? 'cococo' :
    resourceCategory === 'subordinato-td' ? 'subordinato-td' :
    resourceCategory === 'subordinato-ti' ? 'subordinato-ti' : '';

  const handleCategoryChange = (cat: ContractCategory) => {
    onChange({
      contractCategory: cat,
      contractType: '',
      modType: cat === 'non-subordinato' ? 'mod09' : 'mod10',
    });
  };

  const handleTypeChange = (type: ContractType) => {
    const modType = ['cococo','borsa-studio','tirocinio','consulenza-it','consulenza-es'].includes(type)
      ? 'mod09'
      : 'mod10';
    onChange({ contractType: type, modType });
  };

  // È ammessa questa categoria? Per trasformazione filtriamo:
  // - Da CoCoCo → solo "Subordinato" (gli altri non-subordinati non sono upgrade)
  // - Da Sub-TD → solo "Subordinato" (upgrade a TI)
  // - Da Sub-TI → nessuna categoria (nessun upgrade ammesso)
  const isCategoryAllowed = (cat: ContractCategory): boolean => {
    if (!isTransformation || !allowedTargets) return true;
    if (allowedTargets.length === 0) return false;
    const subordinati: ContractType[] = ['subordinato-td','subordinato-ti','distacco'];
    const nonSub: ContractType[]      = ['cococo','borsa-studio','tirocinio','consulenza-it','consulenza-es'];
    return cat === 'subordinato'
      ? allowedTargets.some(t => subordinati.includes(t))
      : allowedTargets.some(t => nonSub.includes(t));
  };

  // È ammesso questo tipo specifico?
  const isTypeAllowed = (type: ContractType): boolean => {
    if (!isTransformation || !allowedTargets) return true;
    return allowedTargets.includes(type);
  };

  // Per la proroga il tipo è fissato a quello attuale: lo auto-impostiamo
  // all'apertura del passo (effect post-render, niente side-effect in render).
  useEffect(() => {
    if (!isProroga || !currentTypeForProroga) return;
    if (state.contractType === currentTypeForProroga) return;
    const cat: ContractCategory = ['cococo','borsa-studio','tirocinio','consulenza-it','consulenza-es']
      .includes(currentTypeForProroga) ? 'non-subordinato' : 'subordinato';
    onChange({
      contractCategory: cat,
      contractType: currentTypeForProroga,
      modType: cat === 'non-subordinato' ? 'mod09' : 'mod10',
    });
  }, [isProroga, currentTypeForProroga, state.contractType, onChange]);

  return (
    <div>
      {/* Avviso regola contratto attuale (operazione su risorsa esistente) */}
      {(isTransformation || isProroga) && (
        <div className="alert-cmcc info mb-3" style={{ fontSize: 12 }}>
          <i className="bi bi-shield-check me-2" />
          <strong>Regola contratto:</strong> {explainRule(resourceCategory)}
        </div>
      )}

      {/* Proroga: tipo già fissato, niente selezione */}
      {isProroga ? (
        <div className="alert-cmcc success mb-4">
          <i className="bi bi-arrow-repeat me-2" />
          <strong>Proroga del contratto attuale.</strong> Il tipo contratto rimane invariato:{' '}
          <span className="tag tag-blue">{currentTypeForProroga.toUpperCase()}</span>
          {' '}— allo step successivo modificherai solo la data di fine.
        </div>
      ) : (
      <>
      {/* Selezione Categoria */}
      <div className="mb-4">
        <label className="form-label">
          Categoria Contrattuale <span className="required">*</span>
        </label>
        <div className="row g-3">
          <div className="col-md-6">
            {(() => {
              const disabled = !isCategoryAllowed('non-subordinato');
              return (
                <div
                  className={`contract-type-card${state.contractCategory === 'non-subordinato' ? ' active' : ''}`}
                  onClick={() => !disabled && handleCategoryChange('non-subordinato')}
                  style={{ padding: '20px 16px', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  title={disabled ? 'Non ammesso dalle regole di transizione' : undefined}
                >
                  <div className="ct-icon">📄</div>
                  <div className="ct-label" style={{ fontSize: 14 }}>Non Subordinato</div>
                  <div className="ct-desc">CO.CO.CO., Borse di Studio, Tirocini, Consulenze</div>
                  <div className="mt-2">
                    <span className="tag tag-blue">MOD09</span>
                    {disabled && <span className="tag tag-gray ms-1" style={{ fontSize: 10 }}>non ammesso</span>}
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="col-md-6">
            {(() => {
              const disabled = !isCategoryAllowed('subordinato');
              return (
                <div
                  className={`contract-type-card${state.contractCategory === 'subordinato' ? ' active' : ''}`}
                  onClick={() => !disabled && handleCategoryChange('subordinato')}
                  style={{ padding: '20px 16px', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  title={disabled ? 'Non ammesso dalle regole di transizione' : undefined}
                >
                  <div className="ct-icon">👔</div>
                  <div className="ct-label" style={{ fontSize: 14 }}>Subordinato</div>
                  <div className="ct-desc">Tempo Determinato, Tempo Indeterminato, Distacco</div>
                  <div className="mt-2">
                    <span className="tag tag-purple">MOD10</span>
                    {disabled && <span className="tag tag-gray ms-1" style={{ fontSize: 10 }}>non ammesso</span>}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Selezione Tipo Specifico */}
      {state.contractCategory && (
        <div className="mb-4">
          <label className="form-label">
            Tipo Contratto <span className="required">*</span>
          </label>
          <div className="contract-type-grid">
            {(state.contractCategory === 'non-subordinato'
              ? NON_SUBORDINATO_TYPES
              : SUBORDINATO_TYPES
            ).map(t => {
              const disabled = !isTypeAllowed(t.value);
              return (
                <div
                  key={t.value}
                  className={`contract-type-card${state.contractType === t.value ? ' active' : ''}`}
                  onClick={() => !disabled && handleTypeChange(t.value)}
                  style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  title={disabled ? 'Tipo non ammesso dalle regole di transizione' : undefined}
                >
                  <div className="ct-icon">{t.icon}</div>
                  <div className="ct-label">{t.label}</div>
                  <div className="ct-desc">{t.desc}</div>
                  {disabled && <div className="mt-1"><span className="tag tag-gray" style={{ fontSize: 10 }}>non ammesso</span></div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}

      {/* Anteprima decisione contract-action (solo se risorsa esistente + tipo scelto) */}
      {state.resource && state.contractType && (() => {
        const newStartDate = state.modType === 'mod10' ? state.mod10.startDate : state.mod09.startDate;
        const isRenewal = state.modType === 'mod10' ? !!state.mod10.isRinnovo : !!state.mod09.isProroga;
        const decision = decideContractAction({
          resource: state.resource,
          newContractType: state.contractType,
          newStartDate,
          isRenewal: isRenewal || state.operationType === 'proroga' && false, // proroga ≠ rinnovo automatico
        });
        if (!decision) return null;
        const isNew = decision.action === 'new-contract';
        return (
          <div className={`alert-cmcc ${isNew ? 'warning' : 'success'} mb-3`} style={{ fontSize: 12 }}>
            <i className={`bi ${isNew ? 'bi-file-earmark-plus' : 'bi-pencil-square'} me-2`} />
            <strong>{isNew ? 'Verrà creato un NUOVO contratto' : 'MODIFICA del contratto esistente'}</strong>
            <span className="ms-2">— {decision.reason}</span>
            {decision.interruptionDays > 0 && (
              <span className="tag tag-amber ms-2" style={{ fontSize: 10 }}>
                {decision.interruptionDays} {decision.interruptionDays === 1 ? 'giorno' : 'giorni'} di interruzione
              </span>
            )}
          </div>
        );
      })()}

      {/* Info contestuale sul tipo selezionato */}
      {state.contractType && TYPE_INFO[state.contractType] && (
        <div className="alert-cmcc info">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <i className="bi bi-info-circle-fill" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Modulo richiesto:{' '}
                <span
                  className={TYPE_INFO[state.contractType].mod === 'MOD10' ? 'tag tag-purple' : 'tag tag-blue'}
                  style={{ verticalAlign: 'middle' }}
                >
                  {TYPE_INFO[state.contractType].mod}
                </span>
              </div>
              <div>{TYPE_INFO[state.contractType].note}</div>
            </div>
          </div>
        </div>
      )}

      {/* Riepilogo selezione */}
      {state.contractCategory && state.contractType && (
        <div className="mt-3 d-flex gap-2 align-items-center">
          <span style={{ fontSize: 12, color: '#64748b' }}>Selezione:</span>
          <span className="tag tag-gray">
            {state.contractCategory === 'non-subordinato' ? 'Non Subordinato' : 'Subordinato'}
          </span>
          <i className="bi bi-chevron-right" style={{ fontSize: 10, color: '#94a3b8' }} />
          <span className="tag tag-blue">
            {[...NON_SUBORDINATO_TYPES, ...SUBORDINATO_TYPES].find(t => t.value === state.contractType)?.label}
          </span>
          <i className="bi bi-chevron-right" style={{ fontSize: 10, color: '#94a3b8' }} />
          <span className={state.modType === 'mod10' ? 'tag tag-purple' : 'tag tag-blue'}>
            {state.modType?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
