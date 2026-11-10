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

1. Abre https://fan-slayer.vercel.app: se ven estrellas pixel y marcos cuadrados que avanzan despacio; no hay scroll horizontal.
2. El personaje del hero rebota suave y "PRESS START" parpadea.
3. Baja con el dedo: la barra dorada de arriba avanza y los pasos y artistas aparecen suaves.
4. Toca "Jugar ahora", inicia sesión y revisa que aparezcan tus personajes (o el estado vacío).
5. Cambia a Workshop: el precio carga y los artistas que ya tienes dicen "En tu colección".
6. Equipa un personaje y toca "Jugar": el juego llena la pantalla y el fondo se apaga.
7. Activa el modo claro del teléfono y recarga: todo se lee bien.
