# IM_Wiki

Et enkelt wiki-system. Fokuset i prosjektet er å lage selve systemet og strukturen.

---
## Mål

- Lage et fungerende wiki-system
- Lage login og adminpanel til å lage wiki-sider
- Ha en ryddig prosjektstruktur
- Dokumentasjon
- Ha ulike skisser for hver side

---
## Hva jeg bruker

- HTML (Selve nettsiden)
- CSS (Design av nettsiden)
- JavaScript (Bruk for systemet)
- Raspberry PI (Server) & Flask (Web-server & Hosting)
- Docker Desktop (Container)
- MariaDB (Database)
- KanBan/Github Project (Planlegging)


---
## Prosjektstruktur

IM-Wiki/

- media/
- static/
- templates/

---
## Funksjoner

- Wiki forside
- Login for lærer
- Admin dashboard
- Opprette nye wiki-sider
- Vise wiki-sider
- Elev-visning

---
# HVA JEG SKAL VISE PÅ PRØVEEKSAMEN (Planlegging)

## Utvikling
- Kode login-system (HTML, JavaScript)
- Kode “lag ny side” funksjon (HTML, JavaScript)
- Designe brukergrensesnitt (CSS)
- Backend med Flask (Python) og kobling mellom templates og database
- Debugging av kode (finne og rette feil under utvikling)
- Versjonshåndtering med Git (lagring av endringer og historikk)
    - Dokumentasjon:
       - Prompts brukt med AI (hva, hvordan, hvorfor)
       - Forklaring av systemene
       - Oppdatering av Kanban board (planlegging og progresjon)

## Driftstøtte
- Bruke Docker til å kjøre systemet (docker-compose up)
- Sette opp database på Raspberry Pi (infrastruktur)
- Koble backend (Flask) til ekstern database via nettverk
- Forklare arkitektur (frontend → backend → database)
- Automatisering:
     - Starte hele systemet med Docker
- Testing av system:
     - Sjekke at login og lagring fungerer
- Feilsøking:
     - Identifisere og løse problemer
- Grunnleggende sikkerhet


## Brukerstøtte
- Lage enkel brukerveiledning (hvordan bruke wikien)
- Veilede bruker:
   - Hvordan lage konto / logge inn
   - Hvordan lage ny side
- Brukersentrering:
   - Fokus på enkel navigasjon og forståelig design
- Kommunikasjon:
   - Forklare tekniske problemer på en enkel måte
- Problemløsning:
   - Hjelpe bruker hvis noe ikke fungerer
- Refleksjon:
   - Hvordan systemet kan forbedres for brukere

- En enkel “hjelp”-side i wikien (HTML)