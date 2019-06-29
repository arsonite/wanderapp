# WanderApp

Quellcode der **React Applikation**, zum aufnehmen, ablaufen & verwalten von Routen. Die Applikation läuft auf einem **nginx Server**, das Backend ist in **Node** geschrieben und als Datenbank wird **Mongodb** verwendet.

---

## yarn verwenden!

`npm install -g yarn`

https://yarnpkg.com/en/docs/getting-started

## Setup

1. Projekt clonen

   `git clone https://gitlab.beuth-hochschule.de/s67264/wanderapp.git`

2. In das Arbeitsverzeichnis wechseln

   `cd wanderapp`

3. Node Modules installieren

   `yarn install`

4. Development Server starten

   `yarn start`

### API umstellen

Standardmäßig wird bei der React Applikation die Online API verwendet. Der Pfad zu API befindet sich in `wanderapp/src/config.json`. Um eine andere API zuverwenden muss der _Wert_ des **Schlüssels** `apiUrl: [pfad zur api]` verändert werden.

## Projektbeschreibung:

Die Wander-App wird für die Nutzung von Viel- und Gelegenheits-Wanderern konzipiert. Sie sollte im wesentliche zwei Core-Features haben. Zum ersten können Wanderer ihre eigenen Routen aufnehmen, diese mit Informationen und Schlagwörtern (Tags) versehen und (optional) hochladen, sodass diese anderen Nutzern der App angezeigt werden. Jeder Nutzer kann wiederum seine eigenen gespeicherten Wanderrouten verwalten und auswählen, um sie erneut (ab) zu wandern. Zum zweiten können Wanderer die bereits hochgeladenen Wanderrouten anderer Nutzer entdecken. Dafür werden verschiedene Filter- und Suchmechanismen implementiert. Die gefundenen Wanderrouten werden dann auf einer Online-Karte angezeigt. Beim Wandern soll es auch möglich sein, Fotos aufzunehmen und an den Aufnahmeort auf der Route anzuhängen, so dass andere Nutzer auch einen Eindruck von der Natur/Sehenswürdigkeiten etc. bekommen.

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
