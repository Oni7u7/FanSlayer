# FanSlayer

Juego web donde compras artistas como NFT en Monad Testnet y peleas contra zombis con ellos.

| Carpeta | Qué hay |
| --- | --- |
| [`frontend/`](frontend) | React + Vite + Privy. Se despliega en Vercel con Root Directory `frontend`. |
| [`contracts/`](contracts) | Contrato `FanSlayerArtists` (ERC-721) con Foundry. |

## Empezar

```shell
git clone --recurse-submodules https://github.com/Oni7u7/fanslayer.git
cd fanslayer/frontend && cp .env.example .env   # llena los valores
npm install && npm run dev
```

Contratos:

```shell
cd contracts && forge test
```

El `.env` nunca se sube: está en `.gitignore`. En Vercel las variables se configuran en el dashboard del proyecto.

## FIX_NOTES

### v6: brutalism + cybercore oscuro (noviembre 2026)

- **Cambios ajenos a medias en el working tree (otra vez):** había un rediseño "cyberpunk" sin commit (Orbitron/Exo 2, `src/game/rules.js`, `design-system/fanslayer-cyberpunk`). No había otra sesión corriendo: todo apunta a que bifurcar o rebobinar una conversación en la app restaura archivos. Se respaldó en `git stash` ("cambios sin commit 19:30") y se partió de `main`.
- **Ficha técnica pegada al borde:** el reset `.lp dl { margin: 0 }` le ganaba al centrado de `.lp-wrap`; ahora el contenedor siempre se centra.
- **Enlace del contrato de 29 px de alto:** sube a 44 px de área táctil.
- **Acento invisible en modo claro:** el borde dorado de la tarjeta equipada y la barra de la pestaña quedaban a ~1.5:1 sobre el fondo claro. Nuevo token `--accent-line` (dorado oscuro en claro).
- **Probar en claro o en inglés:** como el oscuro es el valor por defecto, se agregaron `?theme=light|dark` y `?lang=es|en` en la URL (sirven también para compartir un enlace en inglés).
- **Fuente sin uso:** se quitó Chakra Petch.

### v5: cybercore limpio en toda la app (noviembre 2026)

- **Dos diseños distintos en un mismo sitio:** la landing ya era cybercore claro, pero el menú y el Workshop seguían con el estilo arcade v3 (VT323, dorado, rosa, sombras duras). Ahora hay un solo sistema de tokens (`styles/tokens.css`) y la landing toma sus colores de ahí.
- **Animaciones que no se pidieron:** las pantallas con sesión tenían el fondo animado de túnel pixel y Motion en tarjetas, pestañas, toasts y transiciones. Se quitaron `src/ambient/` y la dependencia `motion`; los estados cambian al instante. El juego conserva su propio movimiento.
- **ES/EN y tema solo en la landing:** el menú, el Workshop, los avisos del mint y los textos del juego (HUD, Game Over, ayuda) estaban solo en español y sin botones de idioma o tema. Todos los textos viven ahora en `src/i18n.js` y el mismo selector (`PrefsControls`) está en la landing y en la app.
- **Botones ES/EN de 42 px:** el borde del grupo sumaba altura; ahora es un borde interior y miden 44 px.
- **Listas desplazadas:** `ul` conservaba el padding del navegador (40 px).
- **Barra de "Jugar" a 320 px:** la etiqueta se partía y el nombre quedaba debajo del botón; ahora se recorta con puntos suspensivos y el retrato se oculta en pantallas angostas.
- **Fuente sin uso:** se quitó `@fontsource/vt323`.
- **Rollback a medias en el working tree:** antes de empezar había cambios sin commit que regresaban `src/` a una versión vieja. Quedaron respaldados en `git stash` ("rollback sin commit 18:52") y se partió de lo que estaba en `main`.

### v4: landing minimal cybercore (noviembre 2026)

- **Contenido invisible sin scroll:** las secciones de la landing nacían con `opacity: 0` y solo aparecían al hacer scroll; sin JavaScript, en capturas o en algunos bots se veía una página vacía bajo el hero. La landing nueva no oculta nada.
- **Modo claro sin control:** el tema dependía solo del sistema operativo. Ahora hay botón claro/oscuro que se guarda (`fanslayer:theme`) y se aplica antes de pintar (script inline en `index.html`), así no parpadea. Los tokens de la app también siguen la elección (`:root[data-theme='light']`).
- **Solo español:** se agregó ES/EN en la landing; el idioma se guarda (`fanslayer:lang`), cambia `<html lang>` y la primera visita toma el idioma del navegador.
- **Diálogo de Privy siempre oscuro:** ahora sigue el tema elegido.
- **Dependencia sin uso:** `lenis` (scroll suave) se quitó junto con sus estilos.

