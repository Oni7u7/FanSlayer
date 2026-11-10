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

### v4: minimal cybercore (actual, landing)

- **Pedido:** landing minimalista, estilo cybercore, colores claros y blancos limpios, sin animaciones por ahora, con menos elementos amontonados, modo claro y oscuro, y ES/EN.
- **Dirección:** UI/UX Pro Max devolvió primero "Cyberpunk UI" (negro neón, no recomienda modo claro), que choca con el pedido; se reintentó una vez y se tomó **Minimalism & Swiss** (blanco, alto contraste, sin sombras, radio 0, un solo acento) con una capa cybercore: etiquetas en monoespaciada, líneas de 1 px y esquinas de mira alrededor de la captura.
- **Color:** blanco `#ffffff`, tinta `#0b0c10`, gris `#555b68` (6.8:1) y un único acento azul eléctrico `#1f3bff` (6.8:1 sobre blanco). En oscuro: `#0b0c10`, `#eef0f4` y acento `#8c9bff`. Los tokens viven en `.lp` (`frontend/src/landing/landing.css`).
- **Tipografía:** Chakra Petch (display de corte técnico), Space Grotesk (cuerpo) y JetBrains Mono (etiquetas, precios y la dirección del contrato, truncada en medio). Todas self-hosted con Fontsource.
- **Fondo 3D:** no se tiró el dado ni se montó fondo en la landing porque se pidió explícitamente "sin animaciones". El fondo animado anterior sigue solo en las pantallas con sesión iniciada. No hay transiciones ni animaciones en la landing; los hovers cambian de color al instante.
- **Contenido:** hero (titular, una línea, dos botones y la captura real), "Cómo funciona" en tres columnas separadas por líneas, y los dos artistas con precio y límite reales del contrato. Se quitaron el personaje rebotando, el "PRESS START", la barra de progreso y el bloque final.
- **Detalle propio:** la captura de una partida real con su HUD y los precios/límites del contrato en monoespaciada.

### v3: arcade mínimo (actual)

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

1. Abre https://fan-slayer.vercel.app: fondo blanco (o negro si tu teléfono está en modo oscuro), sin animaciones y sin scroll horizontal.
2. Toca el ícono de luna/sol: cambia a oscuro/claro al instante. Recarga: se queda como lo dejaste.
3. Toca EN: todos los textos pasan a inglés. Recarga: sigue en inglés. Toca ES para regresar.
4. Baja la página: se ven "Cómo funciona" y los dos artistas sin tener que esperar nada.
5. Toca el link del contrato: abre el explorador de Monad Testnet en otra pestaña.
6. Toca "Jugar ahora" e inicia sesión: el diálogo de Privy usa el mismo tema y llegas a tus personajes.
