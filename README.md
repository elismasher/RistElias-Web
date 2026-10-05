# rist.software

Vanilla HTML, CSS und native ES-Module. Canvas 2D zeichnet Sterne, Bahnen, Asteroidengürtel und Komet; DOM-Transforms positionieren die Körper. Keine Laufzeit-Abhängigkeiten, kein Framework, kein Pflicht-Build. Nur die optionalen Google Fonts werden extern geladen, mit System-Fallback.

## Lokal starten

Aus diesem Ordner:

```sh
npx serve .
```

Die ausgegebene lokale URL im Browser öffnen. Alternativ ohne npm:

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Beim Start aus dem Repository-Hauptordner liegt die neue Seite unter `/rist-software/`, das unveränderte Vergleichsoriginal unter `/rist-galaxy-mock.html`. Das bereits vorhandene Root-`index.html` wurde ebenfalls unverändert belassen.

Die modulare Seite braucht einen statischen HTTP-Server, weil Browser ES-Module über `file://` sperren. Für direktes Öffnen als Datei gibt es den optionalen Einzeldatei-Build unten.

## Aufbau

| Datei/Ordner | Aufgabe |
| --- | --- |
| `index.html` | Semantische Bühne, Header, Hero, Prolog, leere Panel-/Navigationscontainer, Outro |
| `css/tokens.css` | Farben, Schriften und Abstandstokens |
| `css/base.css` | Reset, Typografie, Fokus |
| `css/stage.css` | Körper, gemeinsamer Bild-/Hotspot-Drehcontainer, Labels, Karten |
| `css/chrome.css` | Header, Sprache, Sternenkarte |
| `css/overlays.css` | Hero, Prolog, App-Panels, Outro, Scrims |
| `css/motion.css` | Mobilansicht und ruhige Dokumentansicht |
| `js/config.js` | Körper in Reisereihenfolge, Assets, Fakten, Gewichtungen, Kamera-, Render- und UI-Parameter |
| `js/timeline.js` | Aus Gewichten berechnete Bereiche, Deep-Link-Anker und Galaxie-Lücken |
| `js/main.js` | Initialisierung, Events und einziger rAF-Loop |
| `js/scroll.js`, `camera.js`, `world.js` | Navigation/Glättung, log-Zoom/Projektion, Orbits/Tiefe/Eigenbewegung |
| `js/render/` | Canvas-Sternfeld, Gürtel mit Hover-Erkennung, DOM-Körper |
| `js/ui/` | Generierte Panels/Features, Hotspots, HUD/Erkundet-Status, Labels, Komet |
| `js/i18n.js`, `locales/` | Browser-Erkennung, gespeicherte Sprache, DE/EN für Inhalte und ARIA |
| `js/storage.js`, `math.js` | Fehlertoleranter Storage-Zugriff und gemeinsame Mathematik |
| `assets/img/` | Sieben extrahierte PNG/WebP-Dateien |
| `tools/` | Extraktion, optionaler Offline-Build, Timeline-Prüfung; jeweils Node ohne Abhängigkeiten |

Pro Frame: Scroll und Mausglättung → Timeline-Werte → Welt → Kamera → Sterne/Gürtel/Körper → Panels/HUD/Labels/Hotspots/Komet. Bei `prefers-reduced-motion` gibt es keinen laufenden Animationsloop: Die Hintergrundgalaxie steht still, Inhalte erscheinen im normalen Dokumentfluss, Hotspot-Texte als Feature-Listen. Eine Änderung der Systemeinstellung wird auch zur Laufzeit übernommen.

Planeten schaukeln standardmäßig; Bild und Hotspots drehen in `.body-inner` gemeinsam. Der Asteroid rotiert unabhängig vom angehaltenen Orbit. `motion.mode: 'none'` schaltet die Eigenbewegung aus.

## Neue App hinzufügen – in 5 Schritten

1. **Bild ablegen:** z. B. `assets/img/planet-meineapp.webp`. Ein quadratisches Bild mit transparentem Hintergrund entspricht dem vorhandenen Aufbau.
2. **Config-Eintrag ergänzen:** In `BODIES` vor dem abschließenden Asteroiden einen Planeten einfügen. Eine eindeutige ID verwenden; sie wird gleichzeitig Abschnitts-ID und Deep Link. Beispiel:

   ```js
   {
     id: 'meineapp', type: 'planet', layout: 'side',
     image: 'assets/img/planet-meineapp.webp',
     url: 'https://example.com', domain: 'example.com', accent: '#BBAAFF',
     orbit: { a: 540, period: 100, startAngle: 1 }, size: 150, focusScale: 1,
     motion: { mode: 'wobble', amplitude: 3, period: 10 },
     copy: {
       name: 'meineapp.name', hit: 'meineapp.hit', tag: 'meineapp.tag',
       body: 'meineapp.body', link: 'meineapp.link',
     },
     hotspots: [{ key: 'meineapp.feature', x: 50, y: 50 }],
     facts: ['status'],
   },
   ```

3. **Texte in beiden Locales ergänzen:** In `locales/de.js` und `locales/en.js` die fünf `copy`-Keys sowie `meineapp.feature.t` und `meineapp.feature.b` ergänzen. Fakten können bestehende IDs verwenden oder direkt `{ label: 'meineapp.fact.label', value: 'meineapp.fact.value' }` enthalten. Alle Textwerte sind einfache Strings; DOM-Inhalte werden mit `textContent` erzeugt.
4. **Im Browser prüfen:** `#meineapp` öffnen; Panel, Markierung, Feature-Liste, Sprachwechsel und Sternenkarte prüfen. Hotspot-Koordinaten sind Prozentwerte des Bildes. Kein HTML, CSS oder Timeline-Code muss geändert werden.
5. **Invarianten prüfen:** `node tools/check-timeline.mjs` ausführen und die Navigation zum Asteroiden testen. Bei Nutzung der Offline-Datei `node tools/build-single.mjs` erneut ausführen.

