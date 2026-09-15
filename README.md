# ZSS Media Hosting

Öffentliche Ablage für zwei Zwecke:

1. **`bilder/`** – fertige Post-Bilder für SOCIALMEDIA Susi (Composio-Connector braucht eine öffentlich erreichbare Bild-URL, keine lokale Datei).
2. **`dokumente/`** – HTML-Dokumente für Kunden, als Workaround für das Outlook-Problem mit HTML-Anhängen. Statt die Datei zu verschicken, schickst du einen Link.

Alles liegt in einem öffentlichen GitHub-Repo, veröffentlicht über **GitHub Pages** (kostenlos, keine Zahlungsdaten nötig).

## Einmalige Einrichtung (durch Mathias, ca. 10 Minuten)

### 1. GitHub-Account anlegen
1. https://github.com/signup öffnen
2. E-Mail, Passwort, Benutzername wählen (z.B. `zieglerschallschutz` oder deinen eigenen)
3. E-Mail bestätigen

### 2. Neues Repository anlegen
1. Oben rechts auf **+** → **New repository**
2. Name: `zss-media`
3. **Public** auswählen (Pages funktioniert bei privaten Repos nur mit kostenpflichtigem Plan)
4. Kein README/gitignore hinzufügen (haben wir schon lokal) → **Create repository**

### 3. Lokalen Ordner mit dem Repo verbinden
In diesem Ordner (`CoWork\ZSS-MEDIA-HOSTING`) ein Terminal öffnen und:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<DEIN-BENUTZERNAME>/zss-media.git
git push -u origin main
```

Beim `push` fragt GitHub nach Anmeldedaten. Am einfachsten: **Personal Access Token** statt Passwort verwenden (GitHub → Settings → Developer settings → Personal access tokens → Generate new token, Scope `repo` reicht) oder GitHub Desktop installieren und dort einloggen.

### 4. GitHub Pages aktivieren
1. Im Repo → **Settings** → **Pages** (linkes Menü)
2. Unter „Build and deployment" → Source: **Deploy from a branch**
3. Branch: `main`, Ordner: `/ (root)` → **Save**
4. Nach 1–2 Minuten ist die Seite live unter:
   `https://<DEIN-BENUTZERNAME>.github.io/zss-media/`

## Laufende Nutzung

- Neue Datei in `bilder/` oder `dokumente/` legen
- Im Ordner: `git add . && git commit -m "neue Datei" && git push`
- Datei ist erreichbar unter `https://<DEIN-BENUTZERNAME>.github.io/zss-media/bilder/dateiname.jpg` bzw. `.../dokumente/dateiname.html`
- Diesen Link kannst du direkt an Kunden schicken oder Susi als Bildquelle geben

Sobald der Account und das Repo stehen, kann ich (Claude) das Pushen für dich übernehmen — du musst dann nur noch einmalig den Account/Token einrichten.
