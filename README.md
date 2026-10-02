# Liliomház Cukiságok – Render weboldal

Nyilvános, reszponzív, statikus bemutatkozó weboldal. Nem kér bejelentkezést, és a Render globális CDN-jéről szolgálható ki.

## Render telepítés

1. Hozz létre egy új GitHub tárolót, például `liliomhaz-cukisagok-web` néven.
2. Töltsd fel a projekt **tartalmát** a tároló gyökerébe. A `render.yaml` maradjon legfelül.
3. A Render Dashboardon válaszd: **New → Blueprint**.
4. Kapcsold össze a GitHub-tárolót, majd válaszd az **Apply** lehetőséget.
5. A telepítés után a Render egy nyilvános `onrender.com` címet ad.

A projekt statikus webhely, ezért nincs szüksége környezeti változóra, adatbázisra vagy külön futó szerverre.

## Közvetlen Static Site beállítás

Blueprint nélkül is telepíthető:

- Build Command: `echo "Liliomház weboldal kész"`
- Publish Directory: `public`
- Branch: `main`

## Tartalom szerkesztése

- Oldal szövege: `public/index.html`
- Megjelenés: `public/styles.css`
- Interakciók: `public/script.js`
- Fotók: `public/images/`
