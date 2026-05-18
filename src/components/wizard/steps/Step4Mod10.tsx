import { useState, useMemo } from 'react';
import {
  MOD10_CONTRACT_TYPES,
  MOD10_RINNOVO_TYPES,
  CCNL_LEVELS_TERZ,
  MOD10_INSURANCE,
  QUALIFICHE_RANGES,
  COST_CENTERS,
  SEDI,
  ORG_UNITS_LIST,
} from '../../../data/mockData';
import type { Mod10Data } from '../../../types';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

// INPS rates per contract type code
const INPS_RATES: Record<string, number> = {
  IMP_TI: 0.2898,
  IMP_TD: 0.3038,
  QUA_TI: 0.2898,
  QUA_TD: 0.3038,
  DIR: 0.2654,
};
// INAIL rates
const INAIL_RATES: Record<string, number> = {
  IMP_TI: 0.004,
  IMP_TD: 0.004,
  QUA_TI: 0.004,
  QUA_TD: 0.004,
  DIR: 0.007,
};
// Default welfare per contract type
const DEFAULT_WELFARE: Record<string, number> = {
  IMP_TI: 400,
  IMP_TD: 400,
  QUA_TI: 1000,
  QUA_TD: 1000,
  DIR: 16960,
};
// Default fondi per contract type
const DEFAULT_FONDI: Record<string, number> = {
  IMP_TI: 0,
  IMP_TD: 0,
  QUA_TI: 0,
  QUA_TD: 0,
  DIR: 0,
};

function calcMonths(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return null;
  const diff =
    (e.getFullYear() - s.getFullYear()) * 12 +
    (e.getMonth() - s.getMonth()) +
    (e.getDate() >= s.getDate() ? 0 : -1) + 1;
  return Math.max(0, diff);
}

