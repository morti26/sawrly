# ÅTERSTÄLLNING AV HISTORIK FRÅN DISK
# Fil: .project_history/ATERSTALLNING.md
# Används AV AGENTER när TRAE installerats om, eller en ny session startas.
# Viktigt: ALLTID läsa dessa filer INNAN man gör NÅGRA ändringar i projektet.

---

## 🚨 ÅTERSTÄLLNINGSNOD — FÖRSTA GÖREMALET I EN NY SESSION
När en ny TRAE-session öppnas för detta projekt (OAVSETT om agenten "kommer ihåg" eller inte),
gör följande i **exakt denna ordning**, INNAN någon kod skrivs:

### 1. Läs dessa 3 filer (hel eller i sammanfattande grad)
1. [PROJEKT_MINNE.md](file:///mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public/.project_history/PROJEKT_MINNE.md) — full kontext, design, sessioner, vad som gjorts.
2. [projekt_status.json](file:///mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public/.project_history/projekt_status.json) — maskinläsbar, pågående uppgifter, senaste session, vad användaren faktiskt vill bli klar med.
3. Mappen **sessioner/** — kopior av TRAE:s interna sessionsminnen. De är `.jsonl`-filer, JSON på varje rad. Läs dem för konversationstillägg.

### 2. Validera att du förstår projektet (KORT CHECKLISTA)
- [ ] Vet du att detta är **Sawrly / صورلي**? (arabisk foto-plattform i Irak, INTE ett moderikt mode-märke!)
- [ ] Vet du vilken branch/remote? (`master` → GitHub `morti26/sawrly.git`)
- [ ] Vet du att `static/` är den enda untrackade mappen just nu? (inga andra ändringar!)
- [ ] Har du kollat `git status` + senaste 5 `git log --oneline`?
- [ ] Vet du vad användaren jobbar på just nu för att "bli klar"? (se projekt_status.json → "nasta_steg" / "pagaende_uppgifter")

### 3. Presentera återställningsbekräftelse för ANVÄNDAREN på SVENSKA
Säg något i stil med:
> "Jag har återställt historiken från disk — vi jobbar på **Sawrly (صورلي)** som är en arabisk foto-/videoplattform i Irak med Flutter-app + Next.js backend/admin (GitHub morti26/sawrly). Senaste session: 2026-08-07. [Vad vi gjorde senast, från projekt_status.senaste_session] — vill du fortsätta där eller jobba på något annat just nu?"

**VIKTIGT:** Fråga användaren vad de vill bli KLARA MED idag — titta på "fragor_till_nasta_session" i projekt_status.json.

---

## 💾 VARFÖR DETTA FUNKAR ÄVEN OM TRAE INSTALLERAS OM
- TRAE:s interna minne ligger normalt i `/home/morti/.trae/memory/...` (kan raderas vid ominstallation).
- **Denna** `.project_history/` mapp ligger **direkt under projektroten**:
  `/mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public/.project_history/`
- Denna sökväg är på en **separat volym (`/mnt/disk-extra/...`)**, alltså INTE `/home`, INTE systemdisken.
- Den följer med projektet genom git om du vill (den är just nu untracked — lägg till den i `.gitignore` eller committa den som backup), men den ligger alltid kvar på den externa disken även om hela datorn formateras.

---

## 🛠️ SÅHÄR UPPDATERAR DU MINNET EFTER EN SESSION
Gör följande i slutet av ALLA sessioner:

1. **Spara sessionsminne från TRAE**
   - Kopiera senaste JSONL från:
     `/home/morti/.trae/memory/projects/-mnt-disk-extra-hostingdata-cmnp2kdic001a4hr2yofnyk76-sawrly-com-public/<YYYYMMDD>/session_memory_<id>.jsonl`
   - → till:
     `.project_history/sessioner/YYYYMMDD_<kort-id>.jsonl`

2. **Uppdatera projekt_status.json** med:
   - Fältet `projekt.senast_uppdaterad` (ISO-tid med tidszon)
   - `pagaende_uppgifter` (nya klarade uppgifter sätts till `status: klar`, `klar_datum`)
   - Lägg till nya uppgifter om användaren började på något nytt
   - Uppdatera `skapta_filer` om det nya filer (endast viktiga, inte .next/cache)
   - Uppdatera `senaste_session.handelser` med en lista på vad som gjordes
   - Skriv en kort `fragor_till_nasta_session` på svenska (vad nästa agent ska fråga)

3. **Uppdatera PROJEKT_MINNE.md**
   - Lägg till en ny rad under "📅 SESSIONSHISTORIK" med datum, id, och sammanfattning
   - Om något stort designbeslut fattats: lägg till under "🎨 DESIGN / TEMASTANDARD"
   - Om strukturen ändrats (nya moduler): uppdatera "🗂️ KÄLLSTRUKTUR"
   - Under "✅ PÅGÅENDE / NÄSTA UPPGIFTER" lägg till/avmarkera saker

4. **Valfritt: Snapshot/backup**
   - Kör (från projektroten):
     ```bash
     DATE=$(date +%Y%m%d_%H%M)
     cp -r .project_history ".project_history/backups/${DATE}_efter_session"
     ```

---

## ❌ FEL ATT UNDVIKA (lärdom från 2026-08-07)
1. **TRO INTE ATT KATALOGEN ÄR TOM bara för att `ls` inte visar allt på en gång.**
   - Kör alltid `git status`, `git log --oneline -n 10`, `cat package.json`, `ls app` först.
2. **INVENTERA INGET INNEHÅLL.** Om användaren säger "bli klar" betyder det FÄRDIGSTÄLL nuvarande arbete, INTE "hitta på något nytt".
3. **RÖR INTE befintliga git-trackade filER förrän du vet vad du gör.**
   - Om det är untracked och du inte skapade dem fråga användaren först.
4. **SKRIV INTE ÖVER befintliga index.html, package.json, eller annat utan dubbelkolla.**
   - I detta projekt är landningssidan **`app/page.tsx`** (Next.js App Router) — INTE en `index.html` i roten!

---

Senast uppdaterad: 2026-08-07 (session: 6a760)
