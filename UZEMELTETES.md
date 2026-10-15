# Lilliomház Tudástár – üzemeltetés és átadás

## Mi készült el?

- A korábbi cukrászoldalra épülő, magyar oktatási web; az új nyilvános név **Lilliomház Tudástár**.
- Egyenrangú szakács és cukrász rész. Mindkettő alatt lenyitható **10. évfolyam – Kezdők** és **11. évfolyam – Végzősök** fül. A helyi évfolyambontás nem állítás a technikumi képzések általános hosszáról.
- Technikusi érdeklődési tájékoztató, szakmai galéria, vizsgafelkészülési témák, böngészőn megmaradó saját ellenőrzőlista és nyomtatás.
- Cukiságok külön rész, régi cukrászképekkel. Megmaradt a korábbi web telefonszáma és címe; ezek a szerkesztőben átírhatók.
- Az oktatók nevét, portréját és személyes adatait a felhasználó kérésére nem tesszük ki. Nincsenek kitalált képesítések, intézményi akkreditációk vagy tanulói vélemények.
- 73 galériakép: 58 új JPG és 15 korábbi WEBP. Az eredetiek változatlanok, a képek lustán töltődnek be. Az `a87bdd3d-082e-4d01-b051-f73ca97479c4.jpg` feltöltése sikertelen volt, ez a kép nincs benne. A fotókat nem soroltuk be találomra évfolyamokhoz.
- Külön `/szerkeszto/` munkatársi felület, e-mail-címhez kötött egyszeri meghívókkal; csak a tulajdonos hívhat meg és tilthat le szerkesztőt. A meghívólinket a tulajdonos továbbítja: nincs automatikus e-mail-küldés.
- Egyszerű szövegmezők, képkiválasztás, többképes feltöltés, galériabesorolás, sorrend, piszkozat, előnézet, közzététel, korábbi tartalom visszaállítása, audit és mentés.
- Az érdeklődési űrlap ténylegesen az adatbázisba ment. A szerkesztők a beérkezett megkeresésekből saját e-mail-programjukkal válaszolhatnak. Az üzeneteket 90 nap után törli a rendszer.

## Fontos: statikus oldal és szerkeszthető web

A meglévő `liliomhaz-cukisagok` Render-szolgáltatás statikus. Az új megjelenést saját háttérrendszer nélkül is meg tudja mutatni, de az űrlap ekkor őszintén kikapcsolt állapotot jelez. A bejelentkezés és a feltöltés csak a **Node web service** és a **PostgreSQL** bekapcsolása után működik. A statikus Render-szolgáltatás runtime-ja nem alakítható át Node-dá, ezért a Blueprint új `lilliomhaz-tudastar` szolgáltatást hoz létre, a régit megőrzi.

Az új szolgáltatás pontos URL-jét a Render adja meg. A web, az API és a szerkesztő ugyanazon az új eredeten működik. A régi statikus címet csak az új telepítés sikeres ellenőrzése után érdemes átirányítani; a repó nem talál ki garantáltnak állított új URL-t.

## Render-indítás

1. A forrás és a `render.yaml` kerüljön a GitHub `main` ágára.
2. Render → **New → Blueprint**, válaszd a `matekevin200-oss/liliomhaz-cukisagok-web` repót és a `render.yaml` fájlt. A terv új Node webet és külön Postgres-adatbázist kapcsol össze. A régi oldalt nem törli.
3. Az alapértelmezés minden új erőforrásnál ingyenes. **A Free Postgres 30 nap után lejár; tartós intézményi működéshez a tulajdonosnak fizetős adatbázisra kell váltania.** A Free web 15 perc tétlenség után leállhat, az első megnyitása ezért lassabb lehet. Fizetős csomag nincs automatikusan megrendelve.
4. Sikeres indítás után `/health` legyen 200, az oldal és az `/api/public` töltsön be, `/szerkeszto/` mutassa a belépést. A `DATABASE_URL`-t a Blueprint titkosan kapcsolja össze; ne tedd GitHubra vagy chatbe.
5. A Node service **Environment** részén a Render által generált `BOOTSTRAP_TOKEN` értéket csak a tulajdonos olvassa ki. `/szerkeszto/` → **Első tulajdonosi belépés**. Add meg saját e-mail-címed, belső megjelenített neved, legalább 12 karakteres egyedi jelszavad és a kódot. A rendszer ezt csak egyszer engedi. Utána a `BOOTSTRAP_TOKEN` eltávolítható. Újraindítás nem nullázza a fiókot vagy a tartalmat.
6. Szerkesztők és meghívók → e-mail-cím → Meghívó készítése → Másolás. A link 7 napig, egyszer és csak a megadott e-mail-címmel használható. Letiltáskor a már létező munkamenetek is megszűnnek.

