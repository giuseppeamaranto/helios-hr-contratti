import type { ContractCategory, ContractType } from '../../../types';
import type { WizardState } from '../ContractWizard';

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

  return (
    <div>
      {/* Selezione Categoria */}
      <div className="mb-4">
        <label className="form-label">
          Categoria Contrattuale <span className="required">*</span>
        </label>
        <div className="row g-3">
          <div className="col-md-6">
            <div
              className={`contract-type-card${state.contractCategory === 'non-subordinato' ? ' active' : ''}`}
              onClick={() => handleCategoryChange('non-subordinato')}
              style={{ padding: '20px 16px' }}
            >
              <div className="ct-icon">📄</div>
              <div className="ct-label" style={{ fontSize: 14 }}>Non Subordinato</div>
              <div className="ct-desc">
                CO.CO.CO., Borse di Studio, Tirocini, Consulenze
              </div>
              <div className="mt-2">
                <span className="tag tag-blue">MOD09</span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className={`contract-type-card${state.contractCategory === 'subordinato' ? ' active' : ''}`}
              onClick={() => handleCategoryChange('subordinato')}
              style={{ padding: '20px 16px' }}
            >
              <div className="ct-icon">👔</div>
              <div className="ct-label" style={{ fontSize: 14 }}>Subordinato</div>
              <div className="ct-desc">
                Tempo Determinato, Tempo Indeterminato, Distacco
              </div>
              <div className="mt-2">
                <span className="tag tag-purple">MOD10</span>
              </div>
            </div>
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
            ).map(t => (
              <div
                key={t.value}
                className={`contract-type-card${state.contractType === t.value ? ' active' : ''}`}
                onClick={() => handleTypeChange(t.value)}
              >
                <div className="ct-icon">{t.icon}</div>
                <div className="ct-label">{t.label}</div>
                <div className="ct-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
