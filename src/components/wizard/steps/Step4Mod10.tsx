import { SEDI, PROFESSIONS, CCNL_LEVELS } from '../../../data/mockData';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const CCNL_OPTIONS = [
  { code: 'TERZ',  label: 'Terziario Confcommercio' },
  { code: 'DIRIG', label: 'Dirigenti Terziario' },
];

const QUAL_PROF_OPTIONS = [
  'TECNICO SCIENTIFICO',
  'GESTIONALE MANAGEMENT',
  'AMMINISTRATIVO',
  'COMUNICAZIONE',
  'LOGISTICO-OPERATIVO',
];

export function Step4Mod10({ state, onChange }: Props) {
  const mod10 = state.mod10;

  const update = (field: string, value: unknown) => {
    onChange({ mod10: { ...mod10, [field]: value } });
  };

  const selectedCcnlCode = CCNL_OPTIONS.find(c => c.label === mod10.ccnl)?.code ?? '';
  const levels = selectedCcnlCode ? (CCNL_LEVELS[selectedCcnlCode] ?? []) : [];

  // Calcolo stipendio mensile lordo
  const monthlyGross =
    mod10.ral && mod10.ral > 0
      ? (mod10.ral / 14).toFixed(2)
      : null;

  // Stipendio part-time
  const partTimeMonthly =
    monthlyGross && mod10.isPartTime && mod10.partTimePercent
      ? ((parseFloat(monthlyGross) * (mod10.partTimePercent / 100))).toFixed(2)
      : null;

  return (
    <div>
      {/* ── Sezione 1: Inquadramento Contrattuale ── */}
      <div className="form-section-title">
        <i className="bi bi-award" />
        1 — Inquadramento Contrattuale
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            CCNL <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.ccnl ?? ''}
            onChange={e => {
              update('ccnl', e.target.value);
              update('contractLevel', '');
            }}
          >
            <option value="">— Seleziona CCNL —</option>
            {CCNL_OPTIONS.map(c => (
              <option key={c.code} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Livello Contrattuale <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.contractLevel ?? ''}
            disabled={!selectedCcnlCode || levels.length === 0}
            onChange={e => update('contractLevel', e.target.value)}
          >
            <option value="">— Seleziona livello —</option>
            {levels.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {selectedCcnlCode === 'DIRIG' && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Per i Dirigenti il livello è unico
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Profilo Professionale <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.profession ?? ''}
            onChange={e => update('profession', e.target.value)}
          >
            <option value="">— Seleziona profilo —</option>
            {PROFESSIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Qualifica Professionale <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.qualProf ?? ''}
            onChange={e => update('qualProf', e.target.value)}
          >
            <option value="">— Seleziona qualifica —</option>
            {QUAL_PROF_OPTIONS.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Sezione 2: Dati Economici ── */}
      <div className="form-section-title">
        <i className="bi bi-currency-euro" />
        2 — Dati Economici
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-5">
          <label className="form-label">
            RAL Proposta (€/anno) <span className="required">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              min={0}
              step={1000}
              value={mod10.ral ?? ''}
              onChange={e => update('ral', parseFloat(e.target.value) || 0)}
            />
            <span className="input-group-text">/anno</span>
          </div>
        </div>

        <div className="col-md-7">
          {monthlyGross && (
            <div style={{ paddingTop: 28 }}>
              <div className="alert-cmcc info" style={{ padding: '8px 14px' }}>
                <i className="bi bi-calculator me-2" />
                <strong>Stipendio mensile lordo:</strong>{' '}
                € {parseFloat(monthlyGross).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                <span style={{ fontSize: 11, marginLeft: 8, opacity: 0.7 }}>
                  (RAL ÷ 14 mensilità)
                </span>
                {partTimeMonthly && (
                  <>
                    {' → '}
                    <strong>Part-time {mod10.partTimePercent}%:</strong>{' '}
                    € {parseFloat(partTimeMonthly).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="col-12">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="partTimeToggle"
              checked={mod10.isPartTime ?? false}
              onChange={e => update('isPartTime', e.target.checked)}
              style={{ width: 40, height: 22, cursor: 'pointer' }}
            />
            <label className="form-check-label fw-600" htmlFor="partTimeToggle" style={{ fontSize: 13, marginLeft: 8 }}>
              Part-Time
            </label>
          </div>
        </div>

        {mod10.isPartTime && (
          <div className="col-md-4">
            <label className="form-label">
              Percentuale Part-Time (%) <span className="required">*</span>
            </label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                min={10}
                max={90}
                step={5}
                value={mod10.partTimePercent ?? 50}
                onChange={e => update('partTimePercent', parseInt(e.target.value) || 50)}
              />
              <span className="input-group-text">%</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Min 10% — Max 90%</div>
          </div>
        )}
      </div>

      {/* ── Sezione 3: Durata ── */}
      <div className="form-section-title">
        <i className="bi bi-calendar-range" />
        3 — Durata
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-5">
          <label className="form-label">
            Data Inizio <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={mod10.startDate ?? ''}
            onChange={e => update('startDate', e.target.value)}
          />
        </div>

        <div className="col-md-7 d-flex align-items-end">
          <div className="form-check form-switch mb-1">
            <input
              className="form-check-input"
              type="checkbox"
              id="tiToggle"
              checked={mod10.isTimeIndeterminate ?? false}
              onChange={e => {
                update('isTimeIndeterminate', e.target.checked);
                if (e.target.checked) update('endDate', '');
              }}
              style={{ width: 40, height: 22, cursor: 'pointer' }}
            />
            <label className="form-check-label fw-600" htmlFor="tiToggle" style={{ fontSize: 13, marginLeft: 8 }}>
              Tempo Indeterminato
            </label>
          </div>
        </div>

        {!mod10.isTimeIndeterminate && (
          <div className="col-md-5">
            <label className="form-label">
              Data Fine <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={mod10.endDate ?? ''}
              min={mod10.startDate ?? ''}
              onChange={e => update('endDate', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ── Sezione 4: Attività e Location ── */}
      <div className="form-section-title">
        <i className="bi bi-briefcase" />
        4 — Attività e Location
      </div>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">
            Descrizione Attività <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Descrivi le principali attività che la risorsa svolgerà..."
            value={mod10.activityDescription ?? ''}
            onChange={e => update('activityDescription', e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Luogo di Lavoro</label>
          <select
            className="form-select"
            value={mod10.workLocation ?? ''}
            onChange={e => update('workLocation', e.target.value)}
          >
            <option value="">— Seleziona sede —</option>
            {SEDI.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 d-flex align-items-end">
          <div style={{ width: '100%' }}>
            <div className="form-check form-switch mb-1">
              <input
                className="form-check-input"
                type="checkbox"
                id="expatToggle"
                checked={mod10.isExpat ?? false}
                onChange={e => update('isExpat', e.target.checked)}
                style={{ width: 40, height: 22, cursor: 'pointer' }}
              />
              <label className="form-check-label fw-600" htmlFor="expatToggle" style={{ fontSize: 13, marginLeft: 8 }}>
                Lavoratore Expatriate
              </label>
            </div>
          </div>
        </div>

        {mod10.isExpat && (
          <div className="col-md-6">
            <label className="form-label">
              Paese di Residenza <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="es. REGNO UNITO"
              value={mod10.expatCountry ?? ''}
              onChange={e => update('expatCountry', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
