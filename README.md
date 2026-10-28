# Personalwesen 2026

Mobile Kursseite mit allen 12 Unterrichtstagen. Pro Tag gibt es Präsentation (PDF), Skript (PDF), Video, Tagesquiz und den freiwilligen Nachmittag mit zwei Übungsquizzen und zwei Aufgabenbögen samt Lösung.

## Video eintragen

In `data/videos.json` steht für jeden Tag ein leerer Eintrag. Dort einfach einen YouTube-Link oder den Pfad zu einer MP4-Datei eintragen, zum Beispiel

```json
"1": "https://youtu.be/XXXXXXXXXXX",
"2": "files/tag02/video.mp4"
```

Solange der Eintrag leer ist, zeigt die Seite den Platzhalter "Video folgt".

## GitHub Pages

Settings, Pages, Source "Deploy from a branch", Branch `main`, Ordner `/ (root)`.
