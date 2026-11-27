# Validaciones visuales

La app avisa con luz qué está pasando, para que se entienda **de reojo**, con el
celular apoyado en el piso o en un banco.

Para probarlas todas: **`/validaciones`** (no hace falta entrar con una cuenta).

## El código de colores

| Color | Hex | Quiere decir |
|---|---|---|
| **Lima limón** | `#E5FF00` | Avanzá · arrancó · salió bien |
| **Rosa flúor** | `#FF0A8A` | Frená · descansá · atención |
| **Rosa y lima alternados** | los dos | Cambio importante: levantá la vista |
| **Celeste flúor** | `#00F0FF` | Agua |
| **Rosa de marca** | `#FF2E92` | Solo se abrió algo |

**Por qué estos dos.** El rosa flúor es el magenta de la marca llevado a su punto
más encendido. El lima flúor (verde amarillento, también llamado *chartreuse*) es
su pareja clásica en la ropa deportiva: se distingue enseguida del rosa y es muy
luminoso sobre el fondo casi negro. Sobre ambos, el texto va en el negro de la
marca (`#0A0208`).

El lima y el rosa flúor son **exclusivos de las validaciones y las fases**: no se usan en
botones ni decoración, para que cuando aparezcan signifiquen algo.

## Las dos fases del entrenamiento

Se tienen que reconocer desde lejos, sin leer. Estos diseños son **únicos**: no
se repiten en ninguna otra pantalla.

| | Actividad | Descanso |
|---|---|---|
| Fondo | Lima limón | Rosa flúor |
| Palabra fija arriba | **¡DALE!** | **DESCANSO** |
| Dibujo | Franjas diagonales que avanzan | Círculo que respira |
| Número gigante | Repeticiones | Cuenta regresiva y barra que se vacía |
| Al entrar suena | Tonos que **suben** | Tonos que **bajan** |

### La pantalla también cambia

Además del destello que aparece encima, el cronómetro y el descanso cambian sus
propios números y fondo (como mucho un cambio por segundo):

| Momento | Qué cambia |
|---|---|
| Iniciar o pausar el cronómetro | El bloque, los números y el fondo alternan rosa y lima 3 veces |
| Cronómetro en marcha | Bloque negro con números lima; cada 10 s los números destellan |
| Cronómetro en pausa | Bloque rosa |
| Primeros 4 s de descanso | Alterna fondo rosa / números rosa sobre negro |
| Últimos 10 s | Vuelve a alternar |
| Últimos 3 s | Pasa a lima: preparate |

Con "reducir movimiento" no hay parpadeos del cronómetro, y con los destellos
apagados el descanso queda fijo.

## Sonidos

Se generan en el celular (sin archivos). Subir de tono es "arrancá"; bajar es
"frená".

| Momento | Sonido |
|---|---|
| Arranca el entrenamiento | 3 tonos que suben |
| Empieza el descanso | 3 tonos que bajan |
| Quedan 3, 2, 1 | un pitido por segundo |
| Termina el descanso | 3 pitidos y uno largo, agudo |
| Se suma agua / meta de agua | 2 / 4 tonos agudos que suben |
| Serie hecha | 1 pitido |
| Ejercicio completo | 2 tonos que suben |
| Entrenamiento completo | fanfarria de 4 tonos |
| Cronómetro: arranca / pausa | 2 tonos que suben / bajan |
| Se guardó algo | 1 pitido |
| Error | 2 tonos graves |

Abrir, agregar y eliminar no suenan. Se apagan con el botón **Sonido** (arriba
durante el entrenamiento, o junto al ajuste de destellos), aparte de los
destellos. El navegador recién permite sonar después del primer toque: si se
recarga la pantalla, no suena hasta tocar algo. En iPhone, el modo silencio
puede dejarlos mudos.

## Transiciones y cargas

Cambiar de pantalla **no destella**: se nota por la animación.

| | Qué pasa |
|---|---|
| **Avanzar** | El contenido entra de derecha a izquierda; el fondo y una franja a rayas cruzan de izquierda a derecha |
| **Volver** (botón atrás o subir de nivel) | Todo al revés |
| **Armado** | Las piezas y las filas de las listas aparecen una atrás de otra (menos de medio segundo en total) |
| **Carga** | `PosterLoader`: rayas de cebra en diagonal (rosa, lima, magenta y pastel) que caen y llenan la pantalla, con "Esperá" |

```tsx
<PosterLoader label="Cargando tu rutina" />   {/* pantalla completa */}
<PosterLoader variant="block" />              {/* dentro de la página */}
```

Las transiciones y la carga se ven **siempre**, también con "reducir movimiento"
(los parpadeos y destellos sí lo respetan). La carga se prueba en `/validaciones`.

## Dos formas

