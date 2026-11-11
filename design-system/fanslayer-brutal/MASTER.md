# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** FanSlayer Brutal
**Generated:** 2026-11-10 19:36:12
**Category:** NFT/Web3 Platform
**Design Dials:** Variance 8/10 (Bold / Asymmetric) | Motion 5/10 (Standard)

---

## Adaptación FanSlayer (manda sobre las tablas genéricas de abajo)

Pedido: brutalism + cybercore, colores oscuros, bordes muy leves, más contenido en la landing, sin animación de fondo.

- **Estilo:** Brutalism del buscador (bloques grandes, tipografía en negrita, esquinas a 0, grilla visible, contraste alto). Capa cybercore: etiquetas en monoespaciada entre corchetes, datos técnicos reales del contrato y cursor de terminal en el hero.
- **Bordes:** 1 px muy tenues (`--border`: #1c1d22 en oscuro, #d6d6d1 en claro). Solo se marcan al pasar el puntero (`--border-strong`).
- **Color:** se descarta el morado genérico (#8B5CF6) por ser el look "hecho con IA". Se toma el dorado de "valor" del buscador como único acento, que además es el color del puntaje en el juego. Oscuro por defecto (el buscador marca "light mode default" como anti-patrón); el claro sigue disponible.
  - Oscuro: fondo #09090b, superficie #0f1013 / #15161a, texto #ececef, gris #8e909a (6.3:1), acento #f5c542 con texto #0b0b0d.
  - Claro: fondo #f3f3f0, texto #0b0b0d, gris #4f515a (7.4:1), acento de relleno #f5c542 y acento como texto #7a5800 (5.6:1).
- **Tipografía:** se descarta Orbitron/Exo 2 (genérico web3). Brutalism pide fuentes crudas: Space Grotesk 700 en mayúsculas para display, Space Grotesk para cuerpo y JetBrains Mono para etiquetas, botones, precios y direcciones. Press Start 2P solo en el HUD del juego.
- **Patrón:** Feature-Rich Showcase: hero, ficha técnica, cómo funciona, mecánicas (4), artistas, "bajo el capó" (prueba verificable en lugar de testimonios, que no existen), preguntas frecuentes y CTA final.
- **Movimiento:** sin fondo animado (pedido). Motion solo para entrada del hero, revelado al hacer scroll (una vez), press con spring en botones y tarjetas, indicador de pestañas con `layoutId`, cambio de pantalla y avisos con `AnimatePresence`. Hovers de color instantáneos (rasgo brutalista). Todo respeta `prefers-reduced-motion`.

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#8B5CF6` | `--color-primary` |
| On Primary | `#000000` | `--color-on-primary` |
| Secondary | `#A78BFA` | `--color-secondary` |
| On Secondary | `#0F172A` | `--color-on-secondary` |
| Accent/CTA | `#FBBF24` | `--color-accent` |
| On Accent/CTA | `#0F172A` | `--color-on-accent` |
| Background | `#0F0F23` | `--color-background` |
| Foreground | `#F8FAFC` | `--color-foreground` |
| Card | `#1E1D35` | `--color-card` |
| Card Foreground | `#F8FAFC` | `--color-card-foreground` |
| Muted | `#27273B` | `--color-muted` |
| Muted Foreground | `#94A3B8` | `--color-muted-foreground` |
| Border | `#4C1D95` | `--color-border` |
| Destructive | `#EF4444` | `--color-destructive` |
| On Destructive | `#000000` | `--color-on-destructive` |
| Ring | `#8B5CF6` | `--color-ring` |

**Color Notes:** Purple tech + gold value

### Typography

- **Heading Font:** Orbitron
- **Body Font:** Exo 2
- **Mood:** crypto, web3, futuristic, tech, blockchain, digital
- **Google Fonts:** [Orbitron + Exo 2](https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #FBBF24;
  color: #0F172A;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #F8FAFC;
  border: 2px solid #8B5CF6;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #0F0F23;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #8B5CF6;
  outline: none;
  box-shadow: 0 0 0 3px #8B5CF620;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Brutalism

**Keywords:** Raw, unpolished, stark, high contrast, plain text, default fonts, visible borders, asymmetric, anti-design

**Best For:** Design portfolios, artistic projects, counter-culture brands, editorial/media sites, tech blogs

**Key Effects:** No smooth transitions (instant), sharp corners (0px), bold typography (700+), visible grid, large blocks

### Page Pattern

**Pattern Name:** Feature-Rich Showcase

- **Conversion Strategy:** Clear feature hierarchy. One key message per card. Strong CTA repetition.
- **CTA Placement:** Hero (sticky) + After features + Bottom
- **Section Order:** Hero (value prop) > Feature grid/cards (4-6) > Use cases or benefits > Social proof or logos > CTA

---

## Motion

**Stagger List** (Standard) — Trigger: load or scroll | Duration: 300-450ms | Easing: `back.out(1.4)`

```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4, stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```

**Framework notes:** grid: 'auto' lets GSAP infer rows/columns from a CSS grid layout for a natural wave stagger; Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately

- ✅ Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- ❌ Don't use back.out on dense data tables; the overshoot reads as sloppy on informational UI
- ⚡ Group DOM writes; avoid interleaving layout reads (getBoundingClientRect) between staggered tweens

---

## Anti-Patterns (Do NOT Use)

- ❌ Light mode default
- ❌ No transaction status

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
