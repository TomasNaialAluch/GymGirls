# GymGirls — Especificación funcional y de datos

> Para el chat de diseño: este documento describe **qué hace la app, cómo
> está organizada la información y qué pantallas/componentes existen**, sin
> definir estética (colores, tipografía, layout visual) — eso vive en
> [BRAND.md](BRAND.md) y [UI_COMPONENTS.md](UI_COMPONENTS.md). Usá este
> archivo para entender qué datos tiene cada pantalla disponibles y qué
> interacciones debe soportar, y así poder vestirla sin romper la lógica.

## 1. Concepto

App de entrenamiento con dos roles: una **admin** (entrenadora) que arma y
ajusta rutinas, y varias **usuarias** que siguen su rutina asignada,
registran lo que hicieron y ven su progreso.

## 2. Jerarquía de una rutina (lo central del modelo)

Una rutina **no** es una lista plana de ejercicios. Por cada día de
entrenamiento de una usuaria hay **bloques** (etapas), y cada bloque tiene
sus **ejercicios**:

```
Routine (una por usuaria)
└── days: { lunes, miercoles, viernes, ... }   ← solo los días que entrena
    └── WorkoutBlock[]                          ← bloques, en orden
        ├── "Entrada en calor"
        ├── "Movilidad"
        ├── "Bloque principal"
        └── "Vuelta a la calma"
            └── RoutineExercise[]                ← ejercicios, en orden
                ├── nombre, series, reps objetivo, peso objetivo, descanso, notas
```

Esto es lo que resuelve el pedido de "distintas etapas dentro de un
entrenamiento" (entrada en calor, movilidad, etc.): son **bloques**
reordenables y renombrables por la admin, no un tipo fijo — `type` es solo
una etiqueta semántica opcional para que el diseño pueda elegir un ícono o
color por categoría, el nombre visible siempre es libre.

Ver tipos exactos en [src/types/index.ts](src/types/index.ts).

## 3. Modelo de datos (Firestore)

- `users/{uid}` — perfil: `role` (`admin`|`usuaria`), `displayName`, `email`,
  `trainingDays` (qué días de la semana entrena esta usuaria).
- `invites/{code}` — invitación generada por la admin (alta sin
  auto-registro libre): nombre, días de entrenamiento, usada/no usada.
- `routines/{uid}` — **un documento por usuaria** con el árbol completo
  `days → bloques → ejercicios` descrito arriba.
- `progress/{uid}/entries/{entryId}` — una entrada por ejercicio completado:
  día, bloque, ejercicio, y la lista de series realmente hechas
  (`{ setNumber, reps, weightKg }` por serie), con timestamp.

Reglas de seguridad ya publicadas en `firestore.rules` (admin ve/edita todo,
usuaria ve y edita solo lo suyo).

## 4. Roles y pantallas

### Admin
| Ruta | Qué muestra / permite |
|---|---|
| `/admin` | Resumen: lista de usuarias con último entrenamiento. |
| `/admin/usuarias` | Lista completa + formulario para generar invitación (nombre + días de entrenamiento) → produce un link `/invite/{code}`. |
| `/admin/usuarias/[uid]` | Perfil de la usuaria + accesos a su rutina y su progreso. |
| `/admin/usuarias/[uid]/rutina` | **Editor de rutina por bloques**: elegís un día (de los configurados para esa usuaria), ves sus bloques en orden, agregás/editás/borrás/reordenás bloques, y dentro de cada bloque agregás/editás/borrás/reordenás ejercicios (series, reps, peso, descanso, notas). Guarda todo el día de un saque. |
| `/admin/usuarias/[uid]/progreso` | Mismo historial que ve la usuaria, pero de ella. |

### Usuaria
| Ruta | Qué muestra / permite |
|---|---|
| `/login` | Login con email/contraseña. |
| `/invite/[code]` | Alta: ve su nombre precargado, elige contraseña, se crea su cuenta y queda vinculada a la invitación. |
| `/dia/[dayId]` | Rutina del día: bloques en orden, y dentro de cada uno sus ejercicios. Por cada ejercicio: cronómetro para medir el tiempo del ejercicio, carga de reps/peso logrado por serie, y temporizador de descanso que arranca solo al terminar una serie. |
| `/progreso` | Su propio historial: entradas pasadas agrupadas por fecha/ejercicio. |

## 5. Interacciones clave

- **Cronómetro de ejercicio**: arranca/pausa/resetea, cuenta tiempo transcurrido mientras la usuaria hace la serie.
- **Descanso entre series**: temporizador de cuenta regresiva que se dispara automáticamente al guardar una serie, con la duración definida en `restSeconds` de ese ejercicio (o un default si no está seteado).
- **Registro de serie**: por cada serie, la usuaria carga reps y peso usado; se guarda como `LoggedSet` dentro de un `ProgressEntry` para ese ejercicio/día.
- **Reordenar bloques/ejercicios**: la admin puede subir/bajar bloques y ejercicios dentro de un bloque (no hace falta drag&drop real, con botones de mover arriba/abajo alcanza funcionalmente).

## 6. Estructura de carpetas (código)

```
src/
  app/
    login/                          login
    invite/[code]/                  alta por invitación
    admin/
      page.tsx                      dashboard admin
      usuarias/page.tsx             listado + generar invitación
      usuarias/[uid]/page.tsx       perfil de usuaria
      usuarias/[uid]/rutina/page.tsx   editor de rutina por bloques
      usuarias/[uid]/progreso/page.tsx progreso (vista admin)
    dia/[dayId]/page.tsx            rutina del día (usuaria)
    progreso/page.tsx               progreso propio (usuaria)
    api/                            endpoints (session, invites, routines, progress)
  components/
    auth/            AuthProvider, RequireRole
    routine/         BlockEditor, ExerciseEditor, RoutineDayPicker
    training/        ExerciseRunner, Stopwatch, RestTimer, SetLogger
    progress/        ProgressList
  lib/
    firebase/        client.ts, admin.ts
    auth/            session.ts (server), useAuth.ts (client)
    data/            routines.ts, progress.ts, invites.ts, users.ts (fetch helpers)
    weekdays.ts      utilidades de día de semana
  types/index.ts     modelos compartidos
```

Los componentes de `components/routine`, `components/training` y
`components/progress` se construyen **sin estética** (HTML semántico,
mínimas clases de layout) — el chat de diseño los viste reusando lo que ya
armó en `components/ui` y `components/brand`, sin tocar su lógica interna
ni sus props.

## 7. Estado de avance

- [x] Modelo de datos con bloques (`src/types/index.ts`)
- [x] Capa de acceso a datos cliente (`src/lib/data/*`, `src/lib/auth/useAuth.ts`)
- [x] Login + alta por invitación funcionales
- [x] Editor de rutina por bloques (admin)
- [x] Vista del día + cronómetro + descanso + registro de series (usuaria)
- [x] Vista de progreso/historial
