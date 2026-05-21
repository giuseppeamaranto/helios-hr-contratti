import { useEffect } from 'react';
import type { ContractCategory, ContractType } from '../../../types';
import type { WizardState } from '../ContractWizard';
import { decideContractAction, detectResourceCategory, effectiveAllowedTypes, explainRule } from '../../../data/resourceRules';
import { mod09CodeOf } from '../../../data/contractTypeMapping';
import { RECRUITING_CANDIDATES } from '../../../data/mockData';

/** Mappa proposedContractType (candidato ATS) → ContractType (wizard). */
function mapProposedToContractType(proposed: string | undefined): ContractType | '' {
  if (!proposed) return '';
  const s = proposed.toLowerCase();
  if (s.includes('coordinata e continuativa') || s.includes('cococo') || s.includes('co.co.co')) return 'cococo';
  if (s.includes('indeterminato')) return 'subordinato-ti';
  if (s.includes('determinato'))   return 'subordinato-td';
  return '';
}

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const NON_SUBORDINATO_TYPES: { value: ContractType; icon: string; label: string; desc: string }[] = [
  { value: 'cococo',       icon: '🤝', label: 'CO.CO.CO.',           desc: 'Collaborazione Coordinata e Continuativa' },
  { value: 'occasionale',  icon: '⚡', label: 'Coll. Occasionale',   desc: 'Prestazione autonoma occasionale (no recruiting)' },
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
  'occasionale':   { mod: 'MOD09', note: 'Prestazione autonoma occasionale: richiede MOD09. Niente MOD138/MOD102 (soggetto esterno).' },
  'borsa-studio':  { mod: 'MOD09', note: 'Richiede modulo MOD09 e MOD13. Esenzione contributi previdenziali.' },
  'tirocinio':     { mod: 'MOD09', note: 'Richiede modulo MOD09. Obbligatoria convenzione con ente formativo.' },
  'consulenza-it': { mod: 'MOD09', note: 'Richiede modulo MOD09. Il professionista deve avere P.IVA attiva.' },
  'consulenza-es': { mod: 'MOD09', note: 'Richiede modulo MOD09. Normativa fiscale internazionale applicabile.' },
  'subordinato-td':{ mod: 'MOD10', note: 'Richiede modulo MOD10 e MOD14. Applicazione CCNL Terziario Confcommercio.' },
  'subordinato-ti':{ mod: 'MOD10', note: 'Richiede modulo MOD10 e MOD14. Contratto a tempo indeterminato.' },
  'distacco':      { mod: 'MOD10', note: 'Richiede modulo MOD10. Disciplina specifica distacco ex art. 30 D.Lgs. 276/2003.' },
};

export function Step3Contratto({ state, onChange }: Props) {
  const isTransformation = state.operationType === 'trasformazione' && !!state.resource;
  const isProroga        = state.operationType === 'proroga' && !!state.resource;
  const resourceCategory = detectResourceCategory(state.resource);

  // Tipi ammessi = intersezione filone (entryMode) + (se trasformazione) regole CMCC.
  // Per i casi non-existing, effectiveAllowedTypes ritorna i tipi consentiti dal filone.
  const allowedTypes = effectiveAllowedTypes(
    state.entryMode,
    state.operationType,
    resourceCategory,
  );

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
    const mod09Code = mod09CodeOf(type);
    const modType = mod09Code ? 'mod09' : 'mod10';
    // Pre-popoliamo anche il codice MOD09 nel Mod09Data per evitare drift
    // (es. wizard='occasionale' ma form MOD09='COCOCO').
    onChange({
      contractType: type,
      modType,
      ...(mod09Code ? { mod09: { ...state.mod09, contractTypeMod09: mod09Code } } : {}),
    });
  };

  const isTypeAllowed = (type: ContractType): boolean => allowedTypes.includes(type);
  const isCategoryAllowed = (cat: ContractCategory): boolean => {
    const types = cat === 'subordinato'
      ? (['subordinato-td','subordinato-ti','distacco'] as ContractType[])
      : (['cococo','occasionale','borsa-studio','tirocinio','consulenza-it','consulenza-es'] as ContractType[]);
    return types.some(t => allowedTypes.includes(t));
  };

  // Per la proroga il tipo è fissato a quello attuale: lo auto-impostiamo
  // all'apertura del passo (effect post-render, niente side-effect in render).
  useEffect(() => {
    if (!isProroga || !currentTypeForProroga) return;
    if (state.contractType === currentTypeForProroga) return;
    const cat: ContractCategory = ['cococo','occasionale','borsa-studio','tirocinio','consulenza-it','consulenza-es']
      .includes(currentTypeForProroga) ? 'non-subordinato' : 'subordinato';
    onChange({
      contractCategory: cat,
      contractType: currentTypeForProroga,
      modType: cat === 'non-subordinato' ? 'mod09' : 'mod10',
    });
  }, [isProroga, currentTypeForProroga, state.contractType, onChange]);

  // Pre-selezione automatica per recruiting: dal proposedContractType del
  // candidato, già noto via recruitingCandidateId. L'utente può cambiare.
  useEffect(() => {
    if (state.entryMode !== 'recruiting' || state.contractType) return;
    if (!state.recruitingCandidateId) return;
    const candidate = RECRUITING_CANDIDATES.find(c => c.id === state.recruitingCandidateId);
    const mapped = mapProposedToContractType(candidate?.proposedContractType);
    if (!mapped) return;
    const cat: ContractCategory = mapped === 'cococo' ? 'non-subordinato' : 'subordinato';
    handleTypeChange(mapped);
    onChange({ contractCategory: cat });
    // handleTypeChange already calls onChange, ma ci serve anche la categoria
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.entryMode, state.contractType, state.recruitingCandidateId]);

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
