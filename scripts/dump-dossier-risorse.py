#!/usr/bin/env python3
"""Dump DossierRisorse → src/data/dossierRisorse.json, mapped to the React `Resource` interface."""
import json, sys, datetime, os
from pymongo import MongoClient

URI = 'mongodb://copilot_mcp:CP_MCP_HOPAURA00!@ec2-63-178-85-99.eu-central-1.compute.amazonaws.com/'
OUT = '/Users/gamaranto/Documents/VS CODE/HRMockup_Code/src/data/dossierRisorse.json'
LIMIT = 500

def to_iso(v):
    if v is None: return None
    if isinstance(v, datetime.datetime): return v.date().isoformat()
    if isinstance(v, datetime.date): return v.isoformat()
    s = str(v)
    return s[:10] if len(s) >= 10 and s[4] == '-' else s

def first(d, *keys, default=''):
    for k in keys:
        if k in d and d[k] not in (None, ''): return d[k]
    return default

def to_bool(v, default=False):
    if isinstance(v, bool): return v
    if v is None: return default
    s = str(v).strip().lower()
    return s in ('true','1','si','sì','yes','y')

def map_doc(d):
    full = first(d, 'fullName', 'NOMECOMPLETO', 'DSCOG').strip()
    if not full:
        fn = first(d,'firstName','NOMERIS','DSNOME')
        ln = first(d,'lastName','COGNRIS','DSCOG')
        full = (str(ln) + ' ' + str(fn)).strip()
    first_n = first(d,'firstName','NOMERIS','DSNOME','NOME', default=full.split(' ')[0] if full else '')
    last_n  = first(d,'lastName','COGNRIS','DSCOG','COGNOME', default=full.split(' ')[-1] if full else '')

    sex_v = first(d,'sex','SESSO','SEX', default='M')
    sex = 'F' if str(sex_v).upper().startswith('F') else 'M'

    return {
        'idSubject':       str(first(d,'idSubject','ID_SUBJECT','SUBJECT_ID','IDSOGGETTO','CODSUB','idsubject', default=str(d.get('_id','')))),
        'idEmploy':        str(first(d,'idEmploy','ID_EMPLOY','MATRICOLA','MATR','idemploy')),
        'fullName':        full or '—',
        'firstName':       str(first_n),
        'lastName':        str(last_n),
        'email':           str(first(d,'email','EMAIL_AZ','EMAIL_CMCC','EMAIL','MAIL_AZ', default='')),
        'emailPrivate':    str(first(d,'emailPrivate','EMAIL_PRIV','EMAIL_PERS','EMAIL_PRIVATA', default='')) or None,
        'sex':             sex,
        'birthDate':       to_iso(first(d,'birthDate','DTNASC','DATA_NASCITA','BIRTHDATE')),
        'birthCountry':    str(first(d,'birthCountry','PAESE_NAS','PAESENASC','NAZ_NASC','LUOGONASC', default='')),
        'residenceCountry':str(first(d,'residenceCountry','PAESE_RES','NAZ_RES','PAESERES', default='ITALIA')),
        'cf':              str(first(d,'cf','CODFIS','CODICEFISCALE','CF', default='')),
        'contractType':    str(first(d,'contractType','TPCONTR','DSTPCONTR','TIPOCONTR','CONTRACT_TYPE', default='')),
        'contractNature':  str(first(d,'contractNature','NATURA_CONTR','NATURACONTR','CONTRACT_NATURE', default='')),
        'unit':            str(first(d,'unit','DSUNIT','UNITA_NAME','UNITA','UNIT_NAME', default='')),
        'unitCode':        str(first(d,'unitCode','CDUNIT','UNITA_CODE','UNITCODE', default='')),
        'sede':            str(first(d,'sede','DSSEDE','SEDE','SEDE_LAVORO', default='')),
        'profession':      str(first(d,'profession','DSPROF','PROFESSIONE','RUOLO','MANSIONE', default='')),
        'qualProf':        str(first(d,'qualProf','QUALIFICA','DSQUALPROF','QUALPROF', default='')),
        'study':           str(first(d,'study','TITOLO_STUDIO','STUDIO','TITSTUDIO', default='')),
        'isPartTime':      to_bool(first(d,'isPartTime','PART_TIME','PT', default=False)),
        'partTimePercent': int(first(d,'partTimePercent','PERC_PT','PARTTIME_PERC', default=100) or 100),
        'startDate':       to_iso(first(d,'startDate','DTINIZIO','DATAINIZIO','INIZIOCONTR')),
        'endDate':         to_iso(first(d,'endDate','DTFINE','DATAFINE','FINECONTR')) or None,
        'ccnl':            str(first(d,'ccnl','CCNL','TIPO_CCNL', default='')),
        'ccnlLevel':       str(first(d,'ccnlLevel','LIV_CCNL','LIVELLO','CCNL_LEVEL', default='')) or None,
        'isEU':            to_bool(first(d,'isEU','UE','IS_EU', default=True), default=True),
    }

def main():
    print(f'Connecting to MongoDB…', flush=True)
    client = MongoClient(URI, serverSelectionTimeoutMS=15000)
    db = client['Helios_TEST']
    coll = db['DossierRisorse']

    total = coll.count_documents({})
    print(f'Total documents: {total}', flush=True)

    sample = list(coll.find().limit(2))
    if sample:
        print('\nSAMPLE KEYS:', sorted(sample[0].keys())[:60], flush=True)
        print('\nSAMPLE_0 VALUES (truncated):', flush=True)
        for k,v in list(sample[0].items())[:30]:
            sv = str(v)
            print(f'  {k}: {sv[:80]}')

    # Distinct values for diagnostics
    for fld in ('unit','DSUNIT','CDUNIT','contractType','TPCONTR','DSTPCONTR'):
        try:
            vals = coll.distinct(fld)
            if vals:
                print(f'\nDISTINCT {fld} ({len(vals)}):', vals[:30], flush=True)
        except Exception as e:
            print(f'distinct {fld} failed: {e}')

    # Pull all, map, sort by startDate desc, take LIMIT
    print(f'\nFetching documents (cap={LIMIT})…', flush=True)
    cursor = coll.find({})
    mapped = []
    for d in cursor:
        m = map_doc(d)
        if m['fullName'] and m['fullName'] != '—':
            mapped.append(m)
    print(f'Mapped non-empty: {len(mapped)}', flush=True)

    mapped.sort(key=lambda r: r.get('startDate') or '0000-00-00', reverse=True)
    mapped = mapped[:LIMIT]
    print(f'Writing {len(mapped)} records to {OUT}', flush=True)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(mapped, f, ensure_ascii=False, indent=1)

    print(f'\nDONE. Sample mapped record:')
    print(json.dumps(mapped[0], ensure_ascii=False, indent=2) if mapped else '(none)')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'ERROR: {e}', file=sys.stderr)
        sys.exit(1)
