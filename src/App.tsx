import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  CheckCheck,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import {
  addHundredDayHabit,
  addNewSeparateChallenge,
  applyTaskTemplate,
  calculateDailyMetrics,
  carryOverRemainingWorkToNextDay,
  CATEGORY_LABELS,
  ChallengeCheckIcon,
  ChallengeGoalMode,
  ChallengeNotificationTone,
  createCustomCategory,
  CreateSeparateChallengeOptions,
  createTask,
  CreateTaskInput,
  CustomCategory,
  deleteSeparateChallenge,
  deleteTaskById,
  filterAndSortTasks,
  generateTaskAlerts,
  getChallengesList,
  HundredDaysState,
  INITIAL_HUNDRED_DAYS_STATE,
  INITIAL_TASKS,
  partitionTasksByCompletion,
  recordFocusMinutes,
  removeHundredDayHabit,
  reorderHundredDayHabit,
  rescheduleTaskDate,
  selectSeparateChallenge,
  shouldTriggerChallengeReminder,
  StatusFilter,
  Task,
  TaskFilterState,
  TaskIconName,
  TimeBlock,
  TIME_BLOCK_LABELS,
  TODAY_DATE_STR,
  toggleHundredDayCompletion,
  toggleSubTaskCompletion,
  toggleTaskCompletion,
  toggleTaskStar,
  updateChallengeConfig,
  updateChallengeDayGoal,
  updateTaskById,
  updateTaskIcon,
} from './utils/taskLogic';
import { playChallengeNotificationTone } from './utils/soundTones';
import { TopBar, WorkspaceTab } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { QuickAddTaskBar } from './components/QuickAddTaskBar';
import { TaskRow } from './components/TaskRow';
import { TimelineView } from './components/TimelineView';
import { FocusTimerView } from './components/FocusTimerView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { HundredDaysView } from './components/HundredDaysView';
import { CloudVpsModal } from './components/CloudVpsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  auth,
  deleteTaskFromFirestore,
  onAuthStateChanged,
  saveHundredDaysBoardToFirestore,
  saveTaskToFirestore,
  signInWithGoogle,
  signOutFromGoogle,
  subscribeToUserFirestoreData,
  User,
  wipeUserTasksInFirestore,
} from './firebase';

const STORAGE_KEY = 'hussein_alaa_tasks_v1';
const HUNDRED_STORAGE_KEY = 'hussein_alaa_hundred_v1';
const CUSTOM_CATEGORIES_KEY = 'hussein_alaa_custom_categories_v1';
const THEME_STORAGE_KEY = 'hussein_alaa_theme_royal_v1';
const LEGACY_KEYS_TO_PURGE = [
  'minjaz_daily_tasks_v1',
  'minjaz_daily_tasks_v2',
  'minjaz_hundred_days_v1',
];

