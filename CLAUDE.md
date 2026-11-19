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
- Look: erwachsen, nicht kindlich. Profilbild `kanal/profilbild.png` (Neon-Krake, deren Arme ein Fragezeichen
  bilden). Canva-Stil für alle Szenen: „modern dark cinematic illustration, deep navy background, glowing neon
  cyan and magenta accents, sleek, premium, slightly realistic, not childish, no text“. Wenn es passt, taucht die
  Neon-Krake als wiederkehrendes Markenzeichen auf (z. B. in der Schluss-Szene).
- Schluss-Szene: gesprochen immer **„Wusstest du das? Dann folg für mehr!“** – nie „Wusstest-du's“ in den
  Sprechtext schreiben, das spricht die Stimme falsch aus. Als Überschrift (kopf) darf „Wusstest du's?“ stehen.
- Metricool: Marke `blogId 8000715` (Zeitzone Europe/Copenhagen). Darin sind TikTok „Wusstest du's?“
  und Instagram `wunsch_fabrik_dk` verbunden. **Immer nur `providers: [{"network":"tiktok"}]`** –
  Instagram `wunsch_fabrik_dk` ist das Geschäftskonto und bekommt nie diese Videos.
- Stimme: ElevenLabs (Schlüssel ist als Netzwerk-Geheimnis der Umgebung hinterlegt, Gratis-Tarif, Guthaben ab 28. Nov. wieder voll); ist es leer, nimmt `stimme.py` automatisch `de-DE-ConradNeural` (edge-tts).

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

- edge-tts wird vom Setup-Skript der Umgebung installiert. Hinter dem Proxy liest `stimme.py`
  automatisch `/root/.ccr/ca-bundle.crt`.
- Playwright/Chromium und ffmpeg sind in der Cloud-Umgebung vorhanden.
- Rendern dauert etwa 2 Minuten pro Minute Video.
