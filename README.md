# Lilliomház Tudástár

Szakács és cukrász szakirányú oktatási web, külön munkatársi szerkesztővel.

Részletes indítás, jogosultságok, Facebook-beállítás és Render-korlátok: [UZEMELTETES.md](UZEMELTETES.md).

```sh
npm ci
npm run check
npm test
```

A Node indításához DATABASE_URL szükséges. Titkok ne kerüljenek a repóba. A korábbi statikus oldal megmarad; a teljes CMS külön Node szolgáltatás és Postgres indítását igényli. A Blueprint alapértelmezetten ingyenes, 30 napos próbaadatbázist használ; ez nem tartós éles üzem.