export default function App() {
  // Purge any old data keys from previous versions on initialization
  useEffect(() => {
    try {
      for (const oldKey of LEGACY_KEYS_TO_PURGE) {
        localStorage.removeItem(oldKey);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to clean empty state
    }
    return INITIAL_TASKS;
  });

  const [hundredState, setHundredState] = useState<HundredDaysState>(() => {
    try {
      const saved = localStorage.getItem(HUNDRED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          Array.isArray(parsed.habits) &&
          Array.isArray(parsed.completedDays)
        ) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_HUNDRED_DAYS_STATE;
  });

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    () => {
      try {
        const saved = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // Fallback
      }
      return [];
    }
  );

  // Default to Royal Black & Gold (dark = true)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light') return false;
      return true;
    } catch {
      return true;
    }
  });

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('list');
  const [filters, setFilters] = useState<TaskFilterState>({
    searchQuery: '',
    status: 'all',
    category: 'all',
    timeBlock: 'all',
    priority: 'all',
    sortBy: 'priority',
  });

  const [focusTaskId, setFocusTaskId] = useState<string | null>(
    INITIAL_TASKS[0]?.id ?? null
  );

  // Deep Focus Mode State (hides all notifications & alerts until timer ends)
  const [isDeepFocusMode, setIsDeepFocusMode] = useState<boolean>(false);

  // Cloud & VPS Sync State
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudConnected, setCloudConnected] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [vpsEndpoint, setVpsEndpoint] = useState<string>('');
  const isApplyingRemoteUpdate = useRef<boolean>(false);
  const clientDeviceId = useRef<string>(
    `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const tasksRef = useRef<Task[]>(tasks);
  tasksRef.current = tasks;
  const hundredRef = useRef<HundredDaysState>(hundredState);
  hundredRef.current = hundredState;

  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultBlock, setModalDefaultBlock] = useState<TimeBlock>('morning');
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(TODAY_DATE_STR);

  // Push local state changes to Unified Cloud & VPS Bridge
  const pushStateToUnifiedCloud = useCallback(
    async (nextTasks: Task[], nextHundred: HundredDaysState) => {
      try {
        const res = await fetch('/api/cloud-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks: nextTasks,
            hundredState: nextHundred,
            deviceId: clientDeviceId.current,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.state?.updatedAt) {
            setLastSyncedAt(data.state.updatedAt);
          }
          setCloudConnected(true);
        }
      } catch {
        // Offline fallback remains functional via localStorage
      }
    },
    []
  );

  // Subscribe to Unified Real-Time Cloud Stream (SSE) across all devices
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/cloud-stream');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // Ignore self-originated echoes so rapid local add/delete operations are never overwritten
          if (
            payload?.deviceId &&
            payload.deviceId === clientDeviceId.current
          ) {
            return;
          }

          if (payload && Array.isArray(payload.tasks) && payload.hundredState) {
            // On initial SSE handshake (!payload.deviceId), if server is empty but user has local tasks, push local tasks to server instead of wiping them
            if (
              !payload.deviceId &&
              payload.tasks.length === 0 &&
              tasksRef.current.length > 0
            ) {
              pushStateToUnifiedCloud(tasksRef.current, hundredRef.current);
              setCloudConnected(true);
              return;
            }

            isApplyingRemoteUpdate.current = true;
            tasksRef.current = payload.tasks;
            setTasks(payload.tasks);
            setHundredState((prev) => ({
              ...prev,
              ...payload.hundredState,
              challenges:
                payload.hundredState.challenges ?? prev.challenges,
            }));
            if (payload.updatedAt) {
              setLastSyncedAt(payload.updatedAt);
            }
            if (typeof payload.vpsEndpoint === 'string') {
              setVpsEndpoint(payload.vpsEndpoint);
            }
            setCloudConnected(true);
            setTimeout(() => {
              isApplyingRemoteUpdate.current = false;
            }, 60);
          }
        } catch {
          // Ignore malformed event
        }
      };
      eventSource.onerror = () => {
        setCloudConnected(false);
      };
    } catch {
      // Ignore if SSE unavailable
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [pushStateToUnifiedCloud]);

  // Subscribe to Google Cloud Firebase Auth & Firestore Real-Time Sync
  useEffect(() => {
    let unsubData: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (unsubData) {
        unsubData();
        unsubData = null;
      }
      if (user) {
        setCloudConnected(true);
        unsubData = subscribeToUserFirestoreData(
          user.uid,
          (remoteTasks) => {
            if (remoteTasks.length === 0 && tasksRef.current.length > 0) {
              for (const localTask of tasksRef.current) {
                saveTaskToFirestore(localTask, user.uid, true).catch(() => {});
              }
              return;
            }
            isApplyingRemoteUpdate.current = true;
            tasksRef.current = remoteTasks;
            setTasks(remoteTasks);
            setLastSyncedAt(new Date().toISOString());
            setTimeout(() => {
              isApplyingRemoteUpdate.current = false;
            }, 60);
          },
          (completedDays, habitTitles) => {
            isApplyingRemoteUpdate.current = true;
            setHundredState((prev) => ({
              ...prev,
              completedDays,
              habits: habitTitles.map((title, idx) => ({
                id: prev.habits[idx]?.id || `habit-${idx + 1}`,
                title,
                targetMinutes: prev.habits[idx]?.targetMinutes || 30,
              })),
            }));
            setLastSyncedAt(new Date().toISOString());
            setTimeout(() => {
              isApplyingRemoteUpdate.current = false;
            }, 60);
          }
        );
      }
    });
    return () => {
      if (unsubData) unsubData();
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(HUNDRED_STORAGE_KEY, JSON.stringify(hundredState));
    } catch {
      // Ignore
    }
  }, [hundredState]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CUSTOM_CATEGORIES_KEY,
        JSON.stringify(customCategories)
      );
    } catch {
      // Ignore
    }
  }, [customCategories]);

  const handleCreateCustomCategory = useCallback(
    (label: string, iconColor: string, icon: TaskIconName): CustomCategory => {
      const result = createCustomCategory(
        customCategories,
        label,
        iconColor,
        icon
      );
      setCustomCategories(result.categories);
      return result.created;
    },
    [customCategories]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [isDark]);

  const metrics = useMemo(() => calculateDailyMetrics(tasks), [tasks]);
  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, filters),
    [tasks, filters]
  );
  const { activeTasks: activeVisibleTasks, completedTasks: completedVisibleTasks } =
    useMemo(() => partitionTasksByCompletion(visibleTasks), [visibleTasks]);
  const alerts = useMemo(
    () => generateTaskAlerts(tasks, '08:15', TODAY_DATE_STR),
    [tasks]
  );

  const handleUpdateFilter = (patch: Partial<TaskFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'all',
      category: 'all',
      timeBlock: 'all',
      priority: 'all',
      sortBy: 'priority',
    });
  };

  const applyLocalTasksUpdate = (nextTasks: Task[]) => {
    tasksRef.current = nextTasks;
    setTasks(nextTasks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
    } catch {
      // Ignore storage errors
    }
  };

  const syncAfterTaskChange = (
    nextTasks: Task[],
    changedTask?: Task,
    isNew = false
  ) => {
    if (!isApplyingRemoteUpdate.current) {
      pushStateToUnifiedCloud(nextTasks, hundredRef.current);
      if (currentUser && changedTask) {
        saveTaskToFirestore(changedTask, currentUser.uid, isNew).catch(() => {});
      }
    }
  };

  const handleAddTask = (input: CreateTaskInput) => {
    const newTask = createTask(input);
    const next = [newTask, ...tasksRef.current];
    applyLocalTasksUpdate(next);
    // Ensure active filters never hide the newly created task
    setFilters((prev) => ({
      ...prev,
      searchQuery: '',
      status:
        prev.status === 'completed' ||
        (prev.status === 'urgent' && newTask.priority !== 'urgent') ||
        (prev.status === 'starred' && !newTask.starred)
          ? 'all'
          : prev.status,
      category:
        prev.category !== 'all' && prev.category !== newTask.category
          ? 'all'
          : prev.category,
      timeBlock:
        prev.timeBlock !== 'all' && prev.timeBlock !== newTask.timeBlock
          ? 'all'
          : prev.timeBlock,
      priority:
        prev.priority !== 'all' && prev.priority !== newTask.priority
          ? 'all'
          : prev.priority,
    }));
    syncAfterTaskChange(next, newTask, true);
  };

  const handleToggleComplete = (taskId: string) => {
    const next = toggleTaskCompletion(tasksRef.current, taskId);
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    if (
      updated?.completed &&
      (filters.status === 'active' || filters.status === 'urgent')
    ) {
      setFilters((prev) => ({ ...prev, status: 'all' }));
    }
    syncAfterTaskChange(next, updated, false);
  };

  const handleUpdateTaskNotes = (taskId: string, notes: string) => {
    const next = updateTaskById(tasksRef.current, taskId, { notes });
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    syncAfterTaskChange(next, updated, false);
  };

  const handleCarryOverToNextDay = (taskId: string, remainingNotes: string) => {
    const { tasks: next, createdTask } = carryOverRemainingWorkToNextDay(
      tasksRef.current,
      taskId,
      remainingNotes
    );
    const updatedSource = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    if (!isApplyingRemoteUpdate.current) {
      pushStateToUnifiedCloud(next, hundredRef.current);
      if (currentUser) {
        if (updatedSource) {
          saveTaskToFirestore(updatedSource, currentUser.uid, false).catch(
            () => {}
          );
        }
        if (createdTask) {
          saveTaskToFirestore(createdTask, currentUser.uid, true).catch(
            () => {}
          );
        }
      }
    }
  };

  const handleToggleStar = (taskId: string) => {
    const next = toggleTaskStar(tasksRef.current, taskId);
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    syncAfterTaskChange(next, updated, false);
  };

  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    const next = toggleSubTaskCompletion(tasksRef.current, taskId, subTaskId);
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    syncAfterTaskChange(next, updated, false);
  };

  const handleDeleteTask = (taskId: string) => {
    const next = deleteTaskById(tasksRef.current, taskId);
    applyLocalTasksUpdate(next);
    if (!isApplyingRemoteUpdate.current) {
      pushStateToUnifiedCloud(next, hundredRef.current);
      if (currentUser) {
        deleteTaskFromFirestore(taskId).catch(() => {});
      }
    }
  };

  const handleDeleteCompletedTasks = () => {
    const completedIds = tasksRef.current
      .filter((t) => t.completed)
      .map((t) => t.id);
    if (completedIds.length === 0) return;
    const next = tasksRef.current.filter((t) => !t.completed);
    applyLocalTasksUpdate(next);
    if (!isApplyingRemoteUpdate.current) {
      pushStateToUnifiedCloud(next, hundredRef.current);
      if (currentUser) {
        for (const id of completedIds) {
          deleteTaskFromFirestore(id).catch(() => {});
        }
      }
    }
  };

  const handleDeleteAllTasks = () => {
    const allIds = tasksRef.current.map((t) => t.id);
    if (allIds.length === 0) return;
    const next: Task[] = [];
    applyLocalTasksUpdate(next);
    if (!isApplyingRemoteUpdate.current) {
      pushStateToUnifiedCloud(next, hundredRef.current);
      if (currentUser) {
        for (const id of allIds) {
          deleteTaskFromFirestore(id).catch(() => {});
        }
      }
    }
  };

  const handleUpdateExistingTask = (
    taskId: string,
    patch: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    const next = updateTaskById(tasksRef.current, taskId, patch);
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    syncAfterTaskChange(next, updated, false);
  };

  const handleRescheduleTaskDate = (taskId: string, newDueDate: string) => {
    const next = rescheduleTaskDate(tasksRef.current, taskId, newDueDate);
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    syncAfterTaskChange(next, updated, false);
  };

  const handleRecordFocusMinutes = (taskId: string, minutes: number) => {
    const next = recordFocusMinutes(tasksRef.current, taskId, minutes);
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    syncAfterTaskChange(next, updated, false);
  };

  const handleStartFocusOnTask = (task: Task) => {
    setFocusTaskId(task.id);
    setActiveTab('focus');
  };

  const handleOpenNewModal = (
    block: TimeBlock = 'morning',
    dateStr: string = TODAY_DATE_STR
  ) => {
    setEditingTask(null);
    setModalDefaultBlock(block);
    setModalDefaultDate(dateStr);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleMarkAllActiveCompleted = () => {
    const next = tasksRef.current.map((t) => ({ ...t, completed: true }));
    applyLocalTasksUpdate(next);
    if (!isApplyingRemoteUpdate.current) {
      pushStateToUnifiedCloud(next, hundredRef.current);
      if (currentUser) {
        for (const t of next) {
          saveTaskToFirestore(t, currentUser.uid, false).catch(() => {});
        }
      }
    }
  };

  const handleSelectCustomIcon = (taskId: string, iconName: TaskIconName) => {
    const next = updateTaskIcon(tasksRef.current, taskId, iconName);
    const updated = next.find((t) => t.id === taskId);
    applyLocalTasksUpdate(next);
    syncAfterTaskChange(next, updated, false);
  };

  // Challenges Board Handlers with Cloud Sync
  const applyLocalHundredUpdate = (nextHundred: HundredDaysState) => {
    hundredRef.current = nextHundred;
    setHundredState(nextHundred);
    try {
      localStorage.setItem(HUNDRED_STORAGE_KEY, JSON.stringify(nextHundred));
    } catch {
      // Ignore
    }
  };

  const syncAfterHundredChange = (nextHundred: HundredDaysState) => {
    if (!isApplyingRemoteUpdate.current) {
      pushStateToUnifiedCloud(tasksRef.current, nextHundred);
      if (currentUser) {
        saveHundredDaysBoardToFirestore(nextHundred, currentUser.uid).catch(
          () => {}
        );
      }
    }
  };

  const handleToggleHundredDay = (dayNum: number) => {
    const next = toggleHundredDayCompletion(hundredRef.current, dayNum);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  const handleAddHundredHabit = (title: string, targetMinutes: number) => {
    const next = addHundredDayHabit(hundredRef.current, title, targetMinutes);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  const handleRemoveHundredHabit = (habitId: string) => {
    const next = removeHundredDayHabit(hundredRef.current, habitId);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  const handleReorderHundredHabit = (
    habitId: string,
    direction: 'up' | 'down'
  ) => {
    const next = reorderHundredDayHabit(hundredRef.current, habitId, direction);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  const handleUpdateChallengeConfig = (patch: {
    totalDays?: number;
    challengeTitle?: string;
    goalDescription?: string;
    goalMode?: ChallengeGoalMode;
    generalGoal?: string;
    checkIcon?: ChallengeCheckIcon;
    dayGoals?: Record<number, string>;
    reminderTime?: string;
    reminderEnabled?: boolean;
    reminderTone?: ChallengeNotificationTone;
    motivationalMessage?: string;
  }) => {
    const next = updateChallengeConfig(hundredRef.current, patch);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  // Global Background Multi-Challenge Notification Tone Listener (plays each challenge's distinct tone even outside the Challenges tab)
  const notifiedChallengeStampsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const checkAllChallengesReminders = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;
      const list = getChallengesList(hundredState);

      for (const ch of list) {
        const stamp = `${ch.id}-${currentHHMM}`;
        if (notifiedChallengeStampsRef.current.has(stamp)) continue;
        const check = shouldTriggerChallengeReminder(ch, currentHHMM);
        if (check.shouldNotify) {
          notifiedChallengeStampsRef.current.add(stamp);
          playChallengeNotificationTone(check.reminderTone);
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification(check.title, {
                body: check.message,
                tag: ch.id,
              });
            } catch {
              // Ignore
            }
          }
        }
      }
    };

    checkAllChallengesReminders();
    const timer = window.setInterval(checkAllChallengesReminders, 20000);
    return () => window.clearInterval(timer);
  }, [hundredState]);

  const handleUpdateChallengeDayGoal = (dayNumber: number, goalText: string) => {
    const next = updateChallengeDayGoal(hundredRef.current, dayNumber, goalText);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  // Trigger password prompt every time the user clicks the Challenges icon
  const [challengeLockTrigger, setChallengeLockTrigger] = useState<number>(0);

  const handleSelectWorkspaceTab = (tab: WorkspaceTab) => {
    if (tab === 'hundred') {
      setChallengeLockTrigger((prev) => prev + 1);
    }
    setActiveTab(tab);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore
    }
  };

  // Apply ready-made task template with a single click
  const handleApplyTaskTemplate = (templateId: string) => {
    const prev = tasksRef.current;
    const next = applyTaskTemplate(prev, templateId, TODAY_DATE_STR);
    const addedCount = next.length - prev.length;
    if (addedCount > 0) {
      applyLocalTasksUpdate(next);
      handleResetFilters();
      if (!isApplyingRemoteUpdate.current) {
        pushStateToUnifiedCloud(next, hundredRef.current);
        if (currentUser) {
          const addedTasks = next.slice(0, addedCount);
          for (const t of addedTasks) {
            saveTaskToFirestore(t, currentUser.uid, true).catch(() => {});
          }
        }
      }
    }
  };

  // Multi-challenge list handlers (>4 separate challenges)
  const handleSelectSeparateChallenge = (challengeId: string) => {
    const next = selectSeparateChallenge(hundredRef.current, challengeId);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  const handleAddNewSeparateChallenge = (
    title: string,
    totalDays: number,
    checkIcon: ChallengeCheckIcon,
    options?: CreateSeparateChallengeOptions
  ) => {
    const next = addNewSeparateChallenge(
      hundredRef.current,
      title,
      totalDays,
      checkIcon,
      options
    );
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  const handleDeleteSeparateChallenge = (challengeId: string) => {
    const next = deleteSeparateChallenge(hundredRef.current, challengeId);
    applyLocalHundredUpdate(next);
    syncAfterHundredChange(next);
  };

  // Format / Wipe All Data Handler
  const handleFormatAllData = async () => {
    const emptyTasks: Task[] = [];
    const emptyHundred: HundredDaysState = {
      habits: [],
      completedDays: [],
      totalDays: 100,
      challengeTitle: 'جدول التحديات الملكي',
      goalDescription: '',
      checkIcon: 'check',
    };
    setTasks(emptyTasks);
    setHundredState(emptyHundred);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HUNDRED_STORAGE_KEY);
      for (const oldKey of LEGACY_KEYS_TO_PURGE) {
        localStorage.removeItem(oldKey);
      }
    } catch {
      // Ignore
    }
    try {
      await fetch('/api/cloud-sync', { method: 'DELETE' });
    } catch {
      // Ignore
    }
    if (currentUser) {
      await wipeUserTasksInFirestore(currentUser.uid).catch(() => {});
    }
  };

  const handleSaveVpsEndpoint = async (url: string): Promise<string> => {
    setVpsEndpoint(url);
    const res = await fetch('/api/vps-bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vpsEndpoint: url }),
    });
    const data = await res.json();
    return data.message || 'تم ربط خادم VPS بنجاح.';
  };

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'active', label: 'قيد التنفيذ' },
    { id: 'urgent', label: 'عاجل' },
    { id: 'starred', label: 'مميزة' },
    { id: 'completed', label: 'مكتملة' },
  ];

  const hasActiveFilter =
    filters.searchQuery.trim() !== '' ||
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.timeBlock !== 'all' ||
    filters.priority !== 'all';

  return (
    <div
      id="top"
      className="min-h-dvh w-full flex flex-col select-none bg-[#FAF8F5] dark:bg-[#07080B] text-zinc-900 dark:text-zinc-100"
    >
      {/* Top Bar with all Workspace Pages */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectWorkspaceTab}
        onOpenNewTaskModal={() => handleOpenNewModal('morning', TODAY_DATE_STR)}
      />

      {/* Unified App Shell: Smoothly Scrollable Main Viewport + Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {activeTab !== 'hundred' && (
          <Sidebar
            filters={filters}
            metrics={metrics}
            hundredCompletedCount={hundredState.completedDays.length}
            hundredTotalDays={hundredState.totalDays ?? 100}
            activeTab={activeTab}
            isDark={isDark}
            onUpdateFilter={handleUpdateFilter}
            onSelectTab={handleSelectWorkspaceTab}
            onToggleTheme={() => setIsDark((prev) => !prev)}
          />
        )}

        <main className="order-2 flex-1 min-w-0 p-4 sm:p-6 space-y-6">
          {activeTab === 'hundred' ? (
            <HundredDaysView
              state={hundredState}
              lockTriggerKey={challengeLockTrigger}
              onToggleDay={handleToggleHundredDay}
              onAddHabit={handleAddHundredHabit}
              onRemoveHabit={handleRemoveHundredHabit}
              onReorderHabit={handleReorderHundredHabit}
              onUpdateChallengeConfig={handleUpdateChallengeConfig}
              onUpdateDayGoal={handleUpdateChallengeDayGoal}
              onSelectSeparateChallenge={handleSelectSeparateChallenge}
              onAddNewSeparateChallenge={handleAddNewSeparateChallenge}
              onDeleteSeparateChallenge={handleDeleteSeparateChallenge}
              onBackToTasks={() => setActiveTab('list')}
            />
          ) : (
            <>
              {activeTab === 'list' && (
                <div className="space-y-6">
                  {/* Page Header & Contextual Date */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        مهام المهندس حسين علاء · الإدارة اليومية الموحدة
                      </p>
                      <h1 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-balance royal-gold-text">
                        مهام اليوم والأولويات
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                      <span>
                        المتبقية:{' '}
                        <strong className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                          {metrics.pendingCount}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        الوقت المتبقي:{' '}
                        <strong className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                          {metrics.remainingMinutes} د
                        </strong>
                      </span>
                      {metrics.pendingCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={handleMarkAllActiveCompleted}
                            className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer whitespace-nowrap"
                          >
                            <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>إكمال الكل</span>
                          </button>
                        </>
                      )}
                      {metrics.completedCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={handleDeleteCompletedTasks}
                            className="inline-flex items-center gap-1 font-semibold text-red-500 dark:text-red-400 hover:underline cursor-pointer whitespace-nowrap"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>حذف المكتملة</span>
                          </button>
                        </>
                      )}
                      {metrics.totalCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={handleDeleteAllTasks}
                            className="inline-flex items-center gap-1 font-semibold text-red-500 dark:text-red-400 hover:underline cursor-pointer whitespace-nowrap"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>حذف جميع المهام</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Inline Task Creation Bar with Custom Category & Unique Icon Color */}
                  <QuickAddTaskBar
                    defaultCategory={filters.category !== 'all' ? filters.category : 'work'}
                    defaultTimeBlock={filters.timeBlock !== 'all' ? filters.timeBlock : 'morning'}
                    customCategories={customCategories}
                    onCreateCustomCategory={handleCreateCustomCategory}
                    onAddTask={handleAddTask}
                  />

                  {/* Filter & Search Toolbar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                    {/* Interactive Segmented Status Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        role="group"
                        aria-label="تصفية حسب الحالة"
                        className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-[#111217] border border-amber-500/25 rounded-lg"
                      >
                        {statusTabs.map((tab) => {
                          const active = filters.status === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => handleUpdateFilter({ status: tab.id })}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                active
                                  ? 'royal-gold-btn shadow-xs'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-amber-300'
                              }`}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {filters.category !== 'all' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateFilter({ category: 'all' })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-amber-300 bg-white dark:bg-[#121318] border border-amber-500/30 rounded-lg cursor-pointer"
                        >
                          <span>التصنيف: {CATEGORY_LABELS[filters.category]}</span>
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}

                      {filters.timeBlock !== 'all' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateFilter({ timeBlock: 'all' })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-amber-300 bg-white dark:bg-[#121318] border border-amber-500/30 rounded-lg cursor-pointer"
                        >
                          <span>الفترة: {TIME_BLOCK_LABELS[filters.timeBlock].title}</span>
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {/* Search Input & Sort Selector */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-1 sm:w-60">
                        <Search
                          className="w-4 h-4 text-amber-500/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          aria-hidden="true"
                        />
                        <label htmlFor="task-search-input" className="sr-only">
                          البحث في المهام
                        </label>
                        <input
                          id="task-search-input"
                          type="search"
                          value={filters.searchQuery}
                          onChange={(e) =>
                            handleUpdateFilter({ searchQuery: e.target.value })
                          }
                          placeholder="ابحث في المهام الصباحية أو المسائية..."
                          className="w-full pr-9 pl-3 py-1.5 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <ArrowUpDown
                          className="w-3.5 h-3.5 text-amber-500 hidden sm:inline"
                          aria-hidden="true"
                        />
                        <label htmlFor="task-sort-select" className="sr-only">
                          ترتيب المهام حسب
                        </label>
                        <select
                          id="task-sort-select"
                          value={filters.sortBy}
                          onChange={(e) =>
                            handleUpdateFilter({
                              sortBy: e.target.value as TaskFilterState['sortBy'],
                            })
                          }
                          aria-label="ترتيب المهام"
                          className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-[#121318] text-zinc-800 dark:text-amber-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="priority">الترتيب: الأولوية</option>
                          <option value="time">الترتيب: الوقت المجدول</option>
                          <option value="duration">الترتيب: المدة الأطول</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Active Tasks List Container */}
                  <section
                    aria-label="قائمة المهام"
                    className="bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/25 rounded-xl overflow-hidden"
                  >
                    {visibleTasks.length === 0 ? (
                      <div className="px-6 py-14 text-center">
                        <p className="text-base font-bold text-zinc-800 dark:text-amber-200 font-display">
                          قائمة مهام المهندس حسين علاء فارغة حالياً وجاهزة للبدء
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                          أضف مهامك الصباحية أو المسائية الآن وسيتم حفظها تلقائياً.
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                          {hasActiveFilter && (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>إعادة ضبط الفلاتر</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenNewModal('morning', TODAY_DATE_STR)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                            <span>إضافة مهمة جديدة</span>
                          </button>
                        </div>
                      </div>
                    ) : activeVisibleTasks.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-display">
                          تم إنجاز جميع المهام النشطة! انتقلت المهام المكتملة إلى القسم الخاص أسفل القائمة.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="px-4 py-2.5 bg-zinc-50/80 dark:bg-[#0C0D12] border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 dark:text-amber-300 font-display">
                            المهام النشطة وقيد التنفيذ ({activeVisibleTasks.length})
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            اضغط «البدء» لتشغيل العداد أو «الإنجاز» لنقل المهمة لقسم المكتملة بالأسفل
                          </span>
                        </div>
                        {activeVisibleTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onToggleStar={handleToggleStar}
                            onToggleSubTask={handleToggleSubTask}
                            onStartFocus={handleStartFocusOnTask}
                            onEditTask={handleOpenEditModal}
                            onDeleteTask={handleDeleteTask}
                            onSelectCustomIcon={handleSelectCustomIcon}
                            onUpdateTaskNotes={handleUpdateTaskNotes}
                            onCarryOverToNextDay={handleCarryOverToNextDay}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Dedicated Completed Tasks Section at the Bottom of the List (قسم خاص للمهام المكتملة أسفل القائمة) */}
                  {completedVisibleTasks.length > 0 && (
                    <section
                      aria-label="قسم المهام المكتملة"
                      className="bg-white dark:bg-[#0D0E14] border border-emerald-500/35 dark:border-amber-500/35 rounded-xl overflow-hidden space-y-0"
                    >
                      <div className="px-4 py-3 bg-gradient-to-l from-emerald-500/15 via-amber-500/10 to-transparent border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCheck
                            className="w-4 h-4 text-emerald-500 dark:text-amber-400 shrink-0"
                            aria-hidden="true"
                          />
                          <div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
                              قسم المهام المكتملة ({completedVisibleTasks.length})
                            </h2>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              تنتقل المهام المنجزة تلقائياً إلى هذا القسم أسفل القائمة — يمكنك كتابة ما تبقى من الأعمال وتحويلها إلى اليوم الثاني
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDeleteCompletedTasks}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>حذف المكتملة</span>
                        </button>
                      </div>

                      <div>
                        {completedVisibleTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onToggleStar={handleToggleStar}
                            onToggleSubTask={handleToggleSubTask}
                            onStartFocus={handleStartFocusOnTask}
                            onEditTask={handleOpenEditModal}
                            onDeleteTask={handleDeleteTask}
                            onSelectCustomIcon={handleSelectCustomIcon}
                            onUpdateTaskNotes={handleUpdateTaskNotes}
                            onCarryOverToNextDay={handleCarryOverToNextDay}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'calendar' && (
                <MonthlyCalendarView
                  tasks={tasks}
                  onRescheduleTask={handleRescheduleTaskDate}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={handleDeleteTask}
                  onAddNewTaskOnDate={(dateStr) => handleOpenNewModal('morning', dateStr)}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineView
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onStartFocus={handleStartFocusOnTask}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={handleDeleteTask}
                  onOpenNewTaskForBlock={(block) =>
                    handleOpenNewModal(block, TODAY_DATE_STR)
                  }
                />
              )}

              {activeTab === 'focus' && (
                <FocusTimerView
                  tasks={tasks}
                  selectedTaskId={focusTaskId}
                  isDeepFocusMode={isDeepFocusMode}
                  onToggleDeepFocusMode={setIsDeepFocusMode}
                  onSelectTask={setFocusTaskId}
                  onToggleComplete={handleToggleComplete}
                  onToggleSubTask={handleToggleSubTask}
                  onRecordFocusMinutes={handleRecordFocusMinutes}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView metrics={metrics} tasks={tasks} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskDetailModal
        isOpen={isModalOpen}
        editingTask={editingTask}
        defaultTimeBlock={modalDefaultBlock}
        defaultDueDate={modalDefaultDate}
        onClose={() => setIsModalOpen(false)}
        onSaveNew={handleAddTask}
        onUpdateExisting={handleUpdateExistingTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Google Cloud & VPS Sync Modal */}
      <CloudVpsModal
        isOpen={isCloudModalOpen}
        currentUser={currentUser}
        cloudConnected={cloudConnected}
        lastSyncedAt={lastSyncedAt}
        vpsEndpoint={vpsEndpoint}
        onClose={() => setIsCloudModalOpen(false)}
        onSignInGoogle={async () => {
          const res = await signInWithGoogle();
          return res.errorMessage;
        }}
        onSignOutGoogle={async () => {
          await signOutFromGoogle();
        }}
        onSaveVpsEndpoint={handleSaveVpsEndpoint}
        onFormatAllData={handleFormatAllData}
      />

      <OfflineIndicator
        cloudConnected={cloudConnected}
        lastSyncedAt={lastSyncedAt}
        onTriggerManualSync={() => pushStateToUnifiedCloud(tasks, hundredState)}
      />
    </div>
  );
}