## Facebook

A már megadott oldal: `https://www.facebook.com/lilomhaz.cukisagok`.

A hírfolyam látogatói hozzájárulással, a betöltőgomb megnyomása után jelenik meg. Ha a Facebook beágyazása böngésző- vagy oldalbeállítás miatt nem jeleníthető meg, a közvetlen oldallink továbbra is használható.

Az **automatikus fotóátvétel** kódja elkészült, de Meta-oldalhozzáférés nélkül nem állítjuk be működőnek. Az oldal adminisztrátora adja meg a megfelelő engedélyű Page access tokent és az aktuálisan támogatott Graph API-verziót. A Node szolgáltatáson szükséges titkos környezeti változók:

```
FB_PAGE_ID=<numerikus oldalazonosító>
FB_PAGE_ACCESS_TOKEN=<oldalhozzáférési token>
FB_GRAPH_VERSION=<például a Meta által aktuálisan támogatott vNN.N>
```

Token ne kerüljön a GitHubra, nyilvános JavaScriptbe vagy a kapcsolat szövegmezőibe. A szerver 15 percenként ellenőriz az aktív működése alatt, valamint a tulajdonos külön is indíthat frissítést. Ingyenes, alvó Render-szolgáltatásnál nincs garantált 15 perces menetrend. Az első kör a legutóbbi 40 feltöltött fotót veszi át, a további körök az újakat; visszamenőleges teljes Facebook-archívumimport nincs. A Facebookon később törölt fotót a helyi galéria nem törli automatikusan: a szerkesztő tudja elrejteni. Az új importált fotók közös besorolással jelennek meg; szakma és évfolyam utólag állítható.

## Biztonság és adatmegőrzés

- Jelszavak: egyedi só és aszinkron scrypt; nincs alapértelmezett jelszó, nyilvános regisztráció vagy kiadott közös adminjelszó.
- Munkamenet: csak hash a Postgresben, 8 órás lejárat, HttpOnly/SameSite=Strict és HTTPS-en Secure süti; írásnál eredet- és CSRF-ellenőrzés.
- A szövegeket a felület HTML-ként nem futtatja. A képfeltöltés JPG/PNG/WebP aláírást és 8 MB-os korlátot ellenőriz; SVG nem tölthető fel.
- A feltöltött képek binárisan Postgresben maradnak, nem a Render újraindításkor elvesző fájlrendszerében. A piszkozatgaléria nincs nyilvánosan kilistázva. Korábban közzétett vagy GitHubon nyilvános képet az elrejtés nem hív vissza mások letöltéseiből.
- Elavult tartalomverzió mentése 409 hibát ad, hogy más szerkesztő friss módosításai ne vesszenek el. A fő tartalmi publikálás tranzakcióval történik.
- A galéria megjelenési jelölése külön művelet és azonnal változtatja a nyilvános galériát; ezt a szerkesztő is jelzi.
- Rendszeres adatbázismentés szükséges. A szerkesztő exportja tartalmat, képeket és tartalmi előzményeket tartalmaz; nem tartalmaz fiókokat vagy érdeklődői adatokat, és nem helyettesíti a teljes Postgres-mentést.
- A tulajdonosi jelszó visszaállítását a Render/Postgres hozzáféréssel rendelkező üzemeltető végezheti: új scrypt-hash készítése a `lib/security.js` `hashPassword()` függvényével, az adott tulajdonos `lh_users.password` mezőjének frissítése és az ő `lh_sessions` rekordjainak törlése. Ezt soha ne nyilvános webvégponton keresztül végezd.

## Ellenőrzések

`npm ci`, `npm run check`, `npm test`. A tesztek helyi, valódi PostgreSQL-motort használó PGlite-on ellenőrzik a teljes CMS-munkafolyamatot. Az ideiglenes HTTP-kiszolgáló csak az automatikus API-tesztekben fut. Böngészős vizuális ellenőrzés ebben a környezetben nem történt; élő Meta-szinkron csak az oldal adminisztrátori hozzáférése után ellenőrizhető.
