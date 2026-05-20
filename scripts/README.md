# Scripts — dump dati da MongoDB

## `dump-dossier-risorse.py`

Scarica le risorse dalla collection **DossierRisorse** (DB `Helios_TEST`) di
MongoDB e le scrive in `src/data/dossierRisorse.json` con la stessa shape
dell'interfaccia `Resource` usata in `src/types/index.ts`.

### Prerequisiti
- Python 3.9+
- `pip3 install pymongo`
- **Accesso di rete al cluster** `ec2-63-178-85-99.eu-central-1.compute.amazonaws.com:27017`
  (la connessione richiede tipicamente VPN CMCC — dalla rete pubblica la porta è chiusa).

### Uso
```bash
python3 scripts/dump-dossier-risorse.py
```

Output:
- Stampa schema + distinct su `unit` e `contractType`
- Limita a 500 record (sort startDate desc) — modifica `LIMIT` nello script se ne servono di più
- Scrive `src/data/dossierRisorse.json`

### Integrazione lato app
Dopo aver generato il JSON, sostituisci (o affianca) l'array `RESOURCES` in
`src/data/mockData.ts`:

```ts
import dossier from './dossierRisorse.json';
export const RESOURCES: Resource[] = dossier as Resource[];
```

### Note sulla mappatura
Il documento sorgente non ha campi standardizzati: lo script tenta più alias
(`fullName`/`NOMECOMPLETO`/`DSCOG`, `unit`/`DSUNIT`, ecc.) e cade su default
quando il campo è assente. La prima esecuzione stampa un sample dei documenti
così puoi rivedere la mappatura ed estenderla in `map_doc()`.
