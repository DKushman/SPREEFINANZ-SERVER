# Monorepo – Setup & Betrieb

## Übersicht

- **devdesign.de** → Firmenwebsite (Frontend + API)
- **preiseberechnen.de** → Produkt-Seite (Frontend + API)
- **admin.preiseberechnen.de** → Admin-Dashboard (Frontend, API shared mit preiseberechnen.de)

Infrastruktur: Docker Compose, Caddy (Reverse Proxy + TLS), eine PostgreSQL-Instanz mit zwei Datenbanken (`devdesign_db`, `preiseberechnen_db`).

## Voraussetzungen

- Linux-Server mit Docker und Docker Compose
- Domains zeigen auf die Server-IP (A/AAAA)
- Ports 80 und 443 von außen erreichbar (für Caddy/ACME)

## Deployment

1. Repo auf den Server klonen bzw. `git pull`
2. In `infra/` eine `.env` aus `.env.example` anlegen und Werte setzen (Passwörter, ggf. Domains)
3. Vom Repo-Root aus: `./scripts/deploy.sh`

Das Skript wechselt in `infra/`, baut/startet alle Container und bringt die Stack hoch.

## Rollback

Git-basiert: Auf den gewünschten Commit wechseln, dann erneut deployen.

```bash
git checkout <commit-hash>
./scripts/deploy.sh
```

Bei DB-Schema-Änderungen: Rollback nur mit passenden Migrations-/Restore-Schritten; Init-Skripte laufen nur bei neuem Postgres-Volume.

## Backup

- **Erstellen:** `./scripts/backup.sh`  
  Schreibt Dumps nach `./backups/` (devdesign_db und preiseberechnen_db mit Timestamp im Dateinamen).
- **Wiederherstellen:** `./scripts/restore.sh` – siehe Nutzungshinweis im Skript (Parameter: DB, Dump-Datei).  
  Restore nur auf leere DB oder nach Rücksprache; bestehende Daten können überschrieben werden.

## Domains & Routing

| Domain / Pfad | Ziel |
|---------------|------|
| devdesign.de | devdesign_frontend |
| devdesign.de/api/* | devdesign_api |
| preiseberechnen.de | preise_frontend |
| preiseberechnen.de/api/* | preise_api |
| admin.preiseberechnen.de | preise_admin_frontend |
| admin.preiseberechnen.de/api/* | preise_api |

TLS wird von Caddy per Let’s Encrypt (ACME) bereitgestellt.