### v3: arcade mínimo (noviembre 2026)

- **Fondo pesado y cansado:** la escena de three.js (constelación, bola de disco, aurora y haces) distraía y pesaba 129 KB gzip extra. Se reemplazó por dos canvas de baja resolución sin dependencias, y se quitó `three`.
- **Demasiada información en la landing:** se quitaron la marquesina, el paneo horizontal de mecánicas, la línea de pasos y la captura del juego. Quedan hero, tres pasos de una línea, artistas y cierre.
- **Contraste en modo claro:** el eyebrow dorado no llegaba a 4.5:1 sobre fondo claro; ahora usa el dorado oscuro.

### v2: rediseño con three.js

Cambios del rediseño (noviembre 2026) que corrigen problemas, no solo estética:

- **Botones rojos globales:** `App.css` aplicaba `button { background: red }` a todo, incluidos los diálogos de Privy. Ahora cada botón usa el componente `Button` con tokens.
- **Estilos del juego mezclados con la app:** el CSS del Stage y su HUD vivía en `App.css`. Se movió a `src/stage.css`, que solo carga el juego.
- **Mensajes con emojis y sin cierre:** el Workshop mostraba "✅/❌" en texto plano. Ahora hay toasts con estado (cargando, éxito, error) y errores legibles (wallet rechazada, sin fondos).
- **Estados faltantes:** el menú y el Workshop no tenían skeleton, vacío ni error con reintentar. Ahora sí, incluido el precio del contrato.
- **Texto menor a 12 px y áreas táctiles chicas:** botones, teclas y logo suben a 12 px y 44 px.
- **Scroll horizontal a 320 px:** el botón de la barra se queda solo con ícono en pantallas angostas.
- **Vista previa en redes:** `og:image` era una ruta relativa; ahora son URLs absolutas, con canonical, manifest, robots, sitemap e íconos propios.
- **Lockfile:** las dependencias nuevas se instalaron con `legacy-peer-deps` (ver `frontend/.npmrc`) para no reorganizar el árbol de Privy.

## DESIGN_NOTES

### v6: brutalism + cybercore (actual)

- **Pedido:** estilo brutalism con cybercore, sin animaciones de fondo, más contenido en la landing, bordes muy leves y colores oscuros.
- **De `--design-system` (UI/UX Pro Max):** estilo Brutalism, patrón Feature-Rich Showcase, efectos "esquinas a 0, tipografía en negrita, grilla visible, bloques grandes" y el anti-patrón "modo claro por defecto". Guardado con la adaptación en `design-system/fanslayer-brutal/MASTER.md`.
- **Lo que se adaptó y por qué:** el buscador propuso morado #8B5CF6 + Orbitron/Exo 2. El morado es el look genérico "hecho con IA" y Orbitron se ve como cualquier sitio web3, así que se tomó solo su dorado de "valor" como único acento (es el color del puntaje en el juego) y fuentes crudas: Space Grotesk 700 en mayúsculas para títulos y JetBrains Mono para etiquetas, botones, precios y direcciones.
- **Color:** oscuro por defecto `#09090b`, superficies `#0f1013`/`#15161a`, bordes de 1 px `#1c1d22` (casi invisibles; solo se marcan al pasar el puntero), texto `#ececef`, gris `#8e909a` (6.3:1), dorado `#f5c542`. El claro sigue disponible con el botón de tema.
- **Landing (más contenido):** hero con titular gigante y cursor de terminal, ficha técnica del contrato (red, precio, límite, contrato), cómo funciona, el juego (combos x5, zombis brutos, drops, controles; todo con números reales del código), artistas (cambian a su frame de ataque al pasar el puntero), "bajo el capó" como prueba verificable en lugar de testimonios inventados, preguntas frecuentes y cierre.
- **Fondo 3D:** no se tiró el dado ni se montó fondo porque el pedido dice "sin animaciones de fondo".
- **Movimiento (Motion 13.4.6):** entrada escalonada del hero (eyebrow, título, texto y botones), revelado al hacer scroll una sola vez, press con spring en botones y tarjetas, barra de pestañas con `layoutId`, cambio de pantalla, avisos y acordeón con `AnimatePresence`, crossfade del ícono de tema. El único movimiento continuo es el cursor del hero. `MotionConfig reducedMotion="user"` y el cursor se queda fijo con reducir movimiento. Los hovers de color son instantáneos (rasgo brutalista).
- **Detalle propio:** índices de sección en mono (`[01]`), etiquetas `// COMBO`, la dirección del contrato truncada en medio, el recorte real de un zombi bruto de una partida y los items del juego.

