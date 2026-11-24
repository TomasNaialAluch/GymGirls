# GymGirls

App de entrenamiento: panel de admin para asignar y editar rutinas por usuaria,
y vista de usuaria para seguir su rutina del día, cronómetro, descanso entre
series y registro de progreso (reps/peso).

Identidad de marca (logo, key visual, mockups): ver [BRAND.md](BRAND.md).

Componentes de UI ya construidos (cards, botones, fondo animado, etc.) y
cómo conectarlos: ver [UI_COMPONENTS.md](UI_COMPONENTS.md). Vitrina en vivo:
`npm run dev` → `/design-system`.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Firebase Auth (sesión vía cookie HttpOnly) + Firestore + Firebase App Hosting

## Setup

1. Crear un proyecto en [Firebase console](https://console.firebase.google.com/).
2. Habilitar **Authentication** (método Email/Password) y **Firestore**.
3. Copiar `.env.local.example` a `.env.local` y completar:
   - Config del cliente: Project settings > General > Your apps (web app).
   - Config del Admin SDK: Project settings > Service accounts > Generate new private key.
4. `npm install`
5. `npm run dev`

## Despliegue (Firebase App Hosting)

```bash
firebase init apphosting
firebase deploy
```

Las variables no secretas van en `apphosting.yaml`; las secretas
(`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) se setean con:

```bash
firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY
```

## Modelo de datos (Firestore)

- `users/{uid}` — perfil + rol (`admin` | `usuaria`) + días de entrenamiento.
- `invites/{code}` — invitaciones generadas por el admin (alta por link, sin
  auto-registro libre). Solo accesibles vía API, no desde el cliente.
- `routines/{uid}` — rutina completa de una usuaria, por día de la semana.
- `progress/{uid}/entries/{entryId}` — registros de reps/peso por ejercicio
  realizado.

Reglas de seguridad en [firestore.rules](firestore.rules).

## Estructura

```
src/
  app/
    login/                        login de usuaria/admin
    invite/[code]/                alta de usuaria vía link de invitación
    admin/                        panel admin
      usuarias/                   listado + alta
      usuarias/[uid]/             detalle de una usuaria
      usuarias/[uid]/rutina/      editor de rutina
    dia/[dayId]/                  rutina del día (usuaria)
    progreso/                     historial/analíticas (usuaria)
    api/
      session/                   login/logout (cookie de sesión)
      invites/                   generar invitación (admin)
      invites/[code]/accept/     aceptar invitación (nueva usuaria)
      routines/[uid]/            leer/editar rutina
      progress/                  registrar/leer progreso
  lib/
    firebase/client.ts           SDK cliente (browser)
    firebase/admin.ts            SDK admin (server)
    auth/session.ts              lectura de sesión server-side
  types/index.ts                 modelos de datos compartidos
```

Todas las páginas son esqueletos (`TODO`) sin diseño — la estructura y el
flujo de datos ya están armados, falta la interfaz.
