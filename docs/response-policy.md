# Response-policy

`src/index.js` är en tunn entrypoint framför `src/worker.js`. Den ändrar inte routing eller affärslogik utan applicerar gemensamma HTTP-headers på alla svar.

Adminytan (`/admin.html`) och alla `/api/admin/*`-svar får dessutom `Cache-Control: no-store` och `Pragma: no-cache` så administrativt innehåll och fel-/skrivsvar inte lagras av klient- eller mellanliggande cache.

Den gemensamma policyn innehåller CSP, HSTS, MIME-sniffningsskydd, frame-skydd, referrer-policy, permissions-policy samt cross-origin-policy. CSP tillåter fortfarande inline CSS/JavaScript eftersom nuvarande statiska sidor använder inline-kod; detta kan skärpas när dessa resurser flyttas till separata filer.