### v5: cybercore limpio (reemplazado)

- **Pedido:** estilo cybercore con colores limpios, sin animaciones por ahora, menos detalles amontonados, modo claro y oscuro, y ES/EN.
- **Dirección:** se mantiene la de v4 (Minimalism & Swiss con capa cybercore) y se extiende a las pantallas con sesión. UI/UX Pro Max pide no comunicar estados solo con color: la tarjeta equipada lleva borde del acento más "Equipado" con ícono, la pestaña activa lleva subrayado y `aria-current`, y "En tu colección" lleva ícono y texto.
- **Menos ruido:** sin sombras, sin luces detrás de los retratos, sin punto verde de wallet, sin etiquetas de colores ni contador rosa. Cada tarjeta es una línea de 1 px, el retrato sobre negro (el pixel art viene así) y el texto. El Workshop pasó de tarjetas a filas separadas por líneas.
- **Color:** claro `#ffffff` / tinta `#0b0c10` / gris `#555b68` / acento `#1f3bff`; oscuro `#0b0c10` / `#eef0f4` / `#9ba1ae` / `#8c9bff`. Éxito y error tienen su propio tono y siempre van con ícono y texto.
- **Tipografía:** Chakra Petch (títulos), Space Grotesk (cuerpo) y JetBrains Mono (botones, etiquetas, precios y direcciones truncadas en medio). Press Start 2P queda solo para el HUD del juego.
- **Fondo 3D:** no se tiró el dado ni se montó fondo animado porque el pedido dice explícitamente "sin animaciones ni nada de eso por el momento". También se quitaron las microinteracciones con movimiento; los hovers cambian el borde o el color al instante. Cuando se quieran animaciones, la receta y el componente se pueden agregar sin tocar los tokens.
- **Detalle propio:** precios del contrato y direcciones en monoespaciada, la etiqueta "testnet" junto a cada precio y los retratos en pixel art de cada artista.

### v4: minimal cybercore (landing)

- **Pedido:** landing minimalista, estilo cybercore, colores claros y blancos limpios, sin animaciones por ahora, con menos elementos amontonados, modo claro y oscuro, y ES/EN.
- **Dirección:** UI/UX Pro Max devolvió primero "Cyberpunk UI" (negro neón, no recomienda modo claro), que choca con el pedido; se reintentó una vez y se tomó **Minimalism & Swiss** (blanco, alto contraste, sin sombras, radio 0, un solo acento) con una capa cybercore: etiquetas en monoespaciada, líneas de 1 px y esquinas de mira alrededor de la captura.
- **Color:** blanco `#ffffff`, tinta `#0b0c10`, gris `#555b68` (6.8:1) y un único acento azul eléctrico `#1f3bff` (6.8:1 sobre blanco). En oscuro: `#0b0c10`, `#eef0f4` y acento `#8c9bff`. Los tokens viven en `.lp` (`frontend/src/landing/landing.css`).
- **Tipografía:** Chakra Petch (display de corte técnico), Space Grotesk (cuerpo) y JetBrains Mono (etiquetas, precios y la dirección del contrato, truncada en medio). Todas self-hosted con Fontsource.
- **Fondo 3D:** no se tiró el dado ni se montó fondo en la landing porque se pidió explícitamente "sin animaciones". El fondo animado anterior sigue solo en las pantallas con sesión iniciada. No hay transiciones ni animaciones en la landing; los hovers cambian de color al instante.
- **Contenido:** hero (titular, una línea, dos botones y la captura real), "Cómo funciona" en tres columnas separadas por líneas, y los dos artistas con precio y límite reales del contrato. Se quitaron el personaje rebotando, el "PRESS START", la barra de progreso y el bloque final.
- **Detalle propio:** la captura de una partida real con su HUD y los precios/límites del contrato en monoespaciada.

### v3: arcade mínimo (reemplazado)