### Wie die Timeline mitwächst

Gewichte werden kumuliert und anschließend durch ihr Gesamtgewicht geteilt. Ein normaler Planet benötigt standardmäßig 80 Einheiten Anflug, 180 Halten, 60 Abflug und 20 Galaxie-Lücke. Die letzte Station bleibt ohne Abflug bis zum Ende. Panel-Fades und Deep-Link-Anker werden relativ daraus berechnet. Optional lässt sich die Dauer einer Station mit `timing: { rise, hold, fall, gap, anchorOffset }` in ihrem Config-Eintrag anpassen; für normale neue Apps ist das unnötig.

Die ursprünglichen drei Stationen ergeben 1000 Gewichtseinheiten und 1100 vh Track-Höhe. Ein zusätzlicher Planet ergibt 1340 Einheiten und 1474 vh. Bei allen Sprungankern sind Fokuswerte und sämtliche Overlays null; die Navigation verlässt zuerst die aktuelle Landung, springt innerhalb der freien Galaxie und fliegt erst dann zum Ziel. Dazwischenliegende Planeten werden übersprungen.

## Assets erneut extrahieren

Aus diesem Ordner:

```sh
node tools/extract-assets.mjs
# Oder einen anderen Pfad zum alten Mock übergeben:
node tools/extract-assets.mjs /pfad/rist-galaxy-mock.html
```

Das Skript ordnet Bilder über die umgebenden HTML-IDs bzw. die JS-Zuweisung `astImg.src` zu, schreibt sprechende Dateinamen und protokolliert Herkunft/Größe. Unbekannte, doppelte oder fehlende Zuordnungen brechen mit einer Fehlermeldung ab.

## Optionaler Einzeldatei-Build

```sh
node tools/build-single.mjs
```

Erzeugt `dist/index.html`: CSS inline, Bilder als Base64, JS in Abhängigkeitsreihenfolge mit isolierten Modul-Sichtbarkeiten. Die Datei funktioniert direkt über `file://`, auch offline; Google Fonts fallen ohne Netz auf Systemschriften zurück. Der kleine Bundler unterstützt die hier verwendeten relativen, statischen Imports und benannten/default Exports. Er ist kein allgemeiner npm-Bundler. Änderungen an Quellen werden erst nach erneutem Build in der Offline-Datei sichtbar. `dist/` ist generiert und wird nicht versioniert.

## Durchgeführte Prüfung

Chrome, Desktop 1440 × 900 und Mobilansicht 390 × 844, jeweils gegen das unveränderte Original:

- Hero, Prolog, SpotJar, PhaseParadise, Asteroid und Hotspot-Karte visuell verglichen; ursprüngliche Anker, Fades, Track-Höhe und Kameragrößen bleiben erhalten. Neu ist die gemeinsame Planeten-/Hotspot-Bewegung.
- DE/EN einschließlich aller generierten Panels, Fakten, Hotspot-Karten, Feature-Listen, Labels und ARIA; Browser-Erkennung sowie gespeicherte Sprache.
- Deep Links, Escape mit Fokus-Rückgabe aus Karten, Erkundet-Persistenz und direkte Navigation zum Asteroiden ohne sichtbare Zwischen-Panels.
- Reduced motion einschließlich Änderung zur Laufzeit; stillstehende Körper und lesbare Feature-Listen.
- Tatsächlicher temporärer Dummy-Eintrag in Config, beide Locales und eigenes Bild: vier Körper, zusätzlicher Abschnitt/Hotspot/HUD-Punkt, gültiger Deep Link und verlängerte Reise. Dummy anschließend vollständig entfernt.
- Einzeldatei über `file://` mit gesperrtem Netz: Bilder, Deep Link, Sprache und Hotspot-Karte funktionieren mit Font-Fallback.
- `node tools/check-timeline.mjs`: Original-Anker, komplette freie Lücken, überschneidungsfreie Landungen und Verlängerung um 1/3/10 Apps.
- Keine JavaScript- oder Konsolenfehler in den Interaktionstests der modularen Seite; Syntax und alle konfigurierten DE/EN-Keys geprüft. Im kurzen Chrome-Test mit vierfacher CPU-Drosselung lag das 95. Perzentil der Frame-Abstände bei 16,7 ms. Das ist eine Simulation, keine Messung auf einem bestimmten Mittelklasse-Laptop.

Die schmale Mobilansicht übernimmt bewusst auch den langen, im Original abgeschnittenen PhaseParadise-Titel; in der reduzierten Dokumentansicht erzeugt er den gleichen horizontalen Überlauf wie im Mock. Die Migration verändert diesen bestehenden Satzspiegel nicht.

## Offene TODOs

- Echte Screenshots statt der gestrichelten Rahmen einsetzen.
- Echte App-Icons statt der Planetenbilder einsetzen.
- E-Mail-Adresse für „Projekt anfragen“ ergänzen (`CONTENT.contact` ist weiterhin `mailto:`).
- PhaseParadise-Texte gegen phaseparadise.app prüfen.
