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
- Schluss-Szene: gesprochen immer **„Wusstest du das? Dann folg für mehr!“** – nie „Wusstest-du's“ in den
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

- **Hashtags:** 4–6 passende, spezifische Hashtags (Thema + `#wusstestdu` + `#fakten`). Kein `#fyp`/`#foryou`.
- **Fremdes Material:** Keine Clips, Trailer oder Screenshots aus Spielen/Filmen/Sendern und keine fremden Logos
  oder Figuren – nur eigene (Canva-)Bilder. Sonst Urheberrechts-Sperren.

## Automatischer Tagesbetrieb

Ein Zeitplan schickt jeden Tag um 9:17 Uhr den Auftrag „Tageslauf“ in den Chat, in dem das Projekt eingerichtet wurde (dort sind Canva und Metricool verbunden). Dann:

1. Repository holen, falls nicht da (siehe Auftrag), `git pull`.
2. Die **zwei obersten offenen Themen** aus `themen.md` nehmen und für jedes den ganzen Ablauf oben durchziehen.
   Ein Thema, dessen Fakten sich nicht belegen lassen, wird mit Begründung nach „Erledigt“ verschoben
   (`- [~] … übersprungen: Grund`) und das nächste genommen.
3. Veröffentlichung über Metricool, nur TikTok, Uhrzeiten **12:00 und 19:00** Europe/Copenhagen am selben Tag
   (ist 12:00 schon vorbei, das erste Video 2 Stunden nach jetzt).
4. **Veröffentlichung immer automatisch:** `autoPublish: true` (Wunsch des Nutzers seit 19.11.2026).
   Mit `autoPublish: false` landet das Video nur als Entwurf im TikTok-Posteingang und bleibt liegen.
5. Themen abhaken (`- [x] Thema → videos/NNN-name (geplant …)`), nach „Erledigt“ verschieben, committen, pushen.
6. Sind weniger als 10 offene Themen übrig: 20 neue, gut belegbare Themen-Ideen ergänzen (Mischung aus Tiere,
   Körper, Weltall, Geschichte, Alltagsirrtümer). Wenn Metricool-Analysen zeigen, was gut läuft, mehr davon.
7. Zum Schluss eine kurze Zusammenfassung: welche Videos, wann geplant, Auffälligkeiten.

## Technik

- rembg (Freistell-KI SAM, Modell lädt beim ersten Mal ~375 MB) und scipy installiert das Setup-Skript.
- edge-tts wird vom Setup-Skript der Umgebung installiert. Hinter dem Proxy liest `stimme.py`
  automatisch `/root/.ccr/ca-bundle.crt`.
- Playwright/Chromium und ffmpeg sind in der Cloud-Umgebung vorhanden.
- Rendern dauert etwa 2 Minuten pro Minute Video.
