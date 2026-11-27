import type { Timestamp } from "firebase/firestore";
import type { DoneEntry } from "@/lib/completion";

export type UserRole = "admin" | "usuaria";

/** Etiqueta semántica opcional de un bloque, para íconos/colores en el diseño. El nombre visible siempre es libre (block.name). */
export type BlockType =
  | "calentamiento"
  | "movilidad"
  | "principal"
  | "core"
  | "cardio"
  | "estiramiento"
  | "otro";

/** Firestore: users/{uid} */
export interface AppUser {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string | null;
  /** Alumnos: uid de su entrenador (null o ausente si no está vinculado). Admins: null. */
  adminId?: string | null;
  /** Alumno creado por el entrenador que todavía no tiene cuenta. */
  pending?: boolean;
  /** Link vigente de un alumno pendiente. */
  inviteCode?: string;
  createdAt: Timestamp;
}

/** Alumno con los datos que muestra el panel del entrenador. */
export interface AlumnoSummary extends AppUser {
  hasRoutine: boolean;
  /** Milisegundos del último ejercicio registrado (null si nunca entrenó). */
  lastTrainedAt: number | null;
  days: RoutineDay[];
  /** Registros recientes, para calcular en el cliente qué completó. */
  recent: DoneEntry[];
}

/** Firestore: invites/{code} */
export interface Invite {
  code: string;
  /** Perfil de alumno al que da acceso (las invitaciones viejas no tienen). */
  studentId?: string;
  displayName: string;
  createdBy: string;
  createdAt: Timestamp;
  usedBy: string | null;
  usedAt: Timestamp | null;
  expiresAt: Timestamp | null;
}

/** Un ejercicio dentro de un bloque de un día de rutina. */
export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  targetReps: number;
  targetWeightKg: number | null;
  restSeconds: number;
  notes: string | null;
  order: number;
}

/** Una etapa/bloque de un día de entrenamiento (ej: "Entrada en calor"). */
export interface WorkoutBlock {
  id: string;
  name: string;
  type: BlockType;
  order: number;
  exercises: RoutineExercise[];
}

/**
 * Un "día" de la rutina: no es un día de la semana, es un entrenamiento con
 * nombre libre que define la admin (ej: "Día 1 - Pecho", "Full body A"). La
 * usuaria elige cuál de estos días hacer cada vez que entrena.
 */
export interface RoutineDay {
  id: string;
  name: string;
  order: number;
  blocks: WorkoutBlock[];
}

/** Firestore: routines/{uid}, un doc por usuaria con todos sus días. */
export interface Routine {
  uid: string;
  updatedAt: Timestamp;
  days: RoutineDay[];
}

/** Una serie realmente realizada, cargada por la usuaria. */
export interface LoggedSet {
  setNumber: number;
  reps: number;
  weightKg: number | null;
}

/** Firestore: progress/{uid}/entries/{entryId}, una por ejercicio completado. */
export interface ProgressEntry {
  id: string;
  uid: string;
  dayId: string;
  dayName: string;
  blockId: string;
  blockName: string;
  exerciseId: string;
  exerciseName: string;
  performedAt: Timestamp;
  sets: LoggedSet[];
}
