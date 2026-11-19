import type { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "usuaria";

export type WeekDay =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

/** Firestore: users/{uid} */
export interface AppUser {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string | null;
  createdAt: Timestamp;
  trainingDays: WeekDay[];
}

/** Firestore: invites/{code} */
export interface Invite {
  code: string;
  displayName: string;
  trainingDays: WeekDay[];
  createdBy: string;
  createdAt: Timestamp;
  usedBy: string | null;
  usedAt: Timestamp | null;
  expiresAt: Timestamp | null;
}

/** One exercise inside a routine day */
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

/** Firestore: routines/{uid}, one doc per usuaria holding all her days */
export interface Routine {
  uid: string;
  updatedAt: Timestamp;
  days: Partial<Record<WeekDay, RoutineExercise[]>>;
}

/** One logged set inside a progress entry */
export interface LoggedSet {
  setNumber: number;
  reps: number;
  weightKg: number | null;
}

/** Firestore: progress/{uid}/entries/{entryId}, one per completed exercise instance */
export interface ProgressEntry {
  id: string;
  uid: string;
  day: WeekDay;
  exerciseId: string;
  exerciseName: string;
  performedAt: Timestamp;
  sets: LoggedSet[];
}
