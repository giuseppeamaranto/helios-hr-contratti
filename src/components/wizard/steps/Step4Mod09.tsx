import { useState, useMemo } from 'react';
import {
  MOD09_CONTRACT_TYPES,
  MOD09_SELECTION_MODES,
  MOD09_LANGUAGES,
  MOD09_PAYMENT_TERMS,
  MOD09_ENGAGEMENT,
  MOD09_ALIQUOTE,
  QUALIFICHE_RANGES,
  COST_CENTERS,
  SEDI,
  ORG_UNITS_LIST,
} from '../../../data/mockData';
import type { Mod09Data } from '../../../types';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

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

export function Step4Mod09({ state, onChange }: Props) {
  const mod09 = state.mod09;
  const upd = (f: Partial<Mod09Data>) => onChange({ mod09: { ...state.mod09, ...f } });

  const [ccFilter, setCcFilter] = useState('');

  // Derived values
  const selectedContractType = MOD09_CONTRACT_TYPES.find(
    c => c.code === mod09.contractTypeMod09
  );
  const isConsulenza =
    mod09.contractTypeMod09 === 'CONSULENZA' ||
    mod09.contractTypeMod09 === 'CONS_EST';

  const selectedSelectionMode = MOD09_SELECTION_MODES.find(
    m => m.code === mod09.selectionMode
  );

  const selectedQualifica = QUALIFICHE_RANGES.find(q => q.code === mod09.qualifica);

  const months = useMemo(
    () => calcMonths(mod09.startDate ?? '', mod09.endDate ?? ''),
    [mod09.startDate, mod09.endDate]
  );

  const grossCompensation = mod09.grossCompensation ?? 0;
  const totalGross = months !== null && grossCompensation > 0 ? months * grossCompensation : null;
  const rateOraria = grossCompensation > 0 ? grossCompensation / 160 : null;

  const aliquota = mod09.aliquota ?? 'piena';
  const inpsRate = aliquota === 'piena' ? MOD09_ALIQUOTE.inps.piena : MOD09_ALIQUOTE.inps.agevolata;
  const inailRate = MOD09_ALIQUOTE.inail.piena; // same for both

  // Azienda paga 2/3 dei contributi
  const inpsAzienda = inpsRate * (2 / 3);
  const inailAzienda = inailRate * (2 / 3);
  const costoAzienda =
    totalGross !== null && !isConsulenza
      ? totalGross * (1 + inpsAzienda + inailAzienda)
      : null;

  const isCompensazioneFuoriRange =
    selectedQualifica &&
    grossCompensation > 0 &&
    (() => {
      const annuo = grossCompensation * 12;
      if (selectedQualifica.minLordo !== null && annuo < selectedQualifica.minLordo) return true;
      if (selectedQualifica.maxLordo !== null && annuo > selectedQualifica.maxLordo) return true;
      return false;
    })();

  const activityObjectLen = (mod09.activityObject ?? '').length;

  // Filtered cost centers for datalist
  const filteredCC = ccFilter
    ? COST_CENTERS.filter(
        c =>
          c.label.toLowerCase().includes(ccFilter.toLowerCase()) ||
          c.code.includes(ccFilter)
      )
    : COST_CENTERS;

  return (
    <div>
      {/* ── SEZIONE 0 — Tipo contratto e modalità ── */}
      <div className="form-section-title">
        <i className="bi bi-file-earmark-text" />
        1 — Tipologia Contratto e Modalità di Selezione
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Tipologia Contratto <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod09.contractTypeMod09 ?? ''}
            onChange={e =>
              upd({ contractTypeMod09: e.target.value, aliquota: 'piena' })
            }
          >
            <option value="">— Seleziona —</option>
            {MOD09_CONTRACT_TYPES.map(c => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          {selectedContractType && !isConsulenza && (
            <div className="alert-cmcc info mt-2" style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" />
              INPS (aliquota {aliquota === 'piena' ? 'piena' : 'agevolata'}):{' '}
              <strong>
                {(
                  (aliquota === 'piena'
                    ? selectedContractType.aliquotaPiena
                    : selectedContractType.aliquotaAgevolata) * 100
                ).toFixed(2)}
                %
              </strong>
              {' '}| INAIL: <strong>{(MOD09_ALIQUOTE.inail.piena * 100).toFixed(1)}%</strong>
            </div>
          )}
          {isConsulenza && (
            <div className="alert-cmcc info mt-2" style={{ fontSize: 12 }}>
              <i className="bi bi-info-circle me-1" />
              Per le consulenze non si applicano contributi INPS/INAIL. Verificare l'obbligo IVA.
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Modalità di Selezione <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod09.selectionMode ?? ''}
            onChange={e => upd({ selectionMode: e.target.value })}
          >
            <option value="">— Seleziona —</option>
            {MOD09_SELECTION_MODES.map(m => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
          {selectedSelectionMode?.fromRecruiting && (
            <div className="alert-cmcc info mt-2" style={{ fontSize: 12 }}>
              <i className="bi bi-person-check me-1" />
              Candidato proveniente da ATS — dati pre-compilati dal flusso Recruiting
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Lingua Contratto</label>
          <select
            className="form-select"
            value={mod09.language ?? 'Italiano'}
            onChange={e => upd({ language: e.target.value })}
          >
            {MOD09_LANGUAGES.map(l => (
              <option key={l} value={l}>
                {l}
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
                id="isProrogaToggle"
                checked={mod09.isProroga ?? false}
                onChange={e => upd({ isProroga: e.target.checked })}
                style={{ width: 40, height: 22, cursor: 'pointer' }}
              />
              <label
                className="form-check-label fw-600"
                htmlFor="isProrogaToggle"
                style={{ fontSize: 13, marginLeft: 8 }}
              >
                Si tratta di una proroga?
              </label>
            </div>
            {mod09.isProroga && (
              <input
                type="text"
                className="form-control"
                placeholder="ID contratto precedente (es. PROC-2024-012)"
                value={mod09.prorogaContractId ?? ''}
                onChange={e => upd({ prorogaContractId: e.target.value })}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── SEZIONE 1 — Oggetto e Deliverable ── */}
      <div className="form-section-title">
        <i className="bi bi-card-text" />
        2 — Oggetto e Deliverable
      </div>
      <div className="row g-3 mb-4">
        <div className="col-12">
          <label className="form-label">
            Oggetto del contratto <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Descrivi dettagliatamente le attività oggetto del contratto (min. 50 caratteri)..."
            value={mod09.activityObject ?? ''}
            onChange={e => upd({ activityObject: e.target.value })}
          />
          <div
            style={{
              fontSize: 11,
              textAlign: 'right',
              marginTop: 3,
              color: activityObjectLen < 50 ? '#dc2626' : '#64748b',
            }}
          >
            {activityObjectLen} / min. 50 caratteri
          </div>
        </div>

        <div className="col-12">
          <label className="form-label">
            Obiettivi / Deliverable{' '}
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
              (consigliato)
            </span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Report, articoli scientifici, dataset, codice sorgente, presentazioni..."
            value={mod09.deliverables ?? ''}
            onChange={e => upd({ deliverables: e.target.value })}
          />
        </div>
      </div>

      {/* ── SEZIONE 2 — Qualifica e Compenso ── */}
      <div className="form-section-title">
        <i className="bi bi-currency-euro" />
        3 — Qualifica e Compenso
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Qualifica <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod09.qualifica ?? ''}
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
          {mod09.qualifica && (() => {
            const q = QUALIFICHE_RANGES.find(r => r.code === mod09.qualifica);
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
            Compenso lordo mensile (€) <span className="required">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              min={0}
              step={50}
              value={mod09.grossCompensation ?? ''}
              onChange={e => upd({ grossCompensation: parseFloat(e.target.value) || 0 })}
            />
          </div>
          {rateOraria !== null && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Tariffa oraria calcolata: €{rateOraria.toFixed(2)}/h
              <span
                style={{ marginLeft: 6, cursor: 'help', color: '#94a3b8' }}
                title="Basato su 160 ore/mese standard"
              >
                <i className="bi bi-question-circle" />
              </span>
            </div>
          )}
          {isCompensazioneFuoriRange && (
            <div className="alert-cmcc warning mt-2" style={{ fontSize: 12 }}>
              <i className="bi bi-exclamation-triangle me-1" />
              Il compenso inserito è fuori dal range previsto per la qualifica selezionata.
            </div>
          )}
          {totalGross !== null && (
            <div className="alert-cmcc info mt-2" style={{ fontSize: 12 }}>
              <i className="bi bi-calculator me-1" />
              <strong>Totale lordo stimato:</strong>{' '}
              €{totalGross.toLocaleString('it-IT')} ({months} {months === 1 ? 'mese' : 'mesi'})
            </div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label">
            Numero di rate / mensilità <span className="required">*</span>
          </label>
          <input
            type="number"
            className="form-control"
            min={1}
            step={1}
            placeholder={months !== null ? String(months) : '0'}
            value={mod09.numRate ?? months ?? ''}
            onChange={e => upd({ numRate: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">
            Termini di pagamento <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod09.paymentSchedule ?? ''}
            onChange={e => upd({ paymentSchedule: e.target.value })}
          >
            <option value="">— Seleziona —</option>
            {MOD09_PAYMENT_TERMS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4 d-flex align-items-end">
          <div style={{ width: '100%' }}>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="vatRequiredToggle"
                checked={mod09.vatRequired ?? false}
                onChange={e => upd({ vatRequired: e.target.checked })}
                style={{ width: 40, height: 22, cursor: 'pointer' }}
              />
              <label
                className="form-check-label fw-600"
                htmlFor="vatRequiredToggle"
                style={{ fontSize: 13, marginLeft: 8 }}
              >
                Titolare di Partita IVA
              </label>
            </div>
            {mod09.vatRequired && (
              <input
                type="text"
                className="form-control"
                placeholder="Numero P.IVA"
                value={mod09.vatNumber ?? ''}
                onChange={e => upd({ vatNumber: e.target.value })}
              />
            )}
          </div>
        </div>

        {!isConsulenza && (
          <>
            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="aliquotaAgevolataToggle"
                  checked={(mod09.aliquota ?? 'piena') === 'agevolata'}
                  onChange={e =>
                    upd({ aliquota: e.target.checked ? 'agevolata' : 'piena' })
                  }
                  style={{ width: 40, height: 22, cursor: 'pointer' }}
                />
                <label
                  className="form-check-label fw-600"
                  htmlFor="aliquotaAgevolataToggle"
                  style={{ fontSize: 13, marginLeft: 8 }}
                >
                  Aliquote agevolate?
                </label>
              </div>
            </div>
            {costoAzienda !== null && (
              <div className="col-12">
                <div className="alert-cmcc info" style={{ fontSize: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    <i className="bi bi-calculator me-1" />
                    Riepilogo costi contributivi stimati
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      Lordo totale collaboratore: <strong>€{totalGross!.toLocaleString('it-IT')}</strong>
                    </div>
                    <div className="col-md-4">
                      INPS azienda ({(inpsAzienda * 100).toFixed(2)}%):{' '}
                      <strong>
                        €{(totalGross! * inpsAzienda).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </strong>
                    </div>
                    <div className="col-md-4">
                      INAIL azienda ({(inailAzienda * 100).toFixed(2)}%):{' '}
                      <strong>
                        €{(totalGross! * inailAzienda).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
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
                      €{costoAzienda.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="col-md-6">
          <label className="form-label">
            Impegno <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod09.engagement ?? ''}
            onChange={e => upd({ engagement: e.target.value })}
          >
            <option value="">— Seleziona —</option>
            {MOD09_ENGAGEMENT.map(e => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {mod09.engagement === 'Parziale' && (
          <div className="col-md-6">
            <label className="form-label">
              Percentuale di impegno (%) <span className="required">*</span>
            </label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                min={10}
                max={90}
                step={5}
                value={mod09.engagementPercent ?? 50}
                onChange={e =>
                  upd({ engagementPercent: parseInt(e.target.value) || 50 })
                }
              />
              <span className="input-group-text">%</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Min 10% — Max 90%</div>
          </div>
        )}
      </div>

      {/* ── SEZIONE 3 — Durata ── */}
      <div className="form-section-title">
        <i className="bi bi-calendar-range" />
        4 — Durata del Contratto
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-5">
          <label className="form-label">
            Data inizio <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={mod09.startDate ?? ''}
            onChange={e => upd({ startDate: e.target.value })}
          />
        </div>

        <div className="col-md-5">
          <label className="form-label">
            Data fine <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={mod09.endDate ?? ''}
            min={mod09.startDate ?? ''}
            onChange={e => upd({ endDate: e.target.value })}
          />
        </div>

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

      {/* ── SEZIONE 4 — Progetto e Organizzazione ── */}
      <div className="form-section-title">
        <i className="bi bi-folder2-open" />
        5 — Progetto e Organizzazione
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="form-check form-switch mb-1">
            <input
              className="form-check-input"
              type="checkbox"
              id="isPNRRToggle"
              checked={mod09.isPNRR ?? false}
              onChange={e => upd({ isPNRR: e.target.checked })}
              style={{ width: 40, height: 22, cursor: 'pointer' }}
            />
            <label
              className="form-check-label fw-600"
              htmlFor="isPNRRToggle"
              style={{ fontSize: 13, marginLeft: 8 }}
            >
              Progetto PNRR?
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Progetto</label>
          <input
            type="text"
            className="form-control"
            placeholder="Codice e nome progetto"
            value={
              mod09.project ??
              (state.projectCode
                ? `${state.projectCode} — ${state.projectName}`
                : '')
            }
            onChange={e => upd({ project: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Work Package</label>
          <input
            type="text"
            className="form-control"
            placeholder="es. WP3 — Analisi modellistica"
            value={mod09.workPackage ?? ''}
            onChange={e => upd({ workPackage: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Unità Organizzativa</label>
          <select
            className="form-select"
            value={mod09.orgUnit ?? ''}
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
            list="cost-centers-list-09"
            placeholder="Cerca per codice o nome..."
            value={mod09.costCenter ?? state.costCenter ?? ''}
            onChange={e => {
              upd({ costCenter: e.target.value });
              setCcFilter(e.target.value);
            }}
          />
          <datalist id="cost-centers-list-09">
            {filteredCC.map(c => (
              <option key={c.code} value={c.label} />
            ))}
          </datalist>
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Progetto di allocazione{' '}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Codice progetto per rendiconto"
            value={mod09.allocationProject ?? ''}
            onChange={e => upd({ allocationProject: e.target.value })}
          />
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
            Campo obbligatorio per rendiconto
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Riporta a / Responsabile scientifico</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nome e cognome del responsabile"
            value={mod09.reportTo ?? ''}
            onChange={e => upd({ reportTo: e.target.value })}
          />
        </div>
      </div>

      {/* ── SEZIONE 5 — Sede e Strumenti ── */}
      <div className="form-section-title">
        <i className="bi bi-geo-alt" />
        6 — Sede e Strumenti
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Sede di lavoro <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod09.workLocation ?? ''}
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

        <div className="col-12">
          <label className="form-label">Strumenti forniti dal CMCC</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Es. laptop, accesso HPC, software specifici, licenze..."
            value={mod09.tools ?? ''}
            onChange={e => upd({ tools: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Nome Direttore Unità Organizzativa <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Nome e cognome (per firma)"
            value={mod09.directorName ?? ''}
            onChange={e => upd({ directorName: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Nome Direttore di Divisione</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nome e cognome (opzionale)"
            value={mod09.directorDivisionName ?? ''}
            onChange={e => upd({ directorDivisionName: e.target.value })}
          />
        </div>
      </div>

      {/* ── SEZIONE 6 — Note ── */}
      <div className="form-section-title">
        <i className="bi bi-chat-text" />
        7 — Note e Welfare
      </div>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Note aggiuntive</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Eventuali informazioni aggiuntive per GRU o AMM..."
            value={mod09.notes ?? ''}
            onChange={e => upd({ notes: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Welfare (€)</label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              className="form-control"
              min={0}
              step={100}
              value={mod09.welfare ?? 0}
              onChange={e => upd({ welfare: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
