# Video-Studio

Dieses Projekt macht aus einer Idee oder Frage des Nutzers automatisch ein fertiges Kurzvideo
(Hochformat 1080×1920, 30–60 s) für Instagram Reels und TikTok und plant es über Metricool ein.
Antworte auf Deutsch, in einfacher Sprache.

## Wenn der Nutzer eine Idee oder Frage schickt

Ohne Rückfragen den ganzen Ablauf durchziehen (Details: `ANLEITUNG.md`):

1. **Recherchieren** mit WebSearch, Fakten prüfen, nichts erfinden.
2. **Skript** schreiben: 5–8 Szenen. Szene 1 = starker Hook, letzte Szene = Aufruf zum Folgen.
3. **Bilder in Canva** erzeugen (generate-image, PORTRAIT_9_16, einheitlicher Stil, gleiche Figur),
   dann per `create-design` + `export-design` in voller Auflösung nach `videos/NNN-name/bilder/` holen.
   Fällt Canva aus: SVG-Illustrationen selbst zeichnen (Vorlage `videos/001-kraken`).
4. **Bauen:** `python3 bauen.py && python3 ../../engine/stimme.py . && node ../../engine/render.js .`
5. **Prüfen:** Einzelbilder mit ffmpeg herausziehen und ansehen (Lesbarkeit, nichts abgeschnitten).
6. **`post.txt`** mit Text und Hashtags schreiben; Video + Cover mit SendUserFile schicken.
7. **Committen und pushen** (nur `videos/` und Engine-Änderungen; `audio/` ist ignoriert).
8. **Veröffentlichen** über Metricool (`createScheduledPost`):
   - Medien-URL: `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/videos/NNN-name/<datei>.mp4`
     (das Repository ist öffentlich; erst nach dem Push verfügbar).
   - Instagram: `instagramData.type = "REEL"`, `isAiGenerated: true`, Cover über `videoThumbnailUrl`.
   - TikTok: `tiktokData.isAigc: true`, `title` setzen.
   - Konto, Uhrzeit und ob sofort veröffentlicht oder als Entwurf: siehe „Einstellungen“ unten.
     Ist dort nichts festgelegt, vor dem ersten Veröffentlichen einmal nachfragen.

## Einstellungen des Nutzers