- **Dirección:** UI/UX Pro Max recomendó Minimalism & Swiss con tipografía pixel (Press Start 2P / VT323), sombras duras y movimiento sutil. Paleta de consola limitada: noche, hueso, dorado para la acción principal y el puntaje, y rosa solo como acento. Esquinas rectas, bordes de 2 px y sombras de pixel sin desenfoque. VT323 pasa a ser la fuente de cuerpo, con la escala tipográfica agrandada porque se ve más chica que su tamaño nominal.
- **Fondo:** el dado sacó la receta 1 (figuras 3D + constelación), que choca con pedir algo menos cargado, así que se tiró una vez más y salió la 4 (túnel warp). Se hizo minimalista: un cielo de pocas estrellas de un pixel que titilan y de 6 a 10 marcos cuadrados que avanzan despacio, en canvas de baja resolución escalado con `image-rendering: pixelated`. Dos capas con parallax distinto (puntero y scroll), mitad de marcos en las pantallas de trabajo, mitad de elementos en celular, pausa con la pestaña oculta y escena quieta con reducir movimiento.
- **Hero:** centrado, con el personaje en pixel art sobre una plataforma, rebote suave continuo y el clásico "PRESS START" parpadeando.

### v2: rediseño con three.js (reemplazado)

- **Sistema de diseño:** salió de UI/UX Pro Max (`--design-system`, estilo Pixel Art, patrón Hero-Centric) y está guardado en `design-system/fanslayer/MASTER.md`. Los colores se adaptaron al tema "concierto nocturno en el bosque": rosa de reflector, cian de cascada, verde de vida y dorado de puntaje. Modo claro y oscuro con tokens en `frontend/src/styles/tokens.css`.
- **Fondo 3D:** el dado sacó la receta 1 (figuras 3D + constelación). Como se pidió three.js, la constelación se construyó en three.js y se le sumó la bola de disco low-poly de la receta 6, que encaja con el concierto. Capas: aurora CSS (lejana), escena three.js con bola de disco, luciérnagas doradas y constelación cian (media) y haces de reflector CSS (cercana). Parallax por puntero y por scroll; variante completa en la landing y tranquila en el menú; mitad de partículas en celular; DPR máximo 2; se pausa con la pestaña oculta; escena estática con reducir movimiento. three.js se carga en diferido en su propio chunk. En el juego el fondo se apaga.
- **Scroll:** Lenis da inercia suave (respeta reducir movimiento). Hay barra de progreso, el hero se desvanece al bajar, la línea de los pasos se dibuja con el scroll y "Lo que vas a encontrar" es un paneo horizontal guiado por el scroll vertical (en celular es un carrusel con scroll-snap).
- **Composición abierta:** las secciones ya no van en cajas: los artistas flotan bajo reflectores, los pasos cuelgan de un riel y las tarjetas son de vidrio sobre el fondo.
- **Animación:** Motion 13.4.6 con `MotionConfig reducedMotion="user"`; springs en botones y tarjetas, `layoutId` en las pestañas y en la tarjeta equipada, `AnimatePresence` entre pantallas y en los toasts.
- **Detalle propio:** la marquesina LED con cuadros de colores de las luces del escenario, la bola de disco y el retrato nocturno de cada artista.
- **Vista previa de desarrollo:** `npm run dev` y abrir `/dev-preview.html?view=menu&state=ready` (también `loading`, `empty`, `error`, `view=workshop`, `view=stage`, `toast=success`). No entra al build.

## Checklist de 2 minutos en el celular

1. Abre https://fan-slayer.vercel.app: fondo casi negro, titular enorme en mayúsculas, sin fondo animado y sin scroll horizontal.
2. Mira el hero: el texto entra en cascada y solo parpadea el cuadro dorado junto a "EL ESCENARIO.".
3. Baja la página: ficha del contrato, cómo funciona, el juego, artistas, "bajo el capó", preguntas y cierre. Toca una pregunta: se abre y la anterior se cierra.
4. Toca el sol: pasa a claro; recarga y se mantiene. Toca EN: todo pasa a inglés. (También puedes abrir `?lang=en` o `?theme=light`.)
5. Toca el enlace del contrato: abre el explorador de Monad Testnet en otra pestaña.
6. Toca "Jugar" e inicia sesión: el menú usa el mismo estilo; cambia entre Personajes y Workshop y la barra dorada se desliza.
7. Toca una tarjeta de personaje: se marca con borde dorado y "EQUIPADO".
