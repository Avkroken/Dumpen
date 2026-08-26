# Publiceringsflöde

`submissions` är granskningskö. `published_terms` är enda publika källa.

## Livscykel

1. Ett publikt förslag skapas som `pending` i `submissions`.
2. Admin färdigställer term, rättsområde, allmänspråklig betydelse, båda källorna, institutionell användning och skillnaden.
3. Godkännande skapar en rad i `published_terms` och markerar förslaget `approved` i samma D1-batch.
4. Publicerade termer kan redigeras och arkiveras i `/admin.html` utan direkt SQL.
5. Arkiverade termer finns kvar i databasen men returneras inte av `GET /api/terms`.

Äldre `approved`-förslag utan motsvarande `published_terms` återförs till granskningskön av migration `0006_requeue_legacy_approved.sql`. De publiceras inte förrän de uppfyller den nya källmodellen.
