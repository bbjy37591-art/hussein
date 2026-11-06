import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { HundredDaysState, Task } from './utils/taskLogic';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle(): Promise<{
  user: User | null;
  errorMessage?: string;
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  } catch (error: unknown) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : '';
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      return {
        user: null,
        errorMessage:
          'تم إغلاق نافذة تسجيل الدخول قبل استكمال المصادقة. المزامنة السحابية الموحدة لا تزال نشطة وتعمل تلقائياً.',
      };
    }
    if (code === 'auth/popup-blocked') {
      return {
        user: null,
        errorMessage:
          'قام المتصفح بحظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع ثم المحاولة مرة أخرى.',
      };
    }
    return {
      user: null,
      errorMessage:
        'تعذر إتمام تسجيل الدخول عبر نافذة جوجل حالياً. المزامنة السحابية الموحدة نشطة وتعمل تلقائياً.',
    };
  }
}

export async function signOutFromGoogle(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Ignore sign-out errors
  }
}

export { onAuthStateChanged };
export type { User };

const knownRemoteTaskIds = new Set<string>();

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128) || 'task-default';
}

export async function saveTaskToFirestore(
  task: Task,
  userId: string,
  isNew: boolean
): Promise<void> {
  const cleanId = sanitizeId(task.id);
  const path = `tasks/${cleanId}`;
  const shouldCreate = isNew || !knownRemoteTaskIds.has(cleanId);
  const payload = {
    id: cleanId,
    ownerId: userId,
    title: task.title.trim().slice(0, 300) || 'مهمة',
    notes: (task.notes || '').slice(0, 2000),
    completed: Boolean(task.completed),
    priority: task.priority,
    category: task.category,
    timeBlock: task.timeBlock,
    scheduledTime: (task.scheduledTime || '09:00').slice(0, 10),
    dueDate: (task.dueDate || '2026-11-05').slice(0, 16),
    estimatedMinutes: Math.max(1, Math.min(480, Number(task.estimatedMinutes) || 30)),
    actualMinutesFocused: Math.max(
      0,
      Math.min(10000, Number(task.actualMinutesFocused) || 0)
    ),
    starred: Boolean(task.starred),
    ...(shouldCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'tasks', cleanId), payload, { merge: !shouldCreate });
    knownRemoteTaskIds.add(cleanId);
  } catch (error) {
    handleFirestoreError(
      error,
      shouldCreate ? OperationType.CREATE : OperationType.UPDATE,
      path
    );
  }
}

export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  const cleanId = sanitizeId(taskId);
  if (!knownRemoteTaskIds.has(cleanId)) {
    return;
  }
  const path = `tasks/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'tasks', cleanId));
    knownRemoteTaskIds.delete(cleanId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function wipeUserTasksInFirestore(userId: string): Promise<void> {
  const path = 'tasks';
  try {
    const q = query(collection(db, 'tasks'), where('ownerId', '==', userId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'tasks', d.id));
      knownRemoteTaskIds.delete(d.id);
    }
    await deleteDoc(doc(db, 'hundredDaysBoards', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveHundredDaysBoardToFirestore(
  state: HundredDaysState,
  userId: string
): Promise<void> {
  const path = `hundredDaysBoards/${userId}`;
  const completedDays = state.completedDays
    .filter((d) => typeof d === 'number' && d >= 1 && d <= 100)
    .slice(0, 100);
  const habitTitles = state.habits
    .map((h) => h.title.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 20);

  try {
    await setDoc(doc(db, 'hundredDaysBoards', userId), {
      ownerId: userId,
      completedDays,
      habitTitles,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToUserFirestoreData(
  userId: string,
  onTasksUpdate: (tasks: Task[]) => void,
  onHundredUpdate: (completedDays: number[], habitTitles: string[]) => void
): () => void {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('ownerId', '==', userId)
  );

  const unsubTasks = onSnapshot(
    tasksQuery,
    (snapshot) => {
      knownRemoteTaskIds.clear();
      const loaded: Task[] = snapshot.docs.map((d) => {
        const data = d.data();
        const resolvedId = data.id || d.id;
        knownRemoteTaskIds.add(resolvedId);
        return {
          id: resolvedId,
          title: data.title || '',
          notes: data.notes || '',
          completed: Boolean(data.completed),
          priority: data.priority || 'medium',
          category: data.category || 'work',
          timeBlock: data.timeBlock || 'morning',
          scheduledTime: data.scheduledTime || '09:00',
          dueDate: data.dueDate || '2026-11-05',
          estimatedMinutes: Number(data.estimatedMinutes) || 30,
          actualMinutesFocused: Number(data.actualMinutesFocused) || 0,
          starred: Boolean(data.starred),
          subTasks: [],
          createdAt: new Date().toISOString(),
        };
      });
      onTasksUpdate(loaded);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    }
  );

  const boardRef = doc(db, 'hundredDaysBoards', userId);
  const unsubBoard = onSnapshot(
    boardRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onHundredUpdate(
          Array.isArray(data.completedDays) ? data.completedDays : [],
          Array.isArray(data.habitTitles) ? data.habitTitles : []
        );
      }
    },
    (error) => {
      handleFirestoreError(
        error,
        OperationType.GET,
        `hundredDaysBoards/${userId}`
      );
    }
  );

  return () => {
    unsubTasks();
    unsubBoard();
  };
}