- **Pantalla completa**, con una palabra gigante: momentos que se tienen que ver
  de lejos.
- **Marco** en el borde: confirmaciones que no deben tapar lo que estás haciendo.

## Cada momento

| Momento | Señal | Forma | Color | Pulsos | Texto | Vibración |
|---|---|---|---|---|---|---|
| Se suma agua | `waterAdd` | Marco | Celeste | 2 | +250 ml / +500 ml | corto |
| Meta de agua completa | `waterDone` | Completa | Celeste | 3 | ¡Agua completa! | 2 toques |
| Arranca el entrenamiento | `trainingStart` | Completa | Lima | 2 | ¡Vamos! | 2 toques |
| Empieza el descanso | `restStart` | Completa | Rosa | 1 | Descansá | 1 toque |
| Quedan 3, 2, 1 | `countdown` | Marco | Lima | 1 por segundo | — | corto |
| **Termina el descanso** | `restEnd` | Completa | **Rosa y lima** | 4 | ¡Dale! | 3 largos |
| Serie hecha (sin descanso) | `setDone` | Marco | Lima | 1 | Serie ✓ | corto |
| Ejercicio completo | `exerciseDone` | Completa | Lima | 2 | Ejercicio listo | 2 toques |
| **Entrenamiento completo** | `workoutDone` | Completa | **Rosa y lima** | 4 | ¡Lo hiciste! | festejo |
| Arranca el cronómetro | `timerStart` | Marco | Lima | 2 | En marcha | corto |
| Cronómetro en pausa | `timerPause` | Marco | Rosa | 1 | Pausa | corto |
| Se guardó o se creó algo | `success` | Marco | Lima | 2 | Listo ✓ | corto |
| Se agregó o recuperó algo en la rutina | `added` | Marco | Lima | 1 | Agregado ✓ | — |
| Se eliminó o deshizo algo | `removed` | Marco | Rosa | 1 | Eliminado | — |
| Algo falló | `error` | Completa | Rosa | 2 | No se pudo | 2 largos |
| Se abre un panel | `open` | Marco fino | Rosa de marca | 1 | — | — |

Cuando una serie completa el ejercicio o el día, suena solo la señal más
importante. `success` acompaña al aviso escrito de arriba (cuenta creada,
invitación generada, link copiado, rutina guardada, vinculación).

El color nunca es la única pista: casi todas las señales llevan palabra y cada
una tiene su forma y cantidad de pulsos.

## Prioridad

Si dos señales coinciden, gana la más importante; una de menor prioridad no
interrumpe a la que se está viendo. De mayor a menor: fin de descanso,
entrenamiento completo y error · inicio, descanso y ejercicio completo ·
guardado y cuenta regresiva · series, cronómetro, agregar y eliminar · abrir.

## Seguridad y preferencias

- **Destellos lentos:** un pulso cada 450 ms (unos 2,2 por segundo), por debajo
  del límite de 3 por segundo que se recomienda para personas con
  fotosensibilidad. No bajar `PULSE_MS` de 340.
- Para ver los destellos completos en Windows: Configuración → Accesibilidad →
  activar los efectos de animación. En el celular, desactivar "reducir
  movimiento".
- **"Reducir movimiento"** activado en el celular: no hay parpadeo ni pantalla
  llena; aparece un único marco con la palabra.
- **Ajuste en la app** (menú del alumno, pantalla Alumnos del entrenador y
  `/validaciones`):
  - *Completos:* lo descrito arriba.
  - *Suaves:* todo en marco, sin vibración.
  - *Apagados:* sin destellos ni vibración.
  Se guarda en cada celular.
- Los destellos nunca bloquean los toques.

## Límites del celular

- Durante el entrenamiento la app pide **mantener la pantalla encendida**. Si el
  navegador no lo permite (por ejemplo, con poca batería) y la pantalla se
  apaga, no se ve nada.
- Con la app en segundo plano no hay destellos. Al volver, el fin del descanso se
  avisa solo si pasaron menos de 15 segundos.
- La **vibración** depende del navegador: Safari en iPhone no la admite.
- No hay notificaciones push.

## Para quien programa

```ts
import { signal } from "@/lib/signals";

signal("success");
signal("countdown", "3"); // con texto propio
```

| Archivo | Contenido |
|---|---|
| `src/lib/signals.ts` | Catálogo de señales, prioridades, preferencia |
| `src/components/ui/SignalLayer.tsx` | Capa que las dibuja, montada en el layout |
| `src/app/globals.css` | Colores (`--signal-go`, `--signal-stop`) y animaciones |
| `src/app/validaciones/page.tsx` | Muestrario |

Para sumar una: agregarla en `SIGNALS`, describirla en `MOMENTS` del muestrario y
en la tabla de arriba.
