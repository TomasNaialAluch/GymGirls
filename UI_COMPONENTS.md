# GymGirls — Componentes de UI

Catálogo vivo de lo que se va armando en esta sesión "estética" (diseño de UI
a partir de [BRAND.md](BRAND.md)). Está pensado para que la sesión que arma
Firebase/lógica pueda ir conectando datos reales sin tener que adivinar
props ni reinventar estilos.

**Ver todo junto, funcionando:** `npm run dev` → [http://localhost:3000/design-system](http://localhost:3000/design-system).
Esa ruta **no es una pantalla real de la app** — es una vitrina de referencia
visual con datos mock, para QA e integración. Se puede borrar más adelante
o dejarse como Storybook casero; mientras tanto sirve para ver en vivo
cualquier componente de esta lista.

Todos los componentes son **presentacionales** (reciben datos por props, no
hacen fetch ni conocen Firebase/Firestore). La idea es que cualquier pantalla
real (`/dia/[dayId]`, `/admin/...`, etc.) importe estos componentes y les
pase los datos ya resueltos.

---

## Registro de avance

| Fecha | Qué se agregó |
|---|---|
| 2026-11-19 | Tokens globales (`globals.css`) + fuente Fredoka (`layout.tsx`). |
| 2026-11-19 | `IntroSplash` + `AppShell` — video de intro al entrar a la app. |
| 2026-11-19 | Primer set de componentes: `Logo`, `AnimatedBackground`, `Card`, `Button`, `ProgressRing`, `StatItem`, `StreakBadge`, `BottomNav`, `WorkoutCard` + página `/design-system`. |
| 2026-11-24 | Nuevas primitivas: `TextField`, `SelectField`, `PillToggleGroup`, `AuthLayout`, `PageHeader`, `AdminHeader`; `Button` ahora tiene `size` (`sm`\|`md`) y variante `ghost`. |
| 2026-11-24 | **Se vistieron todas las pantallas reales** (ver APP_SPEC.md): `/login`, `/invite/[code]`, `/dia/[dayId]` (+ `ExerciseRunner`, `Stopwatch`, `RestTimer`, `SetLogger`), `/progreso` (+ `ProgressList`), y todo `/admin/*` (+ `CreateInviteForm`, `BlockListEditor`, `ExerciseListEditor`). Se conservó 1:1 la lógica/props existentes — solo cambió JSX/clases, salvo 2 props opcionales nuevas (ver abajo). |

---

## Fondo y estructura de pantalla

### `AnimatedBackground`
`src/components/brand/AnimatedBackground.tsx` — el fondo vivo de anillos de
marca (BRAND.md §8). Es un `<div>` `absolute inset-0` con un SVG animado
puramente en CSS (sin canvas, sin JS por frame → liviano).

```tsx
import AnimatedBackground, { type BackgroundMode } from "@/components/brand/AnimatedBackground";

<div className="relative min-h-screen">
  <AnimatedBackground mode={mode} intensity={intensity} onCelebrateEnd={() => setMode("idle")} />
  {/* el resto del contenido va con position: relative + z-10 por encima */}
</div>
```

| Prop | Tipo | Default | Qué hace |
|---|---|---|---|
| `mode` | `"idle" \| "timer" \| "celebrate"` | `"idle"` | `idle`: rotación lenta ambiente (navegación normal). `timer`: rotación más rápida — usar mientras corre un cronómetro/descanso. `celebrate`: dispara un pulso de luz + acelera ~2.2s y listo. |
| `intensity` | `number` 0–1 | `0` | Solo aplica en `timer`. Pensado para atarlo a `segundosRestantes / segundosTotales` — a mayor intensidad, más rápido gira (ej. acelera en los últimos segundos de la serie). |
| `onCelebrateEnd` | `() => void` | — | Se llama solo cuando termina la animación de `celebrate`. **Importante:** el componente no vuelve solo a `idle` — quien lo usa debe escuchar este callback y cambiar el `mode` de vuelta (ver ejemplo en `/design-system`). |

**Montarlo una sola vez por pantalla** (no uno por cada card). Para la pantalla
`/dia/[dayId]` (cronómetro real) la idea es: `mode="idle"` por defecto,
`mode="timer"` mientras el cronómetro/descanso está corriendo, y disparar
`mode="celebrate"` cuando se completa una serie/objetivo o se termina el
entrenamiento.

Respeta `prefers-reduced-motion` automáticamente (desactiva las animaciones).

**Forma del patrón (actualizado 2026-11-24):** no son anillos con trazo ni
segmentos de puntas redondas — son **"hoces"/aspas rellenas**, angostas y
afiladas en punta en ambos extremos, gruesas en el medio (una curva de
grosor `sin(π·t)` a lo largo del arco), tal como en el key visual de marca
(BRAND.md, foto de referencia). Cada nivel tiene 2 hoces opuestas, con fase
y velocidad propias, para el efecto remolino/espiral.

**Movimiento orgánico (2026-11-24):** cada nivel ya no gira a velocidad
constante — tiene su propia curva horneada en un `@keyframes` (generado en
runtime, determinístico) que acelera, frena casi del todo y rebota un poco
hacia atrás antes de retomar impulso, para que se sienta vivo y no como un
motor. El giro neto por vuelta sigue siendo 360°, así que el loop infinito
no se nota.

**Profundidad tipo "agujero negro" (2026-11-24):** se bajó bastante la
intensidad general (antes era demasiado fuerte/plano) y se agregó sensación
de profundidad sin WebGL — se evaluó y se descartó por ahora: el resultado
en SVG/CSS ya se acerca mucho a la referencia y mantiene el rendimiento
liviano que pide BRAND.md §8.4, así que no hizo falta esa complejidad:
- Grosor y opacidad por nivel ya no decrecen parejo — siguen una campana
  centrada un poco afuera del centro (como el anillo de fotones de un
  agujero negro): ahí son más gruesos/brillantes/nítidos, y se apagan tanto
  hacia el centro como hacia afuera.
- Cada nivel mezcla más negro en su color cuanto más lejos está
  (`color-mix` hacia `#05010a`) y tiene más blur propio (profundidad de
  campo: lo lejano se ve fuera de foco).
- Círculo central con gradiente radial a negro (el "vacío"), y una viñeta
  radial por encima de todo el SVG que funde los bordes del remolino hacia
  `var(--background)` — así no se siente un corte rectangular ni un plano
  2D liso.

*Pendiente / v2 (no bloqueante):* variación semi-aleatoria de opacidad por
hoz (BRAND.md §8.3.2) — hoy el efecto "vivo" sale solo de que cada nivel
gira a velocidad y sentido distintos, lo cual ya cumple bien el objetivo de
"nunca se ve mecánico", pero se puede afinar más adelante.

### `Logo`
`src/components/brand/Logo.tsx` — wordmark "GymGirls" con el glow de marca.

```tsx
<Logo size="md" />  {/* "sm" | "md" | "lg" */}
```

---

## Primitivas de UI (`src/components/ui/`)

### `Card`
Card oscura glass/blur (BRAND.md §8.1). Wrapper simple: `<Card className="...">{children}</Card>`. Acepta cualquier prop de `<div>`.

### `Button`
CTA pill. `variant`: `"solid"` (magenta sólido, default) | `"outline"`. Acepta `icon` (ReactNode) y cualquier prop nativa de `<button>` (`onClick`, `disabled`, `type`, etc.) — es `"use client"` así que funciona bien pasado a pantallas que son Server Components.

```tsx
<Button icon={<span>▶</span>} onClick={start}>Empezar entrenamiento</Button>
<Button variant="outline">Cancelar</Button>
```

### `ProgressRing`
Donut de progreso con degradé magenta→violeta. `percent` (0-100), `size`, `strokeWidth`, `label` opcional debajo del número.

```tsx
<ProgressRing percent={75} label="Completado" />
```

### `StatItem`
Fila ícono + label + valor (Calorías / Tiempo / Agua en el mockup). `icon` acepta cualquier ReactNode — hoy se usa con emoji, se puede swapear por una librería de íconos sin cambiar la API.

```tsx
<StatItem icon="🔥" label="Calorías" value="320 kcal" />
```

### `StreakBadge`
Pill de racha. `<StreakBadge days={12} />` → `🔥 12`.

### `BottomNav`
Barra inferior flotante. Recibe `items: BottomNavItem[]` (`key`, `label`, `icon`, `href`) y `activeKey`. Usa `next/link` — cuando haya rutas reales, `href` apunta directo a ellas (`/dia/hoy`, `/progreso`, etc.).

`icon` es un `ReactNode` — usar los íconos planos de `src/components/ui/icons.tsx` (`HomeIcon`, `DumbbellIcon`, `PeopleIcon`, `LeafIcon`, `UserIcon`), **no emoji** (ver el mockup: los íconos ahí son planos/lineales, no emoji de color). Todos son SVG `stroke="currentColor"`, así que heredan el color activo/inactivo solos.

```tsx
import { HomeIcon } from "@/components/ui/icons";

<BottomNav
  activeKey="inicio"
  items={[
    { key: "inicio", label: "Inicio", icon: <HomeIcon className="h-5 w-5" />, href: "/dia/hoy" },
    // ...
  ]}
/>
```

### `WorkoutCard`
Card horizontal "Rutina de Hoy": foto + título + metadatos + CTA. Pensada para recibir directamente los campos de `RoutineExercise`/`Routine` (ver `src/types/index.ts`) ya formateados a string por quien la use.

```tsx
<WorkoutCard
  imageSrc={routine.imageUrl}
  title={routine.title}
  difficulty="Intermedio"
  duration="45 min"
  equipment="Mancuernas"
  onStart={() => router.push(`/dia/${dayId}/entrenar`)}
/>
```

### `TextField` / `SelectField`
Input/select labeled con el mismo tratamiento visual (surface + borde sutil + foco magenta). Reciben todas las props nativas de `<input>`/`<select>` más `label`. Usados en login, invite, y todos los forms de admin.

```tsx
<TextField label="Email" type="email" value={email} onChange={...} required />
<SelectField label="Tipo" value={block.type} onChange={...}>
  <option value="otro">Otro</option>
</SelectField>
```

### `PillToggleGroup`
Grupo de pills genérico — multi-selección (días de entrenamiento en `CreateInviteForm`) o selección única tipo tabs (día activo en el editor de rutina: pasarle `selected={[valorActual]}`).

```tsx
<PillToggleGroup
  options={[{ value: "lunes", label: "Lunes" }, ...]}
  selected={trainingDays}
  onToggle={(day) => toggleDay(day)}
/>
```

### `AuthLayout`
Layout de pantalla completa para `/login` y `/invite/[code]`: `AnimatedBackground` + `Logo` grande centrado + `Card` para el form. `subtitle` opcional debajo del logo.

### `PageHeader` / `AdminHeader`
Headers livianos reutilizables. `PageHeader` (logo + link a Progreso + Salir) para pantallas de usuaria; `AdminHeader` (logo con link a `/admin` + Salir) para pantallas de admin. Ambos usan `useAuth().signOut` directamente — no hace falta pasarles nada.

---

## Tokens disponibles (desde `globals.css`, uso vía Tailwind)

No hace falta memorizar hex — están como utilities de Tailwind v4 (generadas
desde `@theme inline`):

- Color: `bg-background`, `bg-surface`, `bg-surface-alt`, `text-foreground`, `text-muted` (o clase `.gg-muted`), `bg-primary` / `text-primary` / `border-primary`, `bg-primary-dark`, `bg-glow`, `bg-pastel`.
- Radios: `rounded-card` (cards), `rounded-pill` (botones/badges/nav).
- Fuentes: `font-sans` (Geist, texto de UI — default), `font-display` (Fredoka, títulos/hero), `font-mono` (Geist Mono, para números si se necesita look "stat").
- Clases helper en `globals.css`: `.gg-logo` (texto con glow), `.gg-card` (glass), `.gg-button` (pill sólido, por si se necesita fuera de React), `.gg-gradient-data` (degradé magenta→violeta como background-image).

---

## `/dia/[dayId]`: cómo quedó conectado el fondo animado

Para que `AnimatedBackground` reaccione de verdad al entrenamiento (BRAND.md
§8.3) se agregaron **2 props opcionales** (no rompen nada existente si no se
pasan):

- `Stopwatch({ onRunningChange? })` — avisa cuando arranca/pausa/resetea.
- `ExerciseRunner({ onRunningChange?, onCelebrate? })` — reexpone el de
  `Stopwatch` y llama a `onCelebrate` cuando el ejercicio se guarda con éxito.

`DiaPage` junta esto en un `Set<exerciseId>` para decidir `mode="timer"`
mientras cualquier cronómetro esté corriendo, y dispara `mode="celebrate"`
cuando se completa un ejercicio. **No se conectó** el descanso (`RestTimer`)
ni la "mega celebración" de entrenamiento 100% terminado — quedó fuera de
alcance para no tener que trackear el estado de todos los bloques/ejercicios
de una vez; es un buen próximo paso si se quiere afinar.

Los admin (`/admin/*`) **no llevan `AnimatedBackground`** a propósito: son
pantallas de formularios/edición densas, y el fondo giratorio de marca
distraía más de lo que sumaba — se mantuvo el tema oscuro/tipografía/cards
para consistencia, sin el fondo animado.

## Qué falta / no verificado

- Esta sesión **no pudo probar en vivo** `/dia/[dayId]`, `/progreso` ni
  `/admin/*` en el navegador — no hay credenciales de un usuario de prueba
  para el proyecto de Firebase real (`gymgirls-cfd38`). Se verificó todo con
  `tsc --noEmit` + `eslint` limpios, lectura cuidadosa preservando cada
  handler/prop existente, y prueba visual directa de `/login`,
  `/invite/[code]` (código inválido) y `/design-system`. Vale la pena un
  vistazo visual una vez que haya un usuario de prueba logueable.
- No se tocó Firebase, Auth, rutas de API, ni ningún modelo de datos — todo
  el cambio de esta vuelta es JSX/clases + las 2 props opcionales de arriba.
