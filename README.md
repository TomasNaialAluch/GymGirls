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

## Validaciones visuales

Los destellos que avisan qué está pasando están documentados en
[VALIDACIONES.md](VALIDACIONES.md). Muestrario en vivo: `/validaciones`.

## Progreso de la semana y objetivos

- El círculo de la portada tiene un tramo por día de la rutina y se reinicia al
  completarlos todos.
- `/objetivos`: el alumno carga peso, altura, edad y género, y puede marcar cada
  día si cumplió. El entrenador ve esos datos en la ficha y define proteína y
  calorías diarias. Datos en `goals/{uid}`.
- Agua: el entrenador fija los litros por día y el alumno suma vasos o botellas
  desde la portada o `/objetivos`.

## Qué le toca al alumno

La portada sigue el orden de días que puso el entrenador: muestra lo último
entrenado y qué viene después (al terminar la lista vuelve al primero). Si hoy
quedó a medias, ofrece continuarlo; si ya lo completó, muestra el próximo.

## Cuentas y roles

- Desde `/registro` cualquiera crea su cuenta y elige **entrenador** (`admin`) o
  **alumno** (en los datos, `usuaria`).
- Cada admin ve y edita **solo sus alumnos**: los que tienen `adminId` igual a su
  uid.
- El entrenador **agrega al alumno** y le arma la rutina sin esperar nada: el
  perfil se guarda al instante (`pending: true`). El link le da acceso: al
  usarlo, el perfil y la rutina pasan a su cuenta.
- Desde la ficha se puede **editar el nombre** y **eliminar**: si no tiene
  cuenta se borra todo; si ya entró, solo se desvincula.
- Un alumno se vincula con una invitación (link o código) que genera su
  entrenador: por `/invite/{code}`, en `/registro` o, si ya tiene cuenta, desde
  `/dia`. Cada invitación sirve una vez y vence a los 14 días.
- Al desplegar, publicar **primero** las reglas
  (`firebase deploy --only firestore:rules`): las anteriores dan acceso total a
  cualquier admin, y ahora el registro de admins es abierto.
- Alumnos creados antes de `adminId`: completar ese campo en `users/{uid}` con el
  uid de su entrenador, o mandarles una invitación nueva.

## Modelo de datos (Firestore)

- `users/{uid}` — perfil + rol (`admin` | `usuaria`) + `adminId` (entrenador del
  alumno).
- `invites/{code}` — invitaciones que vinculan un alumno con el admin que las
  generó. Solo accesibles vía API, no desde el cliente.
- `routines/{uid}` — rutina completa de una usuaria, por día de la semana.
- `progress/{uid}/entries/{entryId}` — registros de reps/peso por ejercicio
  realizado.

Reglas de seguridad en [firestore.rules](firestore.rules).

## Estructura

```
src/
  app/
    login/                        login de usuaria/admin
    registro/                     alta eligiendo entrenador o alumno
    invite/[code]/                alta de usuaria vía link de invitación
    admin/                        panel admin
      usuarias/                   listado + alta
      usuarias/[uid]/             detalle de una usuaria
      usuarias/[uid]/rutina/      editor de rutina
    dia/[dayId]/                  rutina del día (usuaria)
    progreso/                     historial/analíticas (usuaria)
    api/
      session/                   login/logout (cookie de sesión)
      register/                  crear perfil (admin o alumno)
      me/vincular/               vincular un alumno con su entrenador
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