export function Step4Mod10({ state, onChange }: Props) {
  const mod10 = state.mod10;
  const upd = (f: Partial<Mod10Data>) => onChange({ mod10: { ...state.mod10, ...f } });

  const [ccFilter, setCcFilter] = useState('');

  // Selected contract type metadata
  const selectedContractType = MOD10_CONTRACT_TYPES.find(
    c => c.code === mod10.contractTypeMod10
  );
  const isIndeterminate = selectedContractType?.isIndeterminate ?? false;
  const isQuadro = selectedContractType?.isQuadro ?? false;
  const isDir = selectedContractType?.isDir ?? false;

  const inpsRate = mod10.contractTypeMod10 ? (INPS_RATES[mod10.contractTypeMod10] ?? 0) : 0;
  const inailRate = mod10.contractTypeMod10 ? (INAIL_RATES[mod10.contractTypeMod10] ?? 0) : 0;

  // Months duration
  const months = useMemo(
    () => calcMonths(mod10.startDate ?? '', mod10.endDate ?? ''),
    [mod10.startDate, mod10.endDate]
  );

  // Salary calcs (14 mensilità)
  const grossSalaryFT = mod10.grossSalaryFT ?? 0;
  const partTimePercent = mod10.partTimePercent ?? 100;
  const isPartTime = partTimePercent > 0 && partTimePercent < 100;

  const monthlyFT = grossSalaryFT > 0 ? grossSalaryFT / 14 : null;
  const monthlyPartTime =
    monthlyFT !== null && isPartTime ? monthlyFT * (partTimePercent / 100) : null;

  // Cost breakdown
  const inpsAnnuo = grossSalaryFT > 0 ? grossSalaryFT * inpsRate : null;
  const inailAnnuo = grossSalaryFT > 0 ? grossSalaryFT * inailRate : null;
  const tfr = grossSalaryFT > 0 ? grossSalaryFT / 13.5 : null;
  const welfare = mod10.welfare ?? 0;
  const costoTotale =
    grossSalaryFT > 0 && inpsAnnuo !== null && inailAnnuo !== null && tfr !== null
      ? grossSalaryFT + inpsAnnuo + inailAnnuo + tfr + welfare
      : null;

  // CCNL levels filtered by contract type
  const availableLevels = useMemo(() => {
    if (isDir) return CCNL_LEVELS_TERZ.filter(l => l.code === 'D');
    if (isQuadro) return CCNL_LEVELS_TERZ.filter(l => l.code === 'QA' || l.code === 'QB');
    return CCNL_LEVELS_TERZ.filter(
      l => l.code !== 'QA' && l.code !== 'QB' && l.code !== 'D'
    );
  }, [isDir, isQuadro]);

  // Qualifica range info
  const selectedQualifica = QUALIFICHE_RANGES.find(q => q.code === mod10.qualifica);

  // Filtered cost centers
  const filteredCC = ccFilter
    ? COST_CENTERS.filter(
        c =>
          c.label.toLowerCase().includes(ccFilter.toLowerCase()) ||
          c.code.includes(ccFilter)
      )
    : COST_CENTERS;

  return (
    <div>
      {/* ── SEZIONE 0 — Tipo contratto ── */}
      <div className="form-section-title">
        <i className="bi bi-award" />
        1 — Tipologia Contratto
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Tipologia Contratto <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.contractTypeMod10 ?? ''}
            onChange={e => {
              const code = e.target.value;
              const ct = MOD10_CONTRACT_TYPES.find(c => c.code === code);
              upd({
                contractTypeMod10: code,
                endDate: ct?.isIndeterminate ? '' : mod10.endDate,
                welfare: DEFAULT_WELFARE[code] ?? 0,
                fondi: DEFAULT_FONDI[code] ?? 0,
                ccnlLevel: '',
              });
            }}
          >
            <option value="">— Seleziona —</option>
            {MOD10_CONTRACT_TYPES.map(c => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          {selectedContractType && (
            <div className="alert-cmcc info" style={{ fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                <i className="bi bi-info-circle me-1" />
                Aliquote contributive applicabili
              </div>
              <div>
                INPS azienda: <strong>{(inpsRate * 100).toFixed(2)}%</strong>
                {' '}| INAIL: <strong>{(inailRate * 100).toFixed(1)}%</strong>
              </div>
              {isDir && (
                <div style={{ marginTop: 4, color: '#92400e' }}>
                  <i className="bi bi-exclamation-triangle me-1" />
                  Dirigente: verificare i fondi dirigenziali (est. 16.960 €/anno).
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-12">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="isRinnovoToggle"
              checked={mod10.isRinnovo ?? false}
              onChange={e => upd({ isRinnovo: e.target.checked })}
              style={{ width: 40, height: 22, cursor: 'pointer' }}
            />
            <label
              className="form-check-label fw-600"
              htmlFor="isRinnovoToggle"
              style={{ fontSize: 13, marginLeft: 8 }}
            >
              Si tratta di rinnovo / proroga / trasformazione?
            </label>
          </div>
        </div>

        {mod10.isRinnovo && (
          <div className="col-md-6">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={mod10.rinnovoType ?? ''}
              onChange={e => upd({ rinnovoType: e.target.value })}
            >
              <option value="">— Seleziona —</option>
              {MOD10_RINNOVO_TYPES.map(r => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── SEZIONE 1 — Durata ── */}
      <div className="form-section-title">
        <i className="bi bi-calendar-range" />
        2 — Durata
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-5">
          <label className="form-label">
            Data inizio <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={mod10.startDate ?? ''}
            onChange={e => upd({ startDate: e.target.value })}
          />
        </div>

        {!isIndeterminate && (
          <div className="col-md-5">
            <label className="form-label">
              Data fine <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={mod10.endDate ?? ''}
              min={mod10.startDate ?? ''}
              onChange={e => upd({ endDate: e.target.value })}
            />
          </div>
        )}

        {isIndeterminate && (
          <div className="col-md-7 d-flex align-items-end">
            <div className="alert-cmcc info" style={{ fontSize: 12 }}>
              <i className="bi bi-infinity me-1" />
              Contratto a <strong>tempo indeterminato</strong> — nessuna data di fine.
            </div>
          </div>
        )}

        {months !== null && (
          <div className="col-md-2 d-flex align-items-end">
            <div
              className="alert-cmcc info"
              style={{ fontSize: 12, width: '100%', textAlign: 'center' }}
            >
              <i className="bi bi-clock me-1" />
              <strong>
                {months} {months === 1 ? 'mese' : 'mesi'}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* ── SEZIONE 2 — Mansione e Inquadramento ── */}
      <div className="form-section-title">
        <i className="bi bi-briefcase" />
        3 — Mansione e Inquadramento
      </div>
      <div className="row g-3 mb-4">
        <div className="col-12">
          <label className="form-label">
            Mansione <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Descrizione sintetica della posizione e delle responsabilità..."
            value={mod10.mansione ?? ''}
            onChange={e => upd({ mansione: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Qualifica <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.qualifica ?? ''}
            onChange={e => upd({ qualifica: e.target.value })}
          >
            <option value="">— Seleziona qualifica —</option>
            {QUALIFICHE_RANGES.map(q => (
              <option key={q.code} value={q.code}>
                {q.label}{' '}
                {q.minLordo !== null && q.maxLordo !== null
                  ? `— €${(q.minLordo / 1000).toFixed(0)}k–€${(q.maxLordo / 1000).toFixed(0)}k`
                  : q.minLordo !== null
                  ? `— ≥€${(q.minLordo / 1000).toFixed(0)}k`
                  : q.maxLordo !== null
                  ? `— ≥€${(q.maxLordo / 1000).toFixed(0)}k`
                  : ''}
              </option>
            ))}
          </select>
          {mod10.qualifica && (() => {
            const q = QUALIFICHE_RANGES.find(r => r.code === mod10.qualifica);
            if (!q) return null;
            return (
              <div style={{
                marginTop: 6, padding: '8px 12px', borderRadius: 6,
                background: '#f0f7ff', border: '1px solid #bfdbfe', fontSize: 12,
              }}>
                <span style={{ color: '#1e40af', fontWeight: 600 }}>Range lordo annuo: </span>
                {q.minLordo !== null && q.maxLordo !== null
                  ? `€ ${q.minLordo.toLocaleString('it-IT')} – € ${q.maxLordo.toLocaleString('it-IT')} / anno`
                  : q.minLordo !== null
                  ? `min. € ${q.minLordo.toLocaleString('it-IT')} / anno`
                  : q.maxLordo !== null
                  ? `min. € ${q.maxLordo.toLocaleString('it-IT')} / anno`
                  : 'n.d.'}
                {q.rateOrariaMin !== null && (
                  <span style={{ marginLeft: 12, color: '#64748b' }}>
                    (€ {q.rateOrariaMin.toFixed(2)}
                    {q.rateOrariaMax !== null ? ` – € ${q.rateOrariaMax.toFixed(2)}` : '+'} / ora)
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Livello CCNL <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.ccnlLevel ?? ''}
            disabled={!mod10.contractTypeMod10}
            onChange={e => upd({ ccnlLevel: e.target.value })}
          >
            <option value="">— Seleziona livello —</option>
            {availableLevels.map(l => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          {mod10.ccnlLevel && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              Il livello determina i minimi contrattuali CCNL Terziario Confcommercio
            </div>
          )}
          {!mod10.contractTypeMod10 && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
              Seleziona prima la tipologia contratto
            </div>
          )}
        </div>
      </div>

      {/* ── SEZIONE 3 — Retribuzione ── */}
      <div className="form-section-title">
        <i className="bi bi-currency-euro" />
        4 — Retribuzione
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Lordo collaboratore Full Time (annuo €) <span className="required">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              min={0}
              step={1000}
              value={mod10.grossSalaryFT ?? ''}
              onChange={e => upd({ grossSalaryFT: parseFloat(e.target.value) || 0 })}
            />
            <span className="input-group-text">/anno</span>
          </div>
          {(mod10.grossSalaryFT ?? 0) > 0 && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              ≈ € {((mod10.grossSalaryFT ?? 0) / 14).toLocaleString('it-IT', { maximumFractionDigits: 0 })} / mese (14 mensilità)
            </div>
          )}
        </div>

        <div className="col-md-6 d-flex align-items-end">
          {monthlyFT !== null && (
            <div className="alert-cmcc info" style={{ fontSize: 12, width: '100%' }}>
              <i className="bi bi-calculator me-1" />
              <strong>Stipendio mensile lordo FT:</strong>{' '}
              €{monthlyFT.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}>(RAL ÷ 14)</span>
              {monthlyPartTime !== null && (
                <div style={{ marginTop: 4 }}>
                  <strong>Part-time {partTimePercent}%:</strong>{' '}
                  €{monthlyPartTime.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mese
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-12">
          <label className="form-label">% Part Time</label>
          <div className="d-flex align-items-center gap-3">
            <div className="input-group" style={{ maxWidth: 200 }}>
              <input
                type="number"
                className="form-control"
                min={10}
                max={100}
                step={5}
                value={mod10.partTimePercent ?? 100}
                onChange={e =>
                  upd({ partTimePercent: parseInt(e.target.value) || 100 })
                }
              />
              <span className="input-group-text">%</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              100% = Full Time | meno di 100% = Part Time
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Welfare (€/anno)</label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              className="form-control"
              min={0}
              step={100}
              value={mod10.welfare ?? DEFAULT_WELFARE[mod10.contractTypeMod10 ?? ''] ?? 0}
              onChange={e => upd({ welfare: parseFloat(e.target.value) || 0 })}
            />
          </div>
          {mod10.contractTypeMod10 && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
              Default per questa tipologia: €{DEFAULT_WELFARE[mod10.contractTypeMod10]?.toLocaleString('it-IT') ?? '0'}
            </div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label">Stima Fondi (€)</label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              className="form-control"
              min={0}
              step={100}
              value={mod10.fondi ?? 0}
              onChange={e => upd({ fondi: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Cost breakdown box */}
        {costoTotale !== null && (
          <div className="col-12">
            <div className="alert-cmcc info" style={{ fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                <i className="bi bi-calculator me-1" />
                Riepilogo costi azienda stimati (annui)
              </div>
              <div className="row g-2">
                <div className="col-md-4">
                  Lordo FT:{' '}
                  <strong>
                    €{grossSalaryFT.toLocaleString('it-IT', { maximumFractionDigits: 0 })}/anno
                    {' '}(€{monthlyFT!.toLocaleString('it-IT', { maximumFractionDigits: 0 })}/mese)
                  </strong>
                </div>
                <div className="col-md-4">
                  INPS azienda ({(inpsRate * 100).toFixed(2)}%):{' '}
                  <strong>
                    €{inpsAnnuo!.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div className="col-md-4">
                  INAIL azienda ({(inailRate * 100).toFixed(1)}%):{' '}
                  <strong>
                    €{inailAnnuo!.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div className="col-md-4">
                  TFR (÷13,5):{' '}
                  <strong>
                    €{tfr!.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div className="col-md-4">
                  Welfare:{' '}
                  <strong>
                    €{welfare.toLocaleString('it-IT', { maximumFractionDigits: 0 })}/anno
                  </strong>
                </div>
              </div>
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: '1px solid #bfdbfe',
                  fontWeight: 700,
                }}
              >
                Costo totale stimato azienda:{' '}
                <span style={{ fontSize: 15, color: '#1d4ed8' }}>
                  €{costoTotale.toLocaleString('it-IT', { maximumFractionDigits: 0 })}/anno
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SEZIONE 4 — Sede e Organizzazione ── */}
      <div className="form-section-title">
        <i className="bi bi-geo-alt" />
        5 — Sede e Organizzazione
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Sede <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod10.workLocation ?? ''}
            onChange={e => upd({ workLocation: e.target.value })}
          >
            <option value="">— Seleziona sede —</option>
            {SEDI.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Unità Organizzativa</label>
          <select
            className="form-select"
            value={mod10.orgUnit ?? ''}
            onChange={e => upd({ orgUnit: e.target.value })}
          >
            <option value="">— Seleziona —</option>
            {ORG_UNITS_LIST.map(u => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Centro di Costo</label>
          <input
            type="text"
            className="form-control"
            list="cost-centers-list-10"
            placeholder="Cerca per codice o nome..."
            value={mod10.costCenter ?? state.costCenter ?? ''}
            onChange={e => {
              upd({ costCenter: e.target.value });
              setCcFilter(e.target.value);
            }}
          />
          <datalist id="cost-centers-list-10">
            {filteredCC.map(c => (
              <option key={c.code} value={c.label} />
            ))}
          </datalist>
        </div>

        <div className="col-12">
          <label className="form-label">
            Descrizione attività <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Descrivi le principali attività che la risorsa svolgerà..."
            value={mod10.activityDescription ?? ''}
            onChange={e => upd({ activityDescription: e.target.value })}
          />
        </div>
      </div>

      {/* ── SEZIONE 5 — Dettagli aggiuntivi ── */}
      <div className="form-section-title">
        <i className="bi bi-shield-check" />
        6 — Dettagli Aggiuntivi
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Assicurazione Viaggio</label>
          <select
            className="form-select"
            value={mod10.insurance ?? ''}
            onChange={e => upd({ insurance: e.target.value })}
          >
            <option value="">— Seleziona —</option>
            {MOD10_INSURANCE.map(ins => (
              <option key={ins.code} value={ins.code}>
                {ins.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 d-flex align-items-end">
          <div style={{ width: '100%' }}>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="expatToggle"
                checked={mod10.isExpat ?? false}
                onChange={e => upd({ isExpat: e.target.checked })}
                style={{ width: 40, height: 22, cursor: 'pointer' }}
              />
              <label
                className="form-check-label fw-600"
                htmlFor="expatToggle"
                style={{ fontSize: 13, marginLeft: 8 }}
              >
                Lavoratore Expatriate?
              </label>
            </div>
            {mod10.isExpat && (
              <input
                type="text"
                className="form-control"
                placeholder="Paese di residenza / provenienza (es. REGNO UNITO)"
                value={mod10.expatCountry ?? ''}
                onChange={e => upd({ expatCountry: e.target.value })}
              />
            )}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Nome Direttore / Head <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Nome e cognome (per firma)"
            value={mod10.directorName ?? ''}
            onChange={e => upd({ directorName: e.target.value })}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Note</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Eventuali informazioni aggiuntive per GRU o AMM..."
            value={mod10.notes ?? ''}
            onChange={e => upd({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
