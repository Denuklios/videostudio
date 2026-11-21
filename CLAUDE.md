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
- Schluss-Szene: gesprochen immer **„Wusstest du das? Schreib's in die Kommentare und folg für mehr!“** (Wunsch des Nutzers 20.11.) – nie „Wusstest-du's“ in den
  Sprechtext schreiben, das spricht die Stimme falsch aus. Als Überschrift (kopf) darf „Wusstest du's?“ stehen.
- Metricool: Marke `blogId 8000715` (Zeitzone Europe/Copenhagen). Darin sind TikTok „Wusstest du's?“
  und Instagram `wunsch_fabrik_dk` verbunden. **Immer nur `providers: [{"network":"tiktok"}]`** –
  Instagram `wunsch_fabrik_dk` ist das Geschäftskonto und bekommt nie diese Videos.
- Stimme: immer **`de-DE-KillianNeural`** (edge-tts, kostenlos) – Standard in `stimme.py`, im Projekt nichts angeben.
  Kein `stimme`/`anbieter` überschreiben. (Später evtl. Gemini-Stimme, wenn der Nutzer es sagt. ElevenLabs nur auf
  ausdrücklichen Wunsch mit `"anbieter": "elevenlabs"`.)
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
  - Kamerafahrten, wechselnde Übergänge, Soundeffekte (Wusch, Klick, Pling, Bass) macht die Engine automatisch.
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
  (z. B. Kalle) mit echter Animation. Offen: ffmpeg 7+ fehlt (hier 6.x) – betrifft nur die Ton-Längenprüfung in `mux.sh`.
- **Fremdes Material:** Keine Clips, Trailer oder Screenshots aus Spielen/Filmen/Sendern und keine fremden Logos
  oder Figuren – nur eigene (Canva-)Bilder. Sonst Urheberrechts-Sperren.

## Automatischer Tagesbetrieb

Ein Zeitplan schickt jeden Tag um **7:17 Uhr** den Auftrag „Tageslauf“ in den Chat, in dem das Projekt eingerichtet
wurde (dort sind Canva und Metricool verbunden). Ziel (Wunsch des Nutzers 20.11.): **mindestens 3 Videos pro Tag,
davon 2 GTA-Videos** (ab 21.11., weil GTA am besten läuft: 567 Aufrufe/18 Likes in 2 h), solange der GTA-6-Hype läuft.

1. `git pull`.
2. **Themenwahl:** 2 Themen aus `gta_themen.md` (oberste offene) + 1 oberstes offenes Thema aus `themen.md`.
   Sind in `gta_themen.md` weniger als 8 offen: per WebSearch aktuelle GTA-6-News/Fakten suchen und neue,
   belegbare GTA-Themen ergänzen (Story-Hintergründe, Rekorde, Karte, Fahrzeuge, Easter Eggs, Vergleich GTA 5,
   Reaktionen, Verkaufszahlen – nur belegte Zahlen). Regeln für fremdes Material gelten (keine Spielszenen/Logos/Figuren).
3. **Zeitplan:** 12:00 Fakten-Video, 16:00 und 19:00 GTA-Videos (Europe/Copenhagen). Ist eine Zeit schon vorbei
   oder zu knapp, die nächste freie Lücke ≥ 2 h nach jetzt.
4. **Canva-Bilder sparsam:** max. **4 Bilder pro Video** (Bilder dürfen in 2 Szenen vorkommen). Canva hat
   „quota_cooldown“ (≈ 1 Bild / 45 min nach mehreren Bildern): Bilder einzeln anfordern, bei Cooldown mit
   `send_later` (45 min) weitermachen, erzeugte Media-IDs in `videos/NNN/canva_ids.txt` notieren. Reihenfolge:
   zuerst alle Bilder fürs 12-Uhr-Video, dann 16, dann 19. Exporte max. 3 Bilder pro Design, Duplikate prüfen.
   Wird es für ein Video zu knapp, den Termin verschieben (nächste freie Lücke) – NICHT mit Bildern aus anderen Videos bauen.
5. **Metricool sperrt Beiträge kurz vor dem Termin** (ca. 15–20 min): Änderungen/Austausch spätestens 30 min vorher.
5. **Veröffentlichung immer automatisch:** `autoPublish: true`. Mit `false` landet das Video nur als Entwurf.
6. Themen abhaken (`- [x] Thema → videos/NNN-name (geplant …)`), committen, pushen.
7. Sind in `themen.md` weniger als 10 offene Themen: 20 neue, gut belegbare Themen ergänzen.
8. **Nur am 21.11.:** zusätzlich das Comic-Test-Video nach `comic_test.md` bauen (Termin 20:30).
9. Kurze Zusammenfassung an den Nutzer: welche Videos, wann geplant, Auffälligkeiten.

## Technik

- rembg (Freistell-KI SAM, Modell lädt beim ersten Mal ~375 MB) und scipy installiert das Setup-Skript.
- edge-tts wird vom Setup-Skript der Umgebung installiert. Hinter dem Proxy liest `stimme.py`
  automatisch `/root/.ccr/ca-bundle.crt`.
- Playwright/Chromium und ffmpeg sind in der Cloud-Umgebung vorhanden.
- Rendern dauert etwa 2 Minuten pro Minute Video.