- Kanal: **„Wusstest du's?“** – TikTok `@wusstestdu_s`. Instagram noch offen.
- Look: erwachsen, nicht kindlich, **KEIN Neon-Stil in den Bildern** (Wunsch des Nutzers 20.11.: „zu viel Neon“).
  Bilder **realistisch mit natürlichen Farben und natürlichem Licht**, passend zum Thema (Foto-Look fürs Weltall,
  Gemälde-Look für Geschichte, Makro-Foto für Körper/Tiere, Alltagsfotos für Alltagsthemen). Gern filmisch, aber
  nicht neonbunt. Canva-Prompt-Grundgerüst: „<Motiv>, realistic cinematic photography, natural colors, natural
  lighting, high detail, premium, not childish, no neon, no text“. Cyan (#3ff0ff) und Magenta (#ff4fd8) nur im festen
  Rahmen: Überschrift-Hervorhebung, Untertitel, Effekte, Logo am Ende. Profilbild: `kanal/profilbild.png`.
- Schluss-Szene: gesprochen immer **„Wusstest du das? Schreib's in die Kommentare und folg für mehr!“** (Wunsch des Nutzers 20.11.; Ausnahme Redewendungen, siehe „Kommentare holen“) – nie „Wusstest-du's“ in den
  Sprechtext schreiben, das spricht die Stimme falsch aus. Als Überschrift (kopf) darf „Wusstest du's?“ stehen.
- Metricool: Marke `blogId 8000715` (Zeitzone Europe/Copenhagen). Darin sind TikTok „Wusstest du's?“
  und Instagram `wunsch_fabrik_dk` verbunden. **Immer nur `providers: [{"network":"tiktok"}]`** –
  Instagram `wunsch_fabrik_dk` ist das Geschäftskonto und bekommt nie diese Videos.
- Stimme (Wunsch des Nutzers 22.11.): **NUR Qwen3-TTS „Ryan“** – alle anderen Stimmen (Design, Aiden, Killian, Piper …) raus.
  Standard in `stimme.py` (`anbieter` "qwen", `QWEN_STIMME = "Ryan"`). Ganzer Text wird in EINEM Durchgang gesprochen und per
  Whisper-Wortzeiten in Szenen geschnitten (Schnitt an der leisesten Stelle), Tempo ×1,1. Dauer ca. 7 min pro Video – früh starten.
  Fällt Qwen aus: NICHT mit anderer Stimme veröffentlichen, sondern Qwen neu starten (notfalls Termin verschieben).
  Qwen spricht etwas langsamer → Skripte knapp halten (Ziel 25–40 s).
- **Logo / Schluss-Szene:** Die letzte Szene nutzt IMMER `kanal/schluss.png` (= exakt das Profilbild `kanal/profilbild.png`, ins Hochformat verlängert; die Neon-Krake, deren Arme ein
  Fragezeichen bilden) als `"foto": "../../kanal/schluss.png"`, Überschrift „Wusstest <b>du's?</b>“, Effekt
  `hervorheben(540, 860, maske="../../kanal/maske_logo.png", art="puls", glanz="#ff4fd8", halten=None, wort="folg")`.
  Kein neues Logo-Bild erzeugen.

- **Effekte – feste Regel des Nutzers:** Objekte werden IMMER in ihrer echten Form hervorgehoben, nie mit
  Kreisen, Ovalen oder Ringen. Ablauf je Objekt:
  1. `python3 ../../engine/ausschneiden.py bilder/X.png <name> x1,y1,x2,y2` (Rahmen knapp um das Objekt,
     mehrere Rahmen für mehrere Teile) → `bilder/maske_<name>.png`.
  2. **`bilder/maske_<name>_check.jpg` ansehen**: Ist genau das Objekt magenta? Sonst Rahmen anpassen.
  3. In `bauen.py`: `hervorheben(x, y, maske=str(B / "maske_<name>.png"), wort="…", glanz=Akzentfarbe)`
     mit x, y = Mitte des Objekts; `art="puls"` oder `"blink"` für Abwechslung.
  **Verboten:** `kreis()`, `sonar()`, `leuchten()` und `hervorheben()` ohne `maske`.
  Erlaubt ergänzend: `schild()` für Zahlen/Begriffe, `pfeil()` nur für Bewegungen/Richtungen, `ekg()`, `tempo_linien()`.

- **Zuschauer halten – Pflicht in jedem Video (Wunsch des Nutzers 20.11.: „alles was Views bringt“):**
  - **Länge 25–40 s**, 5–7 Szenen, kurze Sätze, auf Anhieb verständlich. Kein langsamer Einstieg.
  - **Hook** in `projekt.json`: `"hook": {"text": "1 Tag &gt; <b>1 Jahr?!</b>", "dauer": 1.4}` – größte Zahl/krasseste
    Behauptung, max. 4 Wörter, knallt mit Bass + Wackeln in der 1. Sekunde ins Bild. Gesprochener 1. Satz = sofort die Behauptung.
  - **Loop:** Der letzte Fakt-Satz vor dem Schluss führt zurück zum Anfang (z. B. „… und genau deshalb ist ein Tag dort länger als ein Jahr.“).
  - **Musik:** `"musik": "spannend" | "ruhig" | "episch"` (selbst erzeugt, `engine/musik/`, wird unter der Stimme automatisch leiser).
  - **Emojis** in Untertiteln: `"emojis": {"venus": "🪐", "einschlag": "💥"}` (Wortanfang → Emoji), 4–7 pro Video.
  - **Fortschritt:** `"label": "FAKT 1/3"` an den Fakt-Szenen – Leute bleiben bis zum letzten Fakt.
  - **3D-Effekt:** pro Szene `"objekt": {"maske": "<abs. Pfad maske_X.png>", "x": .., "y": ..}` – das ausgeschnittene
    Hauptobjekt schwebt vor dem Hintergrund. In fast jeder Szene nutzen.
  - **Zahlen zählen hoch:** `zaehler(x, y, 225, nach=" TAGE", wort="225", plus=-0.4)` statt `schild()` bei Zahlen.
  - **Beben:** `beben(wort="…")` bei dem krassesten Moment (1–2× pro Video).
  - **Motion-Design-Effekte (Wunsch des Nutzers 21.11.):** pro Video **2–3** Effekte aus `engine/fx.js` an den stärksten Stellen,
    über `szene["fx"] = [fx_…(…, wort="…")]` (Funktionen in `effekte.py`): `fx_explosion` (größte Zahl zählt hoch),
    `fx_streifen` (Kernaussage in Streifen), `fx_punkte` (Punkte formen Zahl), `fx_uhr` (Zeit-Fakten), `fx_laufband`,
    `fx_punktkugel` (Planeten/Atome), `fx_muster` (Übergang), `fx_farbschnitte` (Wortfolge im Takt), `fx_play`,
    `fx_strahlen` (hinter dem Logo am Ende). Jedes Video etwas anders kombinieren; in derselben Szene dann KEIN `zaehler`/`schild` mit derselben Zahl (doppelt). Beispiel: `videos/demo-fx`.
  - Kamerafahrten, wechselnde Übergänge, Soundeffekte (Wusch, Klick, Pling, Bass) macht die Engine automatisch.
  - **Kommentare holen (Wunsch des Nutzers 22.11. „mach 1, 2, 4“; bisher 0 Kommentare):**
    1. **Redewendungen:** Schlusssatz gesprochen IMMER „Welche Redewendung soll ich als Nächstes erklären? Schreib sie in die
       Kommentare und folg für mehr!“ (statt des normalen Schlusssatzes); Schild am Ende „Welche als Nächstes?“.
       Wünsche, die der Nutzer aus den Kommentaren weitergibt, als nächste Folgen bauen, im Post „Wunsch von @name“.
    2. **Fakten- und GTA-Videos: raten lassen.** Direkt nach dem Hook (2. Satz) eine Rate-Frage mit Auswahl, z. B.
       „Was glaubst du: A oder B? Schreib's in die Kommentare, bevor ich's auflöse!“ – Auflösung erst später im Video.
    4. In Metricool IMMER `firstCommentText` setzen – eine konkrete Frage,
    auf die man antworten will (Redewendungen: „Welche Redewendung soll ich als Nächstes erklären? Schreib sie hier rein 👇“;
    Fakten/GTA: Entweder-oder oder „1, 2 oder 3?“). Wünsche aus Kommentaren als nächste Folgen bauen, im Post „Wunsch von @name“.
  - **post.txt** endet IMMER mit „Wusstest du's? Schreib's in die Kommentare! 👇“ (Wunsch des Nutzers 20.11.), davor gern eine
    passende Frage zum Thema. Im Text darf „Wusstest du's?“ stehen – nur im Sprechtext nicht.
- **Überarbeitungen:** Wird ein Video neu gebaut oder neu gerendert, IMMER alle aktuellen Regeln mit einbauen
  (Schlusssatz, Hook, Post-Text …) – auch wenn dafür die Stimme neu erzeugt werden muss (Wunsch des Nutzers 20.11.).
- **Keine Bilder wiederverwenden:** Jedes Video bekommt eigene, neue Bilder. Bilder aus früheren Videos NIE erneut
  nutzen (Wunsch des Nutzers 20.11.). Lieber ein Video später veröffentlichen als mit alten Bildern.
- **Hashtags:** 4–6 passende, spezifische Hashtags (Thema + `#wusstestdu` + `#fakten`). Kein `#fyp`/`#foryou`.
- **GTA-Videos – Look (Wunsch des Nutzers 20.11.: „extrem gut, professionell, nicht billig“):** eigene Canva-Bilder im
  echten Vice-City-/Miami-Look (Nacht-Skyline, Ocean Drive, Sportwagen, Strand, Banküberfall, Polizei-Verfolgung, Geldbündel,
  Palmen, Sonnenuntergang) – filmisch wie ein Spiel-Screenshot. Hier ist **Neon erlaubt**, weil es zum Vice-City-Look gehört.
  Prompt-Grundgerüst: „<Motiv>, Vice City Miami vibe, cinematic video game screenshot style, ultra realistic, dramatic
  lighting, neon reflections at night, high detail, no text, no logos, no real persons“. KEINE Rockstar-Figuren, -Logos,
  Screenshots oder Trailer. Sobald der Nutzer die PC-Version hat: eigene Spielaufnahmen (Google Drive) schneiden.
- **Openverse (freie Fotos + Klänge, ohne Schlüssel, Wunsch des Nutzers 21.11.):** `engine/openverse.py` ergänzt Canva –
  so gibt es mehr Bilder pro Video (6–10 statt 4 → schnellere Schnitte) ohne Canva-Pause.
  `python3 ../../engine/openverse.py suche "miami night skyline" --hoch` → `ov_vorschau.jpg` ansehen, passende wählen,
  `python3 ../../engine/openverse.py lade <id> bilder/name.png --projekt .` (schneidet auf 1080×1920, schreibt `quellen.txt`).
  Gut für echte Orte/Dinge: Miami-Fotos für GTA/Vice City, NASA-Fotos fürs Weltall, Tiere, Geschichte (Gemälde, gemeinfrei).
  Nur cc0/pdm/by. Bei „by“ in `post.txt` vor den Hashtags „📷 Fotos: <Urheber> (CC BY)“. Keine Bilder mit Wasserzeichen,
  erkennbaren Privatpersonen im Fokus, fremden Logos oder Spiel-/Film-Screenshots. Auch Klänge (`--audio`), z. B. Soundeffekte.
- **OpenMontage (Wunsch des Nutzers 21.11.):** Open-Source-Videostudio mit ~80 Skills, liegt in `/home/user/OpenMontage`
  (fehlt es: `git clone --depth 1 https://github.com/calesthio/OpenMontage /home/user/OpenMontage && cd /home/user/OpenMontage && make setup`).
  Nutzen: echte Videoclips aus freien Archiven (`tools/video/direct_clip_search.py`, Quellen ohne Schlüssel: nasa, archive_org,
  wikimedia, openverse, loc). Coverr braucht inzwischen einen Schlüssel. Mit `PEXELS_API_KEY`/`PIXABAY_API_KEY` in
  `/home/user/OpenMontage/.env` kommen hochwertige Stock-Videos dazu. Unsere eigene Engine bleibt für Untertitel/Effekte/Hook.
- **Lemo-Opuscar (Wunsch des Nutzers 21.11.):** Skill in `.claude/skills/lemo-opuscar` – 99 Filmstile, Kurzfilme komplett in Code
  (Cartoon/Comic wie rubber-hose, midcentury-toon, manga-panels; Erklärstile wie dark-documentary, news-package, map-explainer;
  neon-tubes, hologram-hud, pixel-rpg). Bibliothek: `sh .claude/skills/lemo-opuscar/scripts/setup.sh` (→ `~/lemo-opuscar`),
  Werkzeuge: `… setup.sh deps` (core installiert). Ablauf: `$LIB/AGENTS.md` lesen und befolgen. Gut für Comic-/Alltags-Videos
  (z. B. Kalle) mit echter Animation. Lemo braucht ffmpeg 7+: liegt in `/root/ffmpeg7/ffmpeg-7.0.2-amd64-static`, vor jedem
  Lemo-Befehl `export PATH=/root/ffmpeg7/ffmpeg-7.0.2-amd64-static:$PATH`. Fehlt der Ordner (neue Umgebung): vom Nutzer erlaubt (21.11.),
  `mkdir -p /root/ffmpeg7 && cd /root/ffmpeg7 && curl -sLO https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz`,
  md5 mit der `.md5`-Datei daneben prüfen, entpacken. Unsere eigene Engine nutzt weiter das System-ffmpeg.
- **Whisper + Piper (Wunsch des Nutzers 21.11., lokal und kostenlos):** venv `/root/stimme-venv` (piper-tts, faster-whisper).
  - **Sprachcheck:** `/root/stimme-venv/bin/python engine/sprachcheck.py <wav> "Text"` → erkannter Text + Übereinstimmung %;
    bei < 85 % Zeile umformulieren/neu erzeugen. Für wichtige Sätze (Hook, Pointe, Zahlen) nutzen.
  - **Piper-Stimmen** in `/root/piper-voices` (de_DE thorsten-high, thorsten_emotional, kerstin, pavoque); Hörproben in
    `kanal/stimmproben/piper/`. Standard bleibt Killian, bis der Nutzer sich anders entscheidet.
  - Fehlt die venv (neue Umgebung): `python3 -m venv /root/stimme-venv && /root/stimme-venv/bin/pip install piper-tts faster-whisper`,
    Stimmen von huggingface.co/rhasspy/piper-voices (de/de_DE/…).
  - Ollama (lokales Sprachmodell) wird nicht gebraucht.
  - **Chatterbox Multilingual** (MIT, Deutsch, Emotionsregler `exaggeration`): venv `/root/tts2-venv` (CPU-Torch + chatterbox-tts),
    Test-Skript `/root/cb_test.py`, ~20 s pro Satz auf CPU. Proben `kanal/stimmproben/chatterbox/`. Gut für lebhafte Comic-Stimmen.
  - Alle deutschen Microsoft-Stimmen als Proben: `kanal/stimmproben/weitere/`.
  - **Qwen3-TTS** (Apache-2.0, Deutsch): venv `/root/qwen-venv`, Skript `/root/qwen_test.py`. 0.6B-CustomVoice (Sprecher
    Ryan/Aiden sprechen Deutsch) und 1.7B-VoiceDesign (Stimme per Beschreibung, z. B. „tiefe, warme deutsche Männerstimme,
    Doku-Erzähler“), ~30–40 s pro Satz auf CPU. Proben `kanal/stimmproben/qwen3/`. Achtung Speicher: Modelle liegen in
    `~/.cache/huggingface` (mehrere GB); bei Platzmangel `~/.cache/pip` leeren.
- **Comic-Videos (Wunsch des Nutzers 21.11.: Kassen-Comic „ganz schlecht, unterirdisch“, gelöscht):** NIE mehr mit
  starren SVG-Zeichnungen und Erzählerstimme. Comics nur noch als echte Animation mit Lemo-Opuscar (wie Kalle) und eigenen
  Figurenstimmen, und erst nachdem der Nutzer das fertige Video gesehen und freigegeben hat – nie automatisch einplanen.
- **Fremdes Material:** Keine Clips, Trailer oder Screenshots aus Spielen/Filmen/Sendern und keine fremden Logos
  oder Figuren – nur eigene (Canva-)Bilder. Sonst Urheberrechts-Sperren.

## Serie „Woher kommt das?“ – Redewendungen (Wunsch des Nutzers 22.11.)

Redewendungs-Videos werden mit **Lemo-Opuscar im Stil „Paper Pop-up Book“** (`paper-popup`) gebaut – vom Nutzer gewählt.
Vorlage: `videos/019-lappen-popup` (Buch auf dem Tisch, Cover-Titel = Hook ab Bild 0, Szenen springen als Papierfiguren hoch,
Schild mit dem Spruch, am Ende Kanal-Logo + Schild „Wusstest du's?“). **Nicht** Holzschnitt (gefiel nicht), nicht three.js
selbst gebaut, nicht Canva. Je Folge neue Kulisse/Farbwelt und neue Figuren (Szenerie passend zur Herkunft).
- Stimme: Qwen3 Ryan, ganzer Text, Whisper-Wortzeiten → `tools/timeline.py` (Vorlage `videos/018-lappen/tools`).
- **Ton leise halten** (Wunsch des Nutzers: Geräusche waren „fast lauter als die Stimme“): Stimme klar vorn,
  Musik ×0,09 und Geräusche ×0,12 und zusätzlich unter der Stimme geduckt (Vorlage `mix.py` in 019).
- **Rendern dauert ~55 min pro Film** (Software-WebGL): Folgen am Vorabend bauen, 2 Folgen nie parallel mit anderen Renders.
- Vor dem Rendern Standbilder prüfen: Figuren laufen in Blickrichtung (Kopf vorn), nichts am Bildrand abgeschnitten
  (Schilder schmaler als das Bild, Logo nicht vom Schild verdeckt), keine Gegenstände vor der Kamera.

## Foto-Beiträge (Wunsch des Nutzers 22.11.)

TikTok schiebt Foto-Karussells extra an. Zusätzlich zu den Videos 1 Foto-Beitrag pro Tag (21:00):
Zahlen-Karten im Kanal-Look aus HTML (Vorlage `videos/017-fotos-gta-zahlen/bauen.js`, `node bauen.js` → `folie_N.png`),
Cover + 3–5 Fakten (je eine große Zahl) + Schluss-Karte mit Profilbild und Kommentar-Aufruf. Nur NEUE Fakten, die in
keinem Video vorkommen; Quelle klein auf jeder Karte. Metricool: `media` = alle PNG-URLs (raw GitHub), nur TikTok,
`autoAddMusic: true`, `photoCoverIndex: 0`. Vorher an die Vorschau-Sitzung schicken.

## Vorschau vor dem Veröffentlichen (Wunsch des Nutzers 21.11.)

Der Nutzer will JEDES Video vorher sehen – in einem eigenen Chat nur mit Videos: Sitzung **„🎬 Video-Vorschau“**
(`session_01VgMNm1Fr1oLaBCUgzn9svM`). Ablauf je Video, sobald es geprüft und gepusht ist:
1. `send_message` an diese Sitzung: „Neue Videos: videos/NNN-name/datei.mp4 – <Titel> – <Tag Uhrzeit>“ (mehrere in einer Nachricht).
   Die Vorschau-Sitzung schickt nur die Videos, sonst nichts. Im Haupt-Chat Videos NICHT zusätzlich mit SendUserFile schicken.
2. Videos so früh fertig machen, dass zwischen Vorschau und Termin **mindestens 2 h** liegen.
3. Antwort des Nutzers kommt als Nachricht der Vorschau-Sitzung zurück: „ok“ → nichts tun. „nein …“ → sofort in Metricool
   `draft: true` setzen (nicht veröffentlichen), Grund umsetzen, neu bauen, erneut zur Vorschau schicken.
   Ohne Antwort bleibt der Termin bestehen (autoPublish).

## Automatischer Tagesbetrieb

Ein Zeitplan schickt jeden Tag um **7:17 Uhr** den Auftrag „Tageslauf“ in den Chat, in dem das Projekt eingerichtet
wurde (dort sind Canva und Metricool verbunden). Ziel (Wunsch des Nutzers 20.11.): **mindestens 3 Videos pro Tag,
davon 2 GTA-Videos** (ab 21.11., weil GTA am besten läuft: 567 Aufrufe/18 Likes in 2 h), solange der GTA-6-Hype läuft.

1. `git pull`. **Vorgebaute Videos:** Liegen für heute schon Ordner/Termine vor (z. B. am Vorabend gebaut, in den
   Themenlisten mit „für <Datum> <Uhrzeit>“ markiert, oder in Metricool schon eingeplant), KEINE neuen Videos für diese
   Uhrzeiten bauen – stattdessen die vorgebauten fertigstellen (fehlende Bilder, Rendern, Prüfen, Vorschau, Einplanen).
2. **Themenwahl:** 2 Themen aus `gta_themen.md` (oberste offene) + 1 oberstes offenes Thema aus `themen.md`
   + 2 Redewendungen aus `sprichwoerter.md`.
   Sind in `gta_themen.md` weniger als 8 offen: per WebSearch aktuelle GTA-6-News/Fakten suchen und neue,
   belegbare GTA-Themen ergänzen (Story-Hintergründe, Rekorde, Karte, Fahrzeuge, Easter Eggs, Vergleich GTA 5,
   Reaktionen, Verkaufszahlen – nur belegte Zahlen). Regeln für fremdes Material gelten (keine Spielszenen/Logos/Figuren).
3. **Zeitplan (ab 23.11., Wunsch des Nutzers 22.11.):** 12:00 Fakten-Video, **14:00 Redewendung**, 16:00 GTA-Video,
   **17:30 Redewendung**, 19:00 GTA-Video, 21:00 Foto-Beitrag (Europe/Copenhagen). Redewendungen aus `sprichwoerter.md`
   (oberste offene, Serie „Woher kommt das?“, Herkunft vorher prüfen; umstrittene Herkunft ehrlich sagen).
   Sind dort weniger als 8 offen: neue, gut belegte Redewendungen recherchieren und ergänzen. Ist eine Zeit schon vorbei
   oder zu knapp, die nächste freie Lücke ≥ 2 h nach jetzt.
4. **Canva-Bilder sparsam:** max. **4 Bilder pro Video** (Bilder dürfen in 2 Szenen vorkommen). Canva hat
   „quota_cooldown“ (≈ 1 Bild / 45 min nach mehreren Bildern): Bilder einzeln anfordern, bei Cooldown mit
   `send_later` (45 min) weitermachen, erzeugte Media-IDs in `videos/NNN/canva_ids.txt` notieren. Reihenfolge:
   nach Termin (12, 14, 16, 17:30, 19). Redewendungen: 2–3 Bilder reichen (Gemälde-Look), gern Openverse (gemeinfreie Gemälde). Exporte max. 3 Bilder pro Design, Duplikate prüfen.
   Wird es für ein Video zu knapp, den Termin verschieben (nächste freie Lücke) – NICHT mit Bildern aus anderen Videos bauen.
5. **Metricool sperrt Beiträge kurz vor dem Termin** (ca. 15–20 min): Änderungen/Austausch spätestens 30 min vorher.
5. **Veröffentlichung immer automatisch:** `autoPublish: true`. Mit `false` landet das Video nur als Entwurf.
6. Themen abhaken (`- [x] Thema → videos/NNN-name (geplant …)`), committen, pushen.
7. Sind in `themen.md` weniger als 10 offene Themen: 20 neue, gut belegbare Themen ergänzen.
8. **Nur am 21.11.:** zusätzlich das Comic-Test-Video nach `comic_test.md` bauen (Termin 20:30).
9. Videos an die Vorschau-Sitzung schicken (siehe oben); im Haupt-Chat nur eine kurze Zusammenfassung: welche Videos, wann geplant, Auffälligkeiten.

## Technik

- rembg (Freistell-KI SAM, Modell lädt beim ersten Mal ~375 MB) und scipy installiert das Setup-Skript.
- edge-tts wird vom Setup-Skript der Umgebung installiert. Hinter dem Proxy liest `stimme.py`
  automatisch `/root/.ccr/ca-bundle.crt`.
- Playwright/Chromium und ffmpeg sind in der Cloud-Umgebung vorhanden.
- Rendern dauert etwa 2 Minuten pro Minute Video.
