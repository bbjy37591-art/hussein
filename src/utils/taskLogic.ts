export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Category = 'work' | 'personal' | 'health' | 'learning';
export type TimeBlock = 'morning' | 'afternoon' | 'evening';
export type StatusFilter = 'all' | 'active' | 'completed' | 'starred' | 'urgent';

export type TaskIconName =
  | 'briefcase'
  | 'laptop'
  | 'target'
  | 'rocket'
  | 'book'
  | 'graduation'
  | 'brain'
  | 'lightbulb'
  | 'user'
  | 'home'
  | 'coffee'
  | 'sparkles'
  | 'heart'
  | 'dumbbell'
  | 'flame'
  | 'crown';

export type ChallengeCheckIcon =
  | 'check'
  | 'crown'
  | 'star'
  | 'flame'
  | 'gem'
  | 'trophy'
  | 'shield';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CustomCategory {
  id: string;
  label: string;
  iconColor: string; // Hex color e.g. '#10B981'
  icon: TaskIconName;
}

export const CUSTOM_CATEGORY_COLOR_PALETTE: {
  id: string;
  label: string;
  hex: string;
}[] = [
  { id: 'gold', label: 'ذهبي ملكي', hex: '#F59E0B' },
  { id: 'emerald', label: 'زمردي أخضر', hex: '#10B981' },
  { id: 'sky', label: 'أزرق سماوي', hex: '#38BDF8' },
  { id: 'violet', label: 'بنفسجي ملكي', hex: '#A855F7' },
  { id: 'rose', label: 'ياقوتي وردي', hex: '#F43F5E' },
  { id: 'teal', label: 'فيروزي', hex: '#14B8A6' },
  { id: 'orange', label: 'عنبري مشرق', hex: '#F97316' },
];

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  customCategoryId?: string;
  customCategoryLabel?: string;
  customIcon?: TaskIconName;
  customIconColor?: string;
  timeBlock: TimeBlock;
  scheduledTime: string; // e.g., "09:00"
  dueDate: string; // YYYY-MM-DD, e.g., "2026-11-05"
  estimatedMinutes: number;
  actualMinutesFocused: number;
  starred: boolean;
  subTasks: SubTask[];
  createdAt: string;
}

export interface TaskFilterState {
  searchQuery: string;
  status: StatusFilter;
  category: Category | 'all';
  customCategoryId?: string | 'all';
  timeBlock: TimeBlock | 'all';
  priority: Priority | 'all';
  sortBy: 'priority' | 'time' | 'duration';
}

export interface DailyMetrics {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  starredCount: number;
  completionPercentage: number;
  totalEstimatedMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  urgentPendingCount: number;
  totalFocusedMinutes: number;
  byTimeBlock: Record<TimeBlock, { total: number; completed: number; minutes: number }>;
  byCategory: Record<Category, { total: number; completed: number; minutes: number }>;
}

export interface TaskAlert {
  id: string;
  taskId?: string;
  title: string;
  subtitle: string;
  scheduledTime: string;
  severity: 'urgent' | 'upcoming' | 'timeblock';
}

export interface HundredDayHabit {
  id: string;
  title: string;
  targetMinutes: number;
}

export type ChallengeGoalMode = 'general' | 'custom_per_day';

export type ChallengeNotificationTone =
  | 'royal-chime'
  | 'crystal-harp'
  | 'emerald-pulse'
  | 'zen-bell'
  | 'victory-fanfare'
  | 'digital-radar';

export interface ChallengeNotificationToneOption {
  id: ChallengeNotificationTone;
  label: string;
  description: string;
  frequencies: number[];
  noteDurationMs: number;
  waveType: 'sine' | 'triangle';
}

export const CHALLENGE_NOTIFICATION_TONES: ChallengeNotificationToneOption[] = [
  {
    id: 'royal-chime',
    label: 'الرنين الملكي الذهبي (Royal Chime)',
    description: 'نغمة ثلاثية صاعدة هادئة ومميزة لتحدي الانضباط الرئيسي',
    frequencies: [523.25, 659.25, 783.99, 1046.5],
    noteDurationMs: 130,
    waveType: 'triangle',
  },
  {
    id: 'victory-fanfare',
    label: 'شارة النصر الهندسي (Victory Fanfare)',
    description: 'نغمة حماسية رباعية لتحديات التطوير والمشاريع الهندسية',
    frequencies: [523.25, 523.25, 659.25, 783.99, 1046.5],
    noteDurationMs: 115,
    waveType: 'triangle',
  },
  {
    id: 'emerald-pulse',
    label: 'نبض الإنجاز السريع (Emerald Pulse)',
    description: 'إيقاع مزدوج حيوي لتحديات اللياقة والنشاط البدني',
    frequencies: [440, 880, 554.37, 1108.73],
    noteDurationMs: 105,
    waveType: 'sine',
  },
  {
    id: 'crystal-harp',
    label: 'نغمة الكريستال الصباحية (Crystal Harp)',
    description: 'نغمة رقراقة متتابعة مناسبة لتحديات القراءة والمعرفة',
    frequencies: [587.33, 739.99, 880, 1174.66],
    noteDurationMs: 140,
    waveType: 'sine',
  },
  {
    id: 'zen-bell',
    label: 'جرس التركيز العميق (Zen Bell)',
    description: 'رنين عميق متدرج لتحديات التركيز والأهداف الخاصة',
    frequencies: [392, 587.33, 783.99],
    noteDurationMs: 190,
    waveType: 'sine',
  },
  {
    id: 'digital-radar',
    label: 'تنبيه الرادار الذكي (Smart Radar)',
    description: 'تنبيه واضح وسريع للتمييز الفوري للتحديات المسائية',
    frequencies: [659.25, 987.77, 659.25, 1318.51],
    noteDurationMs: 95,
    waveType: 'triangle',
  },
];

export function getChallengeNotificationToneOption(
  tone?: ChallengeNotificationTone
): ChallengeNotificationToneOption {
  return (
    CHALLENGE_NOTIFICATION_TONES.find((t) => t.id === tone) ??
    CHALLENGE_NOTIFICATION_TONES[0]
  );
}

export interface ChallengeBoardItem {
  id: string;
  challengeTitle: string;
  goalDescription: string;
  goalMode?: ChallengeGoalMode; // 'general' (هدف عام لجميع الأيام) | 'custom_per_day' (هدف خاص لكل يوم)
  generalGoal?: string; // خانة الأهداف العامة الموحدة لجميع الأيام
  totalDays: number; // 1..100
  completedDays: number[];
  habits: HundredDayHabit[];
  checkIcon: ChallengeCheckIcon;
  dayGoals: Record<number, string>;
  reminderTime?: string; // HH:MM daily reminder time
  reminderEnabled?: boolean;
  reminderTone?: ChallengeNotificationTone; // نغمة إشعار مخصصة لهذا التحدي
  motivationalMessage?: string; // رسالة تحفيزية مخصصة تظهر مع كل إشعار يومي
}

export interface CreateSeparateChallengeOptions {
  goalMode?: ChallengeGoalMode;
  generalGoal?: string;
  dayGoals?: Record<number, string>;
  reminderTime?: string;
  reminderEnabled?: boolean;
  reminderTone?: ChallengeNotificationTone;
  motivationalMessage?: string;
}

export interface HundredDaysState {
  habits: HundredDayHabit[];
  completedDays: number[]; // Day numbers 1..totalDays
  totalDays?: number; // 1..100
  challengeTitle?: string;
  goalDescription?: string;
  goalMode?: ChallengeGoalMode;
  generalGoal?: string;
  checkIcon?: ChallengeCheckIcon;
  dayGoals?: Record<number, string>; // Per-day custom goals (dayNumber -> goal text)
  reminderTime?: string; // HH:MM daily reminder time (e.g. "20:00")
  reminderEnabled?: boolean;
  reminderTone?: ChallengeNotificationTone; // نغمة الإشعار المخصصة للتحدي النشط
  motivationalMessage?: string; // رسالة تحفيزية مخصصة تظهر مع كل إشعار يومي
  challenges?: ChallengeBoardItem[];
  activeChallengeId?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  icon: TaskIconName;
  tasks: CreateTaskInput[];
}

export interface HundredDaysMetrics {
  totalDays: number;
  completedDaysCount: number;
  remainingDaysCount: number;
  completionPercentage: number;
  habitsCount: number;
  totalCompletedActions: number;
  totalPlannedActions: number;
  totalMinutesInvested: number;
  currentStreak: number;
  longestStreak: number;
  phases: {
    label: string;
    range: string;
    completed: number;
    total: number;
    percentage: number;
  }[];
}

export const TODAY_DATE_STR = '2026-11-05';

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'عاجل',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'هادئ',
};

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'العمل والمشاريع',
  personal: 'شخصي ومنزلي',
  health: 'الصحة واللياقة',
  learning: 'الدراسة والتطوير',
};

export const DEFAULT_CATEGORY_ICON: Record<Category, TaskIconName> = {
  work: 'briefcase',
  learning: 'graduation',
  personal: 'user',
  health: 'heart',
};

export const CATEGORY_ICON_OPTIONS: {
  id: TaskIconName;
  label: string;
  group: string;
}[] = [
  { id: 'briefcase', label: 'حقيبة عمل', group: 'عمل' },
  { id: 'laptop', label: 'حاسوب وبرمجة', group: 'عمل' },
  { id: 'target', label: 'هدف استراتيجي', group: 'عمل' },
  { id: 'rocket', label: 'إطلاق مشروع', group: 'عمل' },
  { id: 'graduation', label: 'دراسة أكاديمية', group: 'دراسة' },
  { id: 'book', label: 'قراءة ومراجعة', group: 'دراسة' },
  { id: 'brain', label: 'تركيز ذهني', group: 'دراسة' },
  { id: 'lightbulb', label: 'فكرة وابتكار', group: 'دراسة' },
  { id: 'user', label: 'مهمة شخصية', group: 'شخصي' },
  { id: 'home', label: 'منزل وعائلة', group: 'شخصي' },
  { id: 'coffee', label: 'لقاء واستراحة', group: 'شخصي' },
  { id: 'sparkles', label: 'عناية وتنظيم', group: 'شخصي' },
  { id: 'heart', label: 'صحة وعافية', group: 'صحة وملكي' },
  { id: 'dumbbell', label: 'تمرين رياضي', group: 'صحة وملكي' },
  { id: 'flame', label: 'حماس وطاقة', group: 'صحة وملكي' },
  { id: 'crown', label: 'أولوية ملكية', group: 'صحة وملكي' },
];

export const TIME_BLOCK_LABELS: Record<TimeBlock, { title: string; range: string }> = {
  morning: { title: 'الفترة الصباحية', range: '06:00 – 12:00' },
  afternoon: { title: 'فترة الظهيرة', range: '12:00 – 17:00' },
  evening: { title: 'الفترة المسائية', range: '17:00 – 22:00' },
};

export interface CreateTaskInput {
  title: string;
  notes?: string;
  priority?: Priority;
  category?: Category;
  customCategoryId?: string;
  customCategoryLabel?: string;
  customIcon?: TaskIconName;
  customIconColor?: string;
  timeBlock?: TimeBlock;
  scheduledTime?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  starred?: boolean;
  subTasks?: SubTask[];
}

export function createTask(input: CreateTaskInput, customId?: string): Task {
  const cleanTitle = input.title.trim();
  if (!cleanTitle) {
    throw new Error('عنوان المهمة مطلوب ولا يمكن أن يكون فارغاً');
  }

  const est =
    typeof input.estimatedMinutes === 'number' && input.estimatedMinutes > 0
      ? Math.min(480, Math.round(input.estimatedMinutes))
      : 30;

  const defaultTimeByBlock: Record<TimeBlock, string> = {
    morning: '09:30',
    afternoon: '14:00',
    evening: '19:00',
  };

  const block = input.timeBlock ?? 'morning';
  const cat = input.category ?? 'work';

  return {
    id: customId ?? `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: cleanTitle,
    notes: (input.notes ?? '').trim(),
    completed: false,
    priority: input.priority ?? 'medium',
    category: cat,
    customCategoryId: input.customCategoryId,
    customCategoryLabel: input.customCategoryLabel?.trim() || undefined,
    customIcon: input.customIcon ?? DEFAULT_CATEGORY_ICON[cat],
    customIconColor: input.customIconColor,
    timeBlock: block,
    scheduledTime: input.scheduledTime ?? defaultTimeByBlock[block],
    dueDate: input.dueDate ?? TODAY_DATE_STR,
    estimatedMinutes: est,
    actualMinutesFocused: 0,
    starred: Boolean(input.starred),
    subTasks: input.subTasks ? [...input.subTasks] : [],
    createdAt: new Date().toISOString(),
  };
}

export function createCustomCategory(
  existing: CustomCategory[],
  label: string,
  iconColor: string,
  icon: TaskIconName = 'sparkles'
): { categories: CustomCategory[]; created: CustomCategory } {
  const cleanLabel = label.trim();
  if (!cleanLabel) {
    throw new Error('اسم التصنيف المخصص مطلوب');
  }
  const cleanColor = /^#[0-9A-Fa-f]{6}$/.test(iconColor.trim())
    ? iconColor.trim()
    : '#F59E0B';

  const duplicate = existing.find(
    (c) => c.label.toLowerCase() === cleanLabel.toLowerCase()
  );
  if (duplicate) {
    const updated: CustomCategory = {
      ...duplicate,
      iconColor: cleanColor,
      icon,
    };
    return {
      categories: existing.map((c) => (c.id === duplicate.id ? updated : c)),
      created: updated,
    };
  }

  const created: CustomCategory = {
    id: `custom-cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: cleanLabel,
    iconColor: cleanColor,
    icon,
  };
  return {
    categories: [...existing, created],
    created,
  };
}

export function updateTaskIcon(
  tasks: Task[],
  taskId: string,
  iconName: TaskIconName
): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, customIcon: iconName } : task
  );
}

export function toggleTaskCompletion(tasks: Task[], taskId: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      completed: !task.completed,
    };
  });
}

export function toggleTaskStar(tasks: Task[], taskId: string): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, starred: !task.starred } : task
  );
}

export function rescheduleTaskDate(
  tasks: Task[],
  taskId: string,
  newDueDate: string
): Task[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDueDate)) return tasks;
  return tasks.map((task) =>
    task.id === taskId ? { ...task, dueDate: newDueDate } : task
  );
}

export function toggleSubTaskCompletion(
  tasks: Task[],
  taskId: string,
  subTaskId: string
): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const updatedSubTasks = task.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    return {
      ...task,
      subTasks: updatedSubTasks,
    };
  });
}

export function addSubTaskToTask(
  tasks: Task[],
  taskId: string,
  subTaskTitle: string,
  customSubId?: string
): Task[] {
  const clean = subTaskTitle.trim();
  if (!clean) return tasks;
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const newSub: SubTask = {
      id: customSubId ?? `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: clean,
      completed: false,
    };
    return {
      ...task,
      subTasks: [...task.subTasks, newSub],
    };
  });
}

export function deleteSubTaskFromTask(
  tasks: Task[],
  taskId: string,
  subTaskId: string
): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      subTasks: task.subTasks.filter((st) => st.id !== subTaskId),
    };
  });
}

export function updateTaskById(
  tasks: Task[],
  taskId: string,
  patch: Partial<Omit<Task, 'id' | 'createdAt'>>
): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const nextTitle = patch.title !== undefined ? patch.title.trim() : task.title;
    return {
      ...task,
      ...patch,
      title: nextTitle || task.title,
    };
  });
}

export function deleteTaskById(tasks: Task[], taskId: string): Task[] {
  return tasks.filter((task) => task.id !== taskId);
}

export function recordFocusMinutes(
  tasks: Task[],
  taskId: string,
  minutes: number
): Task[] {
  if (minutes <= 0) return tasks;
  return tasks.map((task) =>
    task.id === taskId
      ? { ...task, actualMinutesFocused: task.actualMinutesFocused + minutes }
      : task
  );
}

export function filterAndSortTasks(
  tasks: Task[],
  filters: TaskFilterState
): Task[] {
  const query = filters.searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (filters.status === 'active' && task.completed) return false;
    if (filters.status === 'completed' && !task.completed) return false;
    if (filters.status === 'starred' && !task.starred) return false;
    if (filters.status === 'urgent' && (task.priority !== 'urgent' || task.completed)) return false;

    if (filters.category !== 'all' && task.category !== filters.category) {
      return false;
    }

    if (filters.timeBlock !== 'all' && task.timeBlock !== filters.timeBlock) {
      return false;
    }

    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    if (query) {
      const inTitle = task.title.toLowerCase().includes(query);
      const inNotes = task.notes.toLowerCase().includes(query);
      const inSubs = task.subTasks.some((s) => s.title.toLowerCase().includes(query));
      if (!inTitle && !inNotes && !inSubs) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (filters.sortBy === 'priority') {
      const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }

    if (filters.sortBy === 'time') {
      const timeCmp = a.scheduledTime.localeCompare(b.scheduledTime);
      if (timeCmp !== 0) return timeCmp;
      return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    }

    if (filters.sortBy === 'duration') {
      return b.estimatedMinutes - a.estimatedMinutes;
    }

    return 0;
  });
}

export function calculateDailyMetrics(tasks: Task[]): DailyMetrics {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const starredCount = tasks.filter((t) => t.starred).length;
  const completionPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  let totalEstimatedMinutes = 0;
  let completedMinutes = 0;
  let remainingMinutes = 0;
  let urgentPendingCount = 0;
  let totalFocusedMinutes = 0;

  const byTimeBlock: DailyMetrics['byTimeBlock'] = {
    morning: { total: 0, completed: 0, minutes: 0 },
    afternoon: { total: 0, completed: 0, minutes: 0 },
    evening: { total: 0, completed: 0, minutes: 0 },
  };

  const byCategory: DailyMetrics['byCategory'] = {
    work: { total: 0, completed: 0, minutes: 0 },
    personal: { total: 0, completed: 0, minutes: 0 },
    health: { total: 0, completed: 0, minutes: 0 },
    learning: { total: 0, completed: 0, minutes: 0 },
  };

  for (const task of tasks) {
    totalEstimatedMinutes += task.estimatedMinutes;
    totalFocusedMinutes += task.actualMinutesFocused;

    if (task.completed) {
      completedMinutes += task.estimatedMinutes;
    } else {
      remainingMinutes += task.estimatedMinutes;
      if (task.priority === 'urgent') {
        urgentPendingCount += 1;
      }
    }

    byTimeBlock[task.timeBlock].total += 1;
    byTimeBlock[task.timeBlock].minutes += task.estimatedMinutes;
    if (task.completed) {
      byTimeBlock[task.timeBlock].completed += 1;
    }

    byCategory[task.category].total += 1;
    byCategory[task.category].minutes += task.estimatedMinutes;
    if (task.completed) {
      byCategory[task.category].completed += 1;
    }
  }

  return {
    totalCount,
    completedCount,
    pendingCount,
    starredCount,
    completionPercentage,
    totalEstimatedMinutes,
    completedMinutes,
    remainingMinutes,
    urgentPendingCount,
    totalFocusedMinutes,
    byTimeBlock,
    byCategory,
  };
}

function parseMinutesFromTime(timeStr: string): number {
  const [hh, mm] = timeStr.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
  return hh * 60 + mm;
}

export function getActiveTimeBlockForMinutes(totalMinutes: number): TimeBlock {
  if (totalMinutes < 12 * 60) return 'morning';
  if (totalMinutes < 17 * 60) return 'afternoon';
  return 'evening';
}

export function generateTaskAlerts(
  tasks: Task[],
  referenceTimeStr = '08:15',
  referenceDateStr = TODAY_DATE_STR
): TaskAlert[] {
  const refMins = parseMinutesFromTime(referenceTimeStr);
  const activeBlock = getActiveTimeBlockForMinutes(refMins);
  const alerts: TaskAlert[] = [];

  // 1. Urgent or imminent tasks due on referenceDateStr
  const dueTodayTasks = tasks.filter(
    (t) => !t.completed && t.dueDate === referenceDateStr
  );

  for (const task of dueTodayTasks) {
    const taskMins = parseMinutesFromTime(task.scheduledTime);
    const diff = taskMins - refMins;

    if (task.priority === 'urgent' || (diff >= -30 && diff <= 120)) {
      alerts.push({
        id: `alert-task-${task.id}`,
        taskId: task.id,
        title:
          diff >= 0 && diff <= 60
            ? `اقترب موعد المهمة (خلال ${diff} دقيقة): ${task.title}`
            : task.priority === 'urgent'
            ? `مهمة عاجلة مجدولة اليوم (${task.scheduledTime}): ${task.title}`
            : `تذكير بموعد المهمة (${task.scheduledTime}): ${task.title}`,
        subtitle: `${TIME_BLOCK_LABELS[task.timeBlock].title} · ${CATEGORY_LABELS[task.category]} · ${task.estimatedMinutes} دقيقة`,
        scheduledTime: task.scheduledTime,
        severity: task.priority === 'urgent' ? 'urgent' : 'upcoming',
      });
    }
  }

  // 2. Scheduled time-block reminder
  const activeBlockTasks = dueTodayTasks.filter((t) => t.timeBlock === activeBlock);
  if (activeBlockTasks.length > 0) {
    alerts.push({
      id: `alert-block-${activeBlock}`,
      title: `تنبيه الفترة الزمنية النشطة: ${TIME_BLOCK_LABELS[activeBlock].title}`,
      subtitle: `لديك ${activeBlockTasks.length} مهام مجدولة في هذه الفترة (${TIME_BLOCK_LABELS[activeBlock].range}) بإجمالي ${activeBlockTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0)} دقيقة.`,
      scheduledTime: TIME_BLOCK_LABELS[activeBlock].range,
      severity: 'timeblock',
    });
  }

  return alerts;
}

// ============================================================================
// Customizable Multi-Challenges Board (>4 Separate Challenge Lists, 1..100 Days)
// ============================================================================

export const DEFAULT_SEPARATE_CHALLENGES: ChallengeBoardItem[] = [
  {
    id: 'challenge-1',
    challengeTitle: 'التحدي الأول: الانضباط والروتين الملكي',
    goalDescription: 'بناء الانضباط اليومي والالتزام بالعادات الأساسية دون انقطاع.',
    goalMode: 'general',
    generalGoal: 'بناء الانضباط اليومي والالتزام بالعادات الأساسية دون انقطاع.',
    totalDays: 100,
    completedDays: [],
    habits: [],
    checkIcon: 'crown',
    dayGoals: {},
    reminderTime: '20:00',
    reminderEnabled: true,
    reminderTone: 'royal-chime',
  },
  {
    id: 'challenge-2',
    challengeTitle: 'التحدي الثاني: التطوير الهندسي والمهني',
    goalDescription: 'تطوير المهارات الهندسية وإنجاز المشاريع التقنية باحترافية.',
    goalMode: 'custom_per_day',
    generalGoal: 'تطوير المهارات الهندسية وإنجاز المشاريع التقنية باحترافية.',
    totalDays: 60,
    completedDays: [],
    habits: [],
    checkIcon: 'star',
    dayGoals: {},
    reminderTime: '21:00',
    reminderEnabled: true,
    reminderTone: 'victory-fanfare',
  },
  {
    id: 'challenge-3',
    challengeTitle: 'التحدي الثالث: اللياقة والصحة البدنية',
    goalDescription: 'الالتزام بالتمارين الرياضية اليومية والنشاط البدني المستمر.',
    goalMode: 'general',
    generalGoal: 'الالتزام بالتمارين الرياضية اليومية والنشاط البدني المستمر.',
    totalDays: 30,
    completedDays: [],
    habits: [],
    checkIcon: 'flame',
    dayGoals: {},
    reminderTime: '18:00',
    reminderEnabled: true,
    reminderTone: 'emerald-pulse',
  },
  {
    id: 'challenge-4',
    challengeTitle: 'التحدي الرابع: القراءة والمعرفة اليومية',
    goalDescription: 'قراءة وتلخيص الكتب والمراجع العلمية يومياً.',
    goalMode: 'general',
    generalGoal: 'قراءة وتلخيص الكتب والمراجع العلمية يومياً.',
    totalDays: 45,
    completedDays: [],
    habits: [],
    checkIcon: 'gem',
    dayGoals: {},
    reminderTime: '21:30',
    reminderEnabled: true,
    reminderTone: 'crystal-harp',
  },
  {
    id: 'challenge-5',
    challengeTitle: 'التحدي الخامس: الأهداف الخاصة والمشاريع',
    goalDescription: 'تحقيق الأهداف الشخصية والمشاريع الاستراتيجية خطوة بخطوة.',
    goalMode: 'custom_per_day',
    generalGoal: 'تحقيق الأهداف الشخصية والمشاريع الاستراتيجية خطوة بخطوة.',
    totalDays: 90,
    completedDays: [],
    habits: [],
    checkIcon: 'trophy',
    dayGoals: {},
    reminderTime: '22:00',
    reminderEnabled: true,
    reminderTone: 'zen-bell',
  },
];

export function getChallengesList(state: HundredDaysState): ChallengeBoardItem[] {
  if (Array.isArray(state.challenges) && state.challenges.length > 0) {
    return state.challenges.map((c, idx) => ({
      ...c,
      reminderTone:
        c.reminderTone ??
        CHALLENGE_NOTIFICATION_TONES[idx % CHALLENGE_NOTIFICATION_TONES.length]
          .id,
    }));
  }
  // Initialize 5 separate challenges while preserving any existing state in Challenge 1
  const first: ChallengeBoardItem = {
    id: 'challenge-1',
    challengeTitle:
      state.challengeTitle || DEFAULT_SEPARATE_CHALLENGES[0].challengeTitle,
    goalDescription:
      state.goalDescription ?? DEFAULT_SEPARATE_CHALLENGES[0].goalDescription,
    goalMode: state.goalMode ?? DEFAULT_SEPARATE_CHALLENGES[0].goalMode ?? 'general',
    generalGoal:
      state.generalGoal ??
      state.goalDescription ??
      DEFAULT_SEPARATE_CHALLENGES[0].generalGoal,
    totalDays: Math.max(1, Math.min(100, state.totalDays ?? 100)),
    completedDays: [...(state.completedDays ?? [])],
    habits: [...(state.habits ?? [])],
    checkIcon: state.checkIcon ?? 'crown',
    dayGoals: { ...(state.dayGoals ?? {}) },
    reminderTime: state.reminderTime ?? '20:00',
    reminderEnabled: state.reminderEnabled ?? true,
    reminderTone: state.reminderTone ?? 'royal-chime',
    motivationalMessage: state.motivationalMessage ?? '',
  };
  return [first, ...DEFAULT_SEPARATE_CHALLENGES.slice(1)];
}

function syncActiveChallengeIntoState(
  state: HundredDaysState,
  updatedActive: ChallengeBoardItem
): HundredDaysState {
  const list = getChallengesList(state);
  const activeId = state.activeChallengeId || list[0].id;
  const nextChallenges = list.map((c) =>
    c.id === activeId ? updatedActive : c
  );

  return {
    ...state,
    challenges: nextChallenges,
    activeChallengeId: activeId,
    challengeTitle: updatedActive.challengeTitle,
    goalDescription: updatedActive.goalDescription,
    goalMode: updatedActive.goalMode ?? 'general',
    generalGoal: updatedActive.generalGoal ?? updatedActive.goalDescription ?? '',
    totalDays: updatedActive.totalDays,
    completedDays: updatedActive.completedDays,
    habits: updatedActive.habits,
    checkIcon: updatedActive.checkIcon,
    dayGoals: updatedActive.dayGoals,
    reminderTime: updatedActive.reminderTime ?? state.reminderTime ?? '20:00',
    reminderEnabled:
      updatedActive.reminderEnabled ?? state.reminderEnabled ?? true,
    reminderTone:
      updatedActive.reminderTone ?? state.reminderTone ?? 'royal-chime',
    motivationalMessage:
      updatedActive.motivationalMessage ?? state.motivationalMessage ?? '',
  };
}

export function selectSeparateChallenge(
  state: HundredDaysState,
  challengeId: string
): HundredDaysState {
  const list = getChallengesList(state);
  const found = list.find((c) => c.id === challengeId) || list[0];
  return {
    ...state,
    challenges: list,
    activeChallengeId: found.id,
    challengeTitle: found.challengeTitle,
    goalDescription: found.goalDescription,
    goalMode: found.goalMode ?? 'general',
    generalGoal: found.generalGoal ?? found.goalDescription ?? '',
    totalDays: found.totalDays,
    completedDays: found.completedDays,
    habits: found.habits,
    checkIcon: found.checkIcon,
    dayGoals: found.dayGoals,
    reminderTime: found.reminderTime ?? state.reminderTime ?? '20:00',
    reminderEnabled: found.reminderEnabled ?? state.reminderEnabled ?? true,
    reminderTone: found.reminderTone ?? 'royal-chime',
    motivationalMessage: found.motivationalMessage ?? '',
  };
}

export function addNewSeparateChallenge(
  state: HundredDaysState,
  title: string,
  totalDays = 30,
  checkIcon: ChallengeCheckIcon = 'crown',
  options?: CreateSeparateChallengeOptions
): HundredDaysState {
  const existingList = getChallengesList(state);
  const cleanTitle = title.trim() || `تحدي جديد #${existingList.length + 1}`;
  const clampedDays = Math.max(1, Math.min(100, Math.round(totalDays)));
  const mode: ChallengeGoalMode = options?.goalMode ?? 'general';
  const genGoal = (options?.generalGoal ?? '').trim();
  const initialDayGoals: Record<number, string> = { ...(options?.dayGoals ?? {}) };
  const customMotivation = (options?.motivationalMessage ?? '').trim();
  const defaultToneForNew =
    CHALLENGE_NOTIFICATION_TONES[
      existingList.length % CHALLENGE_NOTIFICATION_TONES.length
    ].id;

  const newChallenge: ChallengeBoardItem = {
    id: `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    challengeTitle: cleanTitle,
    goalDescription: genGoal,
    goalMode: mode,
    generalGoal: genGoal,
    totalDays: clampedDays,
    completedDays: [],
    habits: [],
    checkIcon,
    dayGoals: initialDayGoals,
    reminderTime: options?.reminderTime ?? state.reminderTime ?? '20:00',
    reminderEnabled: options?.reminderEnabled ?? state.reminderEnabled ?? true,
    reminderTone: options?.reminderTone ?? defaultToneForNew,
    motivationalMessage: customMotivation,
  };
  const nextList = [...existingList, newChallenge];
  return {
    ...state,
    challenges: nextList,
    activeChallengeId: newChallenge.id,
    challengeTitle: newChallenge.challengeTitle,
    goalDescription: newChallenge.goalDescription,
    goalMode: newChallenge.goalMode,
    generalGoal: newChallenge.generalGoal,
    totalDays: newChallenge.totalDays,
    completedDays: newChallenge.completedDays,
    habits: newChallenge.habits,
    checkIcon: newChallenge.checkIcon,
    dayGoals: newChallenge.dayGoals,
    reminderTime: newChallenge.reminderTime,
    reminderEnabled: newChallenge.reminderEnabled,
    reminderTone: newChallenge.reminderTone,
    motivationalMessage: newChallenge.motivationalMessage,
  };
}

export function deleteSeparateChallenge(
  state: HundredDaysState,
  challengeId: string
): HundredDaysState {
  const list = getChallengesList(state);
  if (list.length <= 1) return state;
  const remaining = list.filter((c) => c.id !== challengeId);
  const nextActive =
    state.activeChallengeId === challengeId
      ? remaining[0]
      : remaining.find((c) => c.id === state.activeChallengeId) || remaining[0];

  return {
    ...state,
    challenges: remaining,
    activeChallengeId: nextActive.id,
    challengeTitle: nextActive.challengeTitle,
    goalDescription: nextActive.goalDescription,
    goalMode: nextActive.goalMode ?? 'general',
    generalGoal: nextActive.generalGoal ?? nextActive.goalDescription ?? '',
    totalDays: nextActive.totalDays,
    completedDays: nextActive.completedDays,
    habits: nextActive.habits,
    checkIcon: nextActive.checkIcon,
    dayGoals: nextActive.dayGoals,
    reminderTime: nextActive.reminderTime ?? state.reminderTime ?? '20:00',
    reminderEnabled: nextActive.reminderEnabled ?? state.reminderEnabled ?? true,
    reminderTone: nextActive.reminderTone ?? 'royal-chime',
    motivationalMessage: nextActive.motivationalMessage ?? '',
  };
}

export function toggleHundredDayCompletion(
  state: HundredDaysState,
  dayNumber: number
): HundredDaysState {
  const maxDays = Math.max(1, Math.min(100, state.totalDays ?? 100));
  if (dayNumber < 1 || dayNumber > maxDays) return state;
  const exists = state.completedDays.includes(dayNumber);
  const nextDays = exists
    ? state.completedDays.filter((d) => d !== dayNumber)
    : [...state.completedDays, dayNumber].sort((a, b) => a - b);

  const nextState: HundredDaysState = {
    ...state,
    completedDays: nextDays,
  };

  if (state.challenges) {
    const list = getChallengesList(state);
    const activeId = state.activeChallengeId || list[0].id;
    const current = list.find((c) => c.id === activeId) || list[0];
    return syncActiveChallengeIntoState(nextState, {
      ...current,
      completedDays: nextDays,
    });
  }
  return nextState;
}

export function updateChallengeConfig(
  state: HundredDaysState,
  patch: {
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
  }
): HundredDaysState {
  const nextTotalDays =
    typeof patch.totalDays === 'number'
      ? Math.max(1, Math.min(100, Math.round(patch.totalDays)))
      : state.totalDays ?? 100;

  const filteredCompleted = state.completedDays.filter(
    (d) => d >= 1 && d <= nextTotalDays
  );

  const nextGeneralGoal =
    patch.generalGoal !== undefined
      ? patch.generalGoal
      : patch.goalDescription !== undefined
        ? patch.goalDescription
        : state.generalGoal ?? state.goalDescription ?? '';

  const nextGoalDescription =
    patch.goalDescription !== undefined
      ? patch.goalDescription
      : patch.generalGoal !== undefined
        ? patch.generalGoal
        : state.goalDescription ?? '';

  const nextMotivationalMessage =
    patch.motivationalMessage !== undefined
      ? patch.motivationalMessage
      : state.motivationalMessage ?? '';

  const nextReminderTone: ChallengeNotificationTone =
    patch.reminderTone ?? state.reminderTone ?? 'royal-chime';

  const nextState: HundredDaysState = {
    ...state,
    totalDays: nextTotalDays,
    completedDays: filteredCompleted,
    challengeTitle:
      patch.challengeTitle !== undefined
        ? patch.challengeTitle
        : state.challengeTitle ?? 'تحدي الالتزام والإنجاز الملكي',
    goalDescription: nextGoalDescription,
    goalMode: patch.goalMode ?? state.goalMode ?? 'general',
    generalGoal: nextGeneralGoal,
    checkIcon: patch.checkIcon ?? state.checkIcon ?? 'check',
    dayGoals:
      patch.dayGoals !== undefined
        ? patch.dayGoals
        : state.dayGoals ?? {},
    reminderTime: patch.reminderTime ?? state.reminderTime ?? '20:00',
    reminderEnabled:
      patch.reminderEnabled !== undefined
        ? patch.reminderEnabled
        : state.reminderEnabled ?? true,
    reminderTone: nextReminderTone,
    motivationalMessage: nextMotivationalMessage,
  };

  if (state.challenges) {
    const list = getChallengesList(state);
    const activeId = state.activeChallengeId || list[0].id;
    const current = list.find((c) => c.id === activeId) || list[0];
    return syncActiveChallengeIntoState(nextState, {
      ...current,
      totalDays: nextState.totalDays!,
      completedDays: nextState.completedDays,
      challengeTitle: nextState.challengeTitle!,
      goalDescription: nextState.goalDescription!,
      goalMode: nextState.goalMode,
      generalGoal: nextState.generalGoal,
      checkIcon: nextState.checkIcon!,
      dayGoals: nextState.dayGoals!,
      reminderTime: nextState.reminderTime,
      reminderEnabled: nextState.reminderEnabled,
      reminderTone: nextState.reminderTone,
      motivationalMessage: nextState.motivationalMessage,
    });
  }
  return nextState;
}

export function resolveChallengeDayGoal(
  state: Pick<
    HundredDaysState,
    'goalMode' | 'generalGoal' | 'goalDescription' | 'dayGoals'
  >,
  dayNumber: number
): string {
  const mode: ChallengeGoalMode = state.goalMode ?? 'general';
  if (mode === 'general') {
    return (state.generalGoal ?? state.goalDescription ?? '').trim();
  }
  return state.dayGoals?.[dayNumber] ?? '';
}

export function shouldTriggerChallengeReminder(
  state: Pick<
    HundredDaysState,
    | 'challengeTitle'
    | 'reminderEnabled'
    | 'reminderTime'
    | 'reminderTone'
    | 'motivationalMessage'
    | 'completedDays'
    | 'totalDays'
    | 'goalMode'
    | 'generalGoal'
    | 'goalDescription'
    | 'dayGoals'
  >,
  currentTimeHHMM: string
): {
  shouldNotify: boolean;
  title: string;
  message: string;
  motivationalMessage: string;
  reminderTone: ChallengeNotificationTone;
  nextDayNumber: number | null;
} {
  const enabled = state.reminderEnabled ?? true;
  const configuredTime = (state.reminderTime ?? '20:00').trim();
  const reminderTone: ChallengeNotificationTone =
    state.reminderTone ?? 'royal-chime';
  const customMotivation = (state.motivationalMessage ?? '').trim();
  const totalDays = Math.max(1, Math.min(100, state.totalDays ?? 100));
  const completedSet = new Set(
    (state.completedDays ?? []).filter((d) => d >= 1 && d <= totalDays)
  );
  let nextDayNumber: number | null = null;
  for (let d = 1; d <= totalDays; d++) {
    if (!completedSet.has(d)) {
      nextDayNumber = d;
      break;
    }
  }

  const title = `تذكير يومي بجدول التحدي: ${
    state.challengeTitle || 'جدول التحدي الملكي'
  }`;

  const autoPsychInsight = getPsychologyMotivationalInsight(
    (nextDayNumber ?? 1) - 1
  );
  const effectiveMotivation = customMotivation || autoPsychInsight.message;

  if (!enabled || configuredTime !== currentTimeHHMM || nextDayNumber === null) {
    return {
      shouldNotify: false,
      title,
      message: '',
      motivationalMessage: effectiveMotivation,
      reminderTone,
      nextDayNumber,
    };
  }

  const dayGoal = resolveChallengeDayGoal(state, nextDayNumber);
  const message = `${effectiveMotivation} — (اليوم رقم ${nextDayNumber} من ${totalDays}${
    dayGoal ? `: ${dayGoal}` : ''
  })`;

  return {
    shouldNotify: true,
    title,
    message,
    motivationalMessage: effectiveMotivation,
    reminderTone,
    nextDayNumber,
  };
}

export function updateChallengeDayGoal(
  state: HundredDaysState,
  dayNumber: number,
  goalText: string
): HundredDaysState {
  const maxDays = Math.max(1, Math.min(100, state.totalDays ?? 100));
  if (dayNumber < 1 || dayNumber > maxDays) return state;

  const nextGoals: Record<number, string> = { ...(state.dayGoals ?? {}) };
  if (goalText.trim() === '') {
    delete nextGoals[dayNumber];
  } else {
    nextGoals[dayNumber] = goalText;
  }

  const nextState: HundredDaysState = {
    ...state,
    dayGoals: nextGoals,
  };

  if (state.challenges) {
    const list = getChallengesList(state);
    const activeId = state.activeChallengeId || list[0].id;
    const current = list.find((c) => c.id === activeId) || list[0];
    return syncActiveChallengeIntoState(nextState, {
      ...current,
      dayGoals: nextGoals,
    });
  }
  return nextState;
}

export function addHundredDayHabit(
  state: HundredDaysState,
  title: string,
  targetMinutes = 30
): HundredDaysState {
  const clean = title.trim();
  if (!clean) return state;
  const newHabit: HundredDayHabit = {
    id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: clean,
    targetMinutes: Math.max(5, Math.min(240, Math.round(targetMinutes))),
  };
  const nextHabits = [...state.habits, newHabit];
  const nextState: HundredDaysState = {
    ...state,
    habits: nextHabits,
  };

  if (state.challenges) {
    const list = getChallengesList(state);
    const activeId = state.activeChallengeId || list[0].id;
    const current = list.find((c) => c.id === activeId) || list[0];
    return syncActiveChallengeIntoState(nextState, {
      ...current,
      habits: nextHabits,
    });
  }
  return nextState;
}

export function removeHundredDayHabit(
  state: HundredDaysState,
  habitId: string
): HundredDaysState {
  const nextHabits = state.habits.filter((h) => h.id !== habitId);
  const nextState: HundredDaysState = {
    ...state,
    habits: nextHabits,
  };

  if (state.challenges) {
    const list = getChallengesList(state);
    const activeId = state.activeChallengeId || list[0].id;
    const current = list.find((c) => c.id === activeId) || list[0];
    return syncActiveChallengeIntoState(nextState, {
      ...current,
      habits: nextHabits,
    });
  }
  return nextState;
}

export function reorderHundredDayHabit(
  state: HundredDaysState,
  habitId: string,
  direction: 'up' | 'down'
): HundredDaysState {
  const idx = state.habits.findIndex((h) => h.id === habitId);
  if (idx === -1) return state;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= state.habits.length) return state;

  const copy = [...state.habits];
  const [moved] = copy.splice(idx, 1);
  copy.splice(targetIdx, 0, moved);
  const nextState: HundredDaysState = {
    ...state,
    habits: copy,
  };

  if (state.challenges) {
    const list = getChallengesList(state);
    const activeId = state.activeChallengeId || list[0].id;
    const current = list.find((c) => c.id === activeId) || list[0];
    return syncActiveChallengeIntoState(nextState, {
      ...current,
      habits: copy,
    });
  }
  return nextState;
}

export function calculateHundredDaysMetrics(
  state: HundredDaysState
): HundredDaysMetrics {
  const totalDays = Math.max(1, Math.min(100, state.totalDays ?? 100));
  const uniqueDays = Array.from(
    new Set(state.completedDays.filter((d) => d >= 1 && d <= totalDays))
  ).sort((a, b) => a - b);

  const completedDaysCount = uniqueDays.length;
  const remainingDaysCount = Math.max(0, totalDays - completedDaysCount);
  const completionPercentage =
    totalDays === 0 ? 0 : Math.round((completedDaysCount / totalDays) * 100);
  const habitsCount = state.habits.length;
  const totalCompletedActions = completedDaysCount * habitsCount;
  const totalPlannedActions = totalDays * habitsCount;
  const dailyHabitMinutes = state.habits.reduce(
    (acc, h) => acc + h.targetMinutes,
    0
  );
  const totalMinutesInvested = completedDaysCount * dailyHabitMinutes;

  // Calculate longest streak and current streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < uniqueDays.length; i++) {
    if (i === 0 || uniqueDays[i] === uniqueDays[i - 1] + 1) {
      tempStreak += 1;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  let currentStreak = 0;
  if (uniqueDays.length > 0) {
    currentStreak = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      if (uniqueDays[i] === uniqueDays[i - 1] + 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  // Dynamic phases based on totalDays
  const p1End = Math.max(1, Math.round(totalDays * 0.3));
  const p2End = Math.max(p1End, Math.round(totalDays * 0.6));

  const phase1Total = p1End;
  const phase2Total = Math.max(0, p2End - p1End);
  const phase3Total = Math.max(0, totalDays - p2End);

  const phase1Completed = uniqueDays.filter((d) => d >= 1 && d <= p1End).length;
  const phase2Completed = uniqueDays.filter(
    (d) => d > p1End && d <= p2End
  ).length;
  const phase3Completed = uniqueDays.filter(
    (d) => d > p2End && d <= totalDays
  ).length;

  return {
    totalDays,
    completedDaysCount,
    remainingDaysCount,
    completionPercentage,
    habitsCount,
    totalCompletedActions,
    totalPlannedActions,
    totalMinutesInvested,
    currentStreak,
    longestStreak,
    phases: [
      {
        label: 'المرحلة الأولى: تأسيس العادات',
        range: `اليوم 1 – ${p1End}`,
        completed: phase1Completed,
        total: phase1Total,
        percentage:
          phase1Total === 0
            ? 0
            : Math.round((phase1Completed / phase1Total) * 100),
      },
      ...(phase2Total > 0
        ? [
            {
              label: 'المرحلة الثانية: ترسيخ الانضباط',
              range: `اليوم ${p1End + 1} – ${p2End}`,
              completed: phase2Completed,
              total: phase2Total,
              percentage: Math.round((phase2Completed / phase2Total) * 100),
            },
          ]
        : []),
      ...(phase3Total > 0
        ? [
            {
              label: 'المرحلة الثالثة: الإتقان الملكي',
              range: `اليوم ${p2End + 1} – ${totalDays}`,
              completed: phase3Completed,
              total: phase3Total,
              percentage: Math.round((phase3Completed / phase3Total) * 100),
            },
          ]
        : []),
    ],
  };
}

export interface ThirtyDayPoint {
  dateStr: string;
  shortLabel: string;
  dayIndex: number;
  completed: number;
  overdue: number;
  focusedMinutes: number;
  efficiencyRate: number;
  isPeakProductivity: boolean;
  peakPeriodLabel: string;
}

export interface ThirtyDayAnalyticsSummary {
  points: ThirtyDayPoint[];
  totalCompleted30d: number;
  totalOverdue30d: number;
  overallEfficiency: number;
  peakDays: ThirtyDayPoint[];
  topPeakDay: ThirtyDayPoint;
  peakWindowRange: string;
}

const BASELINE_30D_PATTERN: { completed: number; overdue: number; minutes: number }[] = [
  { completed: 5, overdue: 2, minutes: 120 },
  { completed: 6, overdue: 1, minutes: 145 },
  { completed: 4, overdue: 2, minutes: 95 },
  { completed: 7, overdue: 1, minutes: 165 },
  { completed: 9, overdue: 0, minutes: 215 }, // Peak 1
  { completed: 6, overdue: 2, minutes: 140 },
  { completed: 5, overdue: 1, minutes: 115 },
  { completed: 7, overdue: 1, minutes: 160 },
  { completed: 8, overdue: 1, minutes: 185 },
  { completed: 10, overdue: 0, minutes: 240 }, // Peak 2
  { completed: 6, overdue: 2, minutes: 135 },
  { completed: 4, overdue: 3, minutes: 90 },
  { completed: 7, overdue: 1, minutes: 170 },
  { completed: 8, overdue: 1, minutes: 190 },
  { completed: 11, overdue: 0, minutes: 265 }, // Peak 3
  { completed: 7, overdue: 1, minutes: 165 },
  { completed: 6, overdue: 2, minutes: 130 },
  { completed: 5, overdue: 2, minutes: 120 },
  { completed: 8, overdue: 1, minutes: 195 },
  { completed: 9, overdue: 0, minutes: 220 }, // Peak 4
  { completed: 7, overdue: 1, minutes: 160 },
  { completed: 6, overdue: 1, minutes: 145 },
  { completed: 8, overdue: 1, minutes: 180 },
  { completed: 10, overdue: 0, minutes: 250 }, // Peak 5
  { completed: 7, overdue: 2, minutes: 155 },
  { completed: 6, overdue: 1, minutes: 140 },
  { completed: 8, overdue: 1, minutes: 185 },
  { completed: 9, overdue: 1, minutes: 210 },
  { completed: 12, overdue: 0, minutes: 280 }, // Peak 6 (Highest)
  { completed: 8, overdue: 1, minutes: 195 },
];

export function generateThirtyDayAnalytics(
  tasks: Task[],
  includeBaselineWhenSparse = true,
  referenceDateStr: string = TODAY_DATE_STR
): ThirtyDayAnalyticsSummary {
  const refParts = referenceDateStr.split('-').map(Number);
  const refDate = new Date(
    Date.UTC(refParts[0] || 2026, (refParts[1] || 11) - 1, refParts[2] || 5)
  );

  const monthNamesAr = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  const rawPoints: Omit<ThirtyDayPoint, 'isPeakProductivity' | 'peakPeriodLabel'>[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(refDate.getTime() - i * 24 * 60 * 60 * 1000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const shortLabel = `${d.getUTCDate()} ${monthNamesAr[d.getUTCMonth()]}`;
    const dayIndex = 30 - i;

    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const realCompleted = dayTasks.filter((t) => t.completed).length;
    const realOverdue = dayTasks.filter((t) => !t.completed).length;
    const realMinutes = dayTasks.reduce(
      (acc, t) => acc + (t.completed ? t.estimatedMinutes : t.actualMinutesFocused),
      0
    );

    const baseline = BASELINE_30D_PATTERN[(dayIndex - 1) % BASELINE_30D_PATTERN.length];
    const completed = includeBaselineWhenSparse
      ? baseline.completed + realCompleted
      : realCompleted;
    const overdue = includeBaselineWhenSparse
      ? baseline.overdue + realOverdue
      : realOverdue;
    const focusedMinutes = includeBaselineWhenSparse
      ? baseline.minutes + realMinutes
      : realMinutes;

    const totalDay = completed + overdue;
    const efficiencyRate =
      totalDay === 0 ? 0 : Math.round((completed / totalDay) * 100);

    rawPoints.push({
      dateStr,
      shortLabel,
      dayIndex,
      completed,
      overdue,
      focusedMinutes,
      efficiencyRate,
    });
  }

  // Determine peak productivity threshold (top ~20% completed count & high efficiency)
  const maxCompleted = Math.max(...rawPoints.map((p) => p.completed), 1);
  const peakThreshold = Math.max(2, Math.floor(maxCompleted * 0.78));

  const points: ThirtyDayPoint[] = rawPoints.map((p) => {
    const isPeak =
      p.completed >= peakThreshold && p.completed > p.overdue && p.completed > 0;
    return {
      ...p,
      isPeakProductivity: isPeak,
      peakPeriodLabel: isPeak
        ? 'ذروة الإنتاجية القصوى (الفترة الصباحية 08:00 - 11:30)'
        : 'معدل إنجاز اعتيادي',
    };
  });

  const totalCompleted30d = points.reduce((acc, p) => acc + p.completed, 0);
  const totalOverdue30d = points.reduce((acc, p) => acc + p.overdue, 0);
  const totalAll = totalCompleted30d + totalOverdue30d;
  const overallEfficiency =
    totalAll === 0 ? 0 : Math.round((totalCompleted30d / totalAll) * 100);

  const peakDays = points.filter((p) => p.isPeakProductivity);
  const topPeakDay =
    [...points].sort(
      (a, b) => b.completed - a.completed || b.efficiencyRate - a.efficiencyRate
    )[0] || points[points.length - 1];

  return {
    points,
    totalCompleted30d,
    totalOverdue30d,
    overallEfficiency,
    peakDays,
    topPeakDay,
    peakWindowRange: 'الفترة الصباحية الملكية (08:00 ص – 11:30 ص)',
  };
}

// ============================================================================
// Ready-Made Task Templates Library (One-Click Add to Schedule)
// ============================================================================

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'template-morning-routine',
    title: 'روتين صباحي',
    subtitle: '3 مهام صباحية لبداية يوم منظمة وعالية التركيز',
    category: 'personal',
    icon: 'coffee',
    tasks: [
      {
        title: 'روتين صباحي: مراجعة خطة اليوم وتحديد أهم 3 أولويات',
        priority: 'high',
        category: 'personal',
        customIcon: 'target',
        timeBlock: 'morning',
        scheduledTime: '07:30',
        estimatedMinutes: 20,
        starred: true,
      },
      {
        title: 'روتين صباحي: قراءة مركزة وتنشيط ذهني قبل العمل',
        priority: 'medium',
        category: 'learning',
        customIcon: 'book',
        timeBlock: 'morning',
        scheduledTime: '08:00',
        estimatedMinutes: 25,
      },
      {
        title: 'روتين صباحي: إنجاز المهمة الأكثر أهمية في بداية اليوم',
        priority: 'urgent',
        category: 'work',
        customIcon: 'crown',
        timeBlock: 'morning',
        scheduledTime: '08:30',
        estimatedMinutes: 45,
        starred: true,
      },
    ],
  },
  {
    id: 'template-fitness-routine',
    title: 'روتين رياضي',
    subtitle: '3 مهام لياقة بدنية وتمارين صحية متكاملة',
    category: 'health',
    icon: 'dumbbell',
    tasks: [
      {
        title: 'روتين رياضي: إحماء حركي وتمارين إطالة وتنفس',
        priority: 'medium',
        category: 'health',
        customIcon: 'heart',
        timeBlock: 'morning',
        scheduledTime: '06:30',
        estimatedMinutes: 15,
      },
      {
        title: 'روتين رياضي: جلسة التمرين الأساسي واللياقة البدنية',
        priority: 'high',
        category: 'health',
        customIcon: 'dumbbell',
        timeBlock: 'afternoon',
        scheduledTime: '17:00',
        estimatedMinutes: 45,
        starred: true,
      },
      {
        title: 'روتين رياضي: متابعة التغذية الصحية وشرب الماء الكافي',
        priority: 'medium',
        category: 'health',
        customIcon: 'flame',
        timeBlock: 'evening',
        scheduledTime: '19:30',
        estimatedMinutes: 15,
      },
    ],
  },
  {
    id: 'template-engineering-work',
    title: 'روتين عمل هندسي',
    subtitle: '3 مهام لإدارة المشاريع والمراجعات الهندسية الدقيقة',
    category: 'work',
    icon: 'briefcase',
    tasks: [
      {
        title: 'عمل هندسي: فحص ومراجعة المخططات والتقارير الفنية',
        priority: 'urgent',
        category: 'work',
        customIcon: 'briefcase',
        timeBlock: 'morning',
        scheduledTime: '09:00',
        estimatedMinutes: 60,
        starred: true,
      },
      {
        title: 'عمل هندسي: جلسة تركيز عميق على المشروع الرئيسي',
        priority: 'high',
        category: 'work',
        customIcon: 'laptop',
        timeBlock: 'afternoon',
        scheduledTime: '13:00',
        estimatedMinutes: 60,
      },
      {
        title: 'عمل هندسي: توثيق التقدم اليومي ومتابعة المهام المنجزة',
        priority: 'medium',
        category: 'work',
        customIcon: 'rocket',
        timeBlock: 'afternoon',
        scheduledTime: '16:00',
        estimatedMinutes: 30,
      },
    ],
  },
  {
    id: 'template-study-growth',
    title: 'روتين دراسة وتطوير',
    subtitle: 'مهمتان للتعلم المستمر وتطوير المهارات التقنية',
    category: 'learning',
    icon: 'graduation',
    tasks: [
      {
        title: 'دراسة وتطوير: متابعة محاضرة أو فصل تقني متقدم',
        priority: 'high',
        category: 'learning',
        customIcon: 'graduation',
        timeBlock: 'afternoon',
        scheduledTime: '15:00',
        estimatedMinutes: 45,
      },
      {
        title: 'دراسة وتطوير: تدوين الملخصات والتطبيق العملي السريع',
        priority: 'medium',
        category: 'learning',
        customIcon: 'brain',
        timeBlock: 'evening',
        scheduledTime: '20:00',
        estimatedMinutes: 30,
      },
    ],
  },
  {
    id: 'template-evening-reset',
    title: 'روتين مسائي',
    subtitle: 'مهمتان لتقييم إنجازات اليوم وتجهيز خطة الغد',
    category: 'personal',
    icon: 'sparkles',
    tasks: [
      {
        title: 'روتين مسائي: مراجعة مهام اليوم المنجزة وترتيب المكتب',
        priority: 'medium',
        category: 'personal',
        customIcon: 'sparkles',
        timeBlock: 'evening',
        scheduledTime: '21:00',
        estimatedMinutes: 20,
      },
      {
        title: 'روتين مسائي: تحضير جدول وأولويات يوم الغد',
        priority: 'medium',
        category: 'personal',
        customIcon: 'home',
        timeBlock: 'evening',
        scheduledTime: '21:30',
        estimatedMinutes: 15,
      },
    ],
  },
];

export function applyTaskTemplate(
  existingTasks: Task[],
  templateId: string,
  dueDate: string = TODAY_DATE_STR
): Task[] {
  const found = TASK_TEMPLATES.find((t) => t.id === templateId);
  if (!found) return existingTasks;

  const created = found.tasks.map((taskInput, idx) =>
    createTask(
      {
        ...taskInput,
        dueDate,
      },
      `tpl-${templateId}-${Date.now()}-${idx}`
    )
  );

  return [...created, ...existingTasks];
}

export const INITIAL_HUNDRED_DAYS_STATE: HundredDaysState = {
  habits: [],
  completedDays: [],
  challenges: DEFAULT_SEPARATE_CHALLENGES,
  activeChallengeId: DEFAULT_SEPARATE_CHALLENGES[0].id,
  challengeTitle: DEFAULT_SEPARATE_CHALLENGES[0].challengeTitle,
  goalDescription: DEFAULT_SEPARATE_CHALLENGES[0].goalDescription,
  totalDays: DEFAULT_SEPARATE_CHALLENGES[0].totalDays,
  checkIcon: DEFAULT_SEPARATE_CHALLENGES[0].checkIcon,
  dayGoals: {},
};

export const INITIAL_TASKS: Task[] = [];

/**
 * Verifies the lock passcode for the isolated Challenges Board.
 */
export function verifyChallengePasscode(input: string): boolean {
  return input.trim() === '1988';
}

export interface SevenDayProductivityPoint {
  dateStr: string;
  dayNameAr: string;
  shortDateAr: string;
  completedCount: number;
  totalCount: number;
  focusedMinutes: number;
  isMostProductive: boolean;
}

export interface SevenDayProductivitySummary {
  days: SevenDayProductivityPoint[];
  mostProductiveDay: SevenDayProductivityPoint;
  totalCompleted7d: number;
  hasLiveTasks: boolean;
}

const ARABIC_WEEKDAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/**
 * Computes the 'Most Productive Day' over the past 7 days based on completed tasks count.
 */
export function calculateSevenDayMostProductive(
  tasks: Task[],
  referenceDateStr: string = TODAY_DATE_STR
): SevenDayProductivitySummary {
  const refParts = referenceDateStr.split('-').map(Number);
  const refDate = new Date(
    Date.UTC(refParts[0] || 2026, (refParts[1] || 11) - 1, refParts[2] || 5)
  );

  const rawDays: Omit<SevenDayProductivityPoint, 'isMostProductive'>[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate.getTime() - i * 24 * 60 * 60 * 1000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayNameAr = ARABIC_WEEKDAYS[d.getUTCDay()];
    const shortDateAr = `${d.getUTCDate()} ${ARABIC_MONTHS[d.getUTCMonth()]}`;

    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const completedTasks = dayTasks.filter((t) => t.completed);
    const completedCount = completedTasks.length;
    const totalCount = dayTasks.length;
    const focusedMinutes = dayTasks.reduce(
      (acc, t) =>
        acc + (t.completed ? t.estimatedMinutes : t.actualMinutesFocused),
      0
    );

    rawDays.push({
      dateStr,
      dayNameAr,
      shortDateAr,
      completedCount,
      totalCount,
      focusedMinutes,
    });
  }

  const totalRealCompleted = rawDays.reduce(
    (acc, d) => acc + d.completedCount,
    0
  );

  // Pick the day with the highest completedCount (tie-breaker: focusedMinutes, then most recent day)
  let bestIdx = rawDays.length - 1;
  for (let i = 0; i < rawDays.length; i++) {
    const curr = rawDays[i];
    const best = rawDays[bestIdx];
    if (
      curr.completedCount > best.completedCount ||
      (curr.completedCount === best.completedCount &&
        curr.focusedMinutes >= best.focusedMinutes)
    ) {
      bestIdx = i;
    }
  }

  const days: SevenDayProductivityPoint[] = rawDays.map((d, idx) => ({
    ...d,
    isMostProductive: idx === bestIdx,
  }));

  return {
    days,
    mostProductiveDay: days[bestIdx],
    totalCompleted7d: totalRealCompleted,
    hasLiveTasks: totalRealCompleted > 0,
  };
}

// ============================================================================
// Task Inline Countdown & Carryover Remaining Work to Next Day
// ============================================================================

export function formatCountdownMMSS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getNextDayIsoDate(dateStr: string = TODAY_DATE_STR): string {
  const parts = (dateStr || TODAY_DATE_STR).split('-').map(Number);
  const year = parts[0] || 2026;
  const month = (parts[1] || 11) - 1;
  const day = parts[2] || 5;
  const nextDate = new Date(Date.UTC(year, month, day) + 24 * 60 * 60 * 1000);
  const yyyy = nextDate.getUTCFullYear();
  const mm = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(nextDate.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function carryOverRemainingWorkToNextDay(
  tasks: Task[],
  sourceTaskId: string,
  remainingWorkNotes: string,
  customNewId?: string
): {
  tasks: Task[];
  createdTask: Task | null;
  nextDayDate: string;
} {
  const sourceTask = tasks.find((t) => t.id === sourceTaskId);
  if (!sourceTask) {
    return {
      tasks,
      createdTask: null,
      nextDayDate: getNextDayIsoDate(TODAY_DATE_STR),
    };
  }

  const cleanedNotes = remainingWorkNotes.trim();
  const nextDayDate = getNextDayIsoDate(sourceTask.dueDate || TODAY_DATE_STR);

  const followUpTitle = cleanedNotes
    ? `${sourceTask.title} — متابعة: ${cleanedNotes}`
    : `${sourceTask.title} (متابعة اليوم الثاني)`;

  const createdTask = createTask(
    {
      title: followUpTitle,
      notes: cleanedNotes || `متابعة ما تبقى من مهمة: ${sourceTask.title}`,
      priority: sourceTask.priority,
      category: sourceTask.category,
      customCategoryId: sourceTask.customCategoryId,
      customCategoryLabel: sourceTask.customCategoryLabel,
      customIcon: sourceTask.customIcon,
      customIconColor: sourceTask.customIconColor,
      timeBlock: sourceTask.timeBlock,
      scheduledTime: sourceTask.scheduledTime,
      dueDate: nextDayDate,
      estimatedMinutes: sourceTask.estimatedMinutes,
      starred: sourceTask.starred,
    },
    customNewId
  );

  const updatedTasks = tasks.map((t) =>
    t.id === sourceTaskId
      ? {
          ...t,
          completed: true,
          notes: cleanedNotes || t.notes,
        }
      : t
  );

  return {
    tasks: [...updatedTasks, createdTask],
    createdTask,
    nextDayDate,
  };
}

// ============================================================================
// Auto-Rotating Psychology & Behavioral Science Motivational Insights
// ============================================================================

export interface PsychologyMotivationalInsight {
  id: string;
  principleAr: string;
  scientistOrSource: string;
  message: string;
  psychologicalExplanation: string;
}

export const PSYCHOLOGY_MOTIVATIONAL_INSIGHTS: PsychologyMotivationalInsight[] = [
  {
    id: 'psych-progress-principle',
    principleAr: 'مبدأ التقدم الصغير (The Progress Principle)',
    scientistOrSource: 'د. تيريزا أمابيل — أبحاث علم النفس في جامعة هارفارد',
    message:
      'بحسب أبحاث علم النفس في جامعة هارفارد (مبدأ التقدم الصغير): إنجاز خطوة واحدة اليوم يرفع الدوبامين ويمنح دماغك وقود الاستمرار التلقائي غداً!',
    psychologicalExplanation:
      'المكاسب اليومية الصغيرة هي المحفز الأول للدافع الداخلي والرضا الذهني المستدام.',
  },
  {
    id: 'psych-neuroplasticity',
    principleAr: 'المرونة العصبية وتكوين العادات (Neuroplasticity)',
    scientistOrSource: 'د. دونالد هيب — علم النفس العصبي',
    message:
      'وفق دراسات المرونة العصبية في علم النفس: كل يوم تلتزم فيه بجدول التحدي يعيد تشكيل المسارات العصبية في دماغك ليصبح الانضباط سلوكاً تلقائياً بلا إجهاد!',
    psychologicalExplanation:
      'الخلايا العصبية التي تنشط معاً تترابط معاً؛ التكرار اليومي يبني مساراً عصبياً دائماً للالتزام.',
  },
  {
    id: 'psych-zeigarnik-effect',
    principleAr: 'تأثير زيجارنيك وكسر التسويف (Zeigarnik Effect)',
    scientistOrSource: 'بلوما زيجارنيك — علم النفس المعرفي',
    message:
      'بحسب تأثير زيجارنيك في علم النفس المعرفي: البدء بأول 5 دقائق من مهمة اليوم يحرر ذاكرتك العاملة من التوتر ويحول طاقة التفكير إلى إنجاز فعلي!',
    psychologicalExplanation:
      'المهام غير المبدوءة تستهلك طاقة الذاكرة؛ مجرد ضغط زر «البدء» يزيل العبء النفسي فوراً.',
  },
  {
    id: 'psych-self-efficacy',
    principleAr: 'نظرية الكفاءة الذاتية (Self-Efficacy Theory)',
    scientistOrSource: 'د. ألبيرت باندورا — جامعة ستانفورد',
    message:
      'تشير أبحاث علم النفس (نظرية الكفاءة الذاتية لباندورا): كل علامة إنجاز تضعها في جدولك اليوم تبني ثقة جهازك العصبي بقدرتك على تجاوز التحديات الكبرى!',
    psychologicalExplanation:
      'التجارب الناجحة المتتالية هي المصدر الأقوى لبناء الثقة النفسية والصلابة الذهنية.',
  },
  {
    id: 'psych-flow-state',
    principleAr: 'حالة التدفق الذهني العميق (Flow State)',
    scientistOrSource: 'د. ميهالي تشيكسنتميهالي — علم النفس الإيجابي',
    message:
      'وفق مقالات علم النفس الإيجابي حول (حالة التدفق الذهني): تحديد وقت واضح وتشغيل العداد التنازلي يدخل عقلك في ذروة التركيز والإنتاجية الهندسية!',
    psychologicalExplanation:
      'عندما يتطابق الهدف المحدد مع إطار زمني واضح، يدخل الدماغ في حالة استغراق عالي الأداء.',
  },
  {
    id: 'psych-identity-habits',
    principleAr: 'العادات المرتبطة بالهوية (Identity-Based Habits)',
    scientistOrSource: 'علم النفس السلوكي الحديث',
    message:
      'يؤكد علم النفس السلوكي أن الاستمرارية لا تصنع النتائج فحسب، بل ترسّخ هويتك الذاتية كمهندس منضبط لا يتنازل عن أهدافه اليومية!',
    psychologicalExplanation:
      'كل فعل يومي هو تصويت نفسي لصالح الشخص الذي تطمح أن تكونه.',
  },
  {
    id: 'psych-dopamine-reward',
    principleAr: 'نظام المكافأة وتوقع الدوبامين (Dopamine Reward Loop)',
    scientistOrSource: 'مقالات علم الأعصاب السلوكي',
    message:
      'بحسب علم الأعصاب السلوكي: دماغك يفرز الدوبامين عند رؤية تقدمك البصري وانتقال مهامك لقسم المكتملة — أنجز يومك الآن لتعزيز دائرة المكافأة الذاتية!',
    psychologicalExplanation:
      'التغذية الراجعة البصرية الفورية عند الإنجاز تبرمج الدماغ على حب الالتزام اليومي.',
  },
  {
    id: 'psych-activation-energy',
    principleAr: 'طاقة التفعيل وتخفيض عتبة البدء (Activation Energy)',
    scientistOrSource: 'مقالات علم نفس الإنجاز والإنتاجية',
    message:
      'توضح مقالات علم نفس الإنجاز أن أصعب جزء على الدماغ هو لحظة البدء؛ بمجرد تشغيل عداد الوقت تتلاشى المقاومة النفسية ويتدفق العمل بسلاسة!',
    psychologicalExplanation:
      'تقليل الجهد المطلوب للانطلاق يكسر حاجز المماطلة ويفعّل القشرة الجبهية المسؤولة عن التنفيذ.',
  },
];

export function getPsychologyMotivationalInsight(
  seedIndex = 0
): PsychologyMotivationalInsight {
  const list = PSYCHOLOGY_MOTIVATIONAL_INSIGHTS;
  const safeIdx =
    ((Math.floor(seedIndex) % list.length) + list.length) % list.length;
  return list[safeIdx];
}

export function partitionTasksByCompletion(tasks: Task[]): {
  activeTasks: Task[];
  completedTasks: Task[];
} {
  const activeTasks: Task[] = [];
  const completedTasks: Task[] = [];
  for (const task of tasks) {
    if (task.completed) {
      completedTasks.push(task);
    } else {
      activeTasks.push(task);
    }
  }
  return { activeTasks, completedTasks };
}

export interface DailyPsychologyQuotePayload {
  dateStr: string;
  quoteAr: string;
  quoteEn: string;
  authorAr: string;
  authorEn: string;
  psychologyPrincipleAr: string;
  behavioralTipAr: string;
  sourceService: string;
}

export const DAILY_PSYCHOLOGY_QUOTES_CORPUS: Omit<
  DailyPsychologyQuotePayload,
  'dateStr' | 'sourceService'
>[] = [
  {
    quoteAr:
      'نحن ما نفعله بانتظام؛ فالتميز الهندسي والذهني ليس فعلاً عابراً بل هو عادة يومية راسخة في الدماغ.',
    quoteEn:
      'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    authorAr: 'ويليام جيمس / أرسطو — علم نفس العادات',
    authorEn: 'William James / Aristotle',
    psychologyPrincipleAr: 'قانون اللدونة العصبية وتكوين العادات (Habit Plasticity)',
    behavioralTipAr:
      'ابدأ بأهم مهمة في جدولك صباحاً لتثبيت المسار العصبي للإنجاز منذ الساعة الأولى.',
  },
  {
    quoteAr:
      'لا تنتظر توفر الحافز كي تبدأ العمل؛ بل ابدأ العمل أولاً وسيتولد الحافز والدوبامين تلقائياً كاستجابة عصبية للحركة.',
    quoteEn:
      'Action precedes motivation; once you begin the task, your brain generates the momentum to finish it.',
    authorAr: 'د. جيروم برونر — علم النفس المعرفي بجامعة هارفارد',
    authorEn: 'Dr. Jerome Bruner — Harvard Cognitive Psychology',
    psychologyPrincipleAr: 'مبدأ الفعل يسبق الدافع (Behavioral Activation)',
    behavioralTipAr:
      'شغّل عداد الوقت لمدة 5 دقائق فقط على أول مهمة لكسر حاجز المقاومة الذهنية فوراً.',
  },
  {
    quoteAr:
      'أعظم اكتشاف في علم النفس هو أن الإنسان يستطيع تغيير مستقبله وإنتاجيته بتغيير اتجاهاته الذهنية وعاداته اليومية.',
    quoteEn:
      'The greatest discovery of any generation is that a human can alter their life by altering their attitude.',
    authorAr: 'ويليام جيمس — مؤسس علم النفس الحديث',
    authorEn: 'William James',
    psychologyPrincipleAr: 'إعادة الهيكلة المعرفية (Cognitive Reframing)',
    behavioralTipAr:
      'تعامل مع كل مهمة مكتملة في جدولك كدليل عملي يعزز كفاءتك الذاتية.',
  },
  {
    quoteAr:
      'التركيز العميق على مهمة واحدة محددة بوقت واضح يدخل العقل في حالة التدفق القصوى ويضاعف جودة المخرجات.',
    quoteEn:
      'Concentration on a clear goal with immediate feedback creates the optimal experience of Flow.',
    authorAr: 'د. ميهالي تشيكسنتميهالي — علم النفس الإيجابي',
    authorEn: 'Dr. Mihaly Csikszentmihalyi',
    psychologyPrincipleAr: 'نظرية التدفق الذهني (Flow State Psychology)',
    behavioralTipAr:
      'استخدم زر «البدء» لتشغيل العداد التنازلي والتركيز على مهمة واحدة دون تشتت.',
  },
  {
    quoteAr:
      'الإنجازات الصغيرة المتراكمة كل يوم هي المحرك الأقوى للثقة بالنفس والصلابة الذهنية أمام المشاريع الكبرى.',
    quoteEn:
      'Of all the things that can boost inner work life, the most important is making progress in meaningful work.',
    authorAr: 'د. تيريزا أمابيل — أبحاث علم النفس في هارفارد',
    authorEn: 'Dr. Teresa Amabile',
    psychologyPrincipleAr: 'مبدأ التقدم اليومي (The Progress Principle)',
    behavioralTipAr:
      'قسّم مشاريعك الهندسية الكبيرة إلى مهام يومية واضحة وانقلها تباعاً إلى قسم المكتملة.',
  },
  {
    quoteAr:
      'الالتزام بنظام يومي واضح يحرر عقلك من إرهاق القرارات المتكررة ويحفظ طاقتك الذهنية للإبداع وحل المشكلات.',
    quoteEn:
      'You do not rise to the level of your goals. You fall to the level of your systems.',
    authorAr: 'جيمس كلير — علم النفس السلوكي وبناء الأنظمة',
    authorEn: 'James Clear',
    psychologyPrincipleAr: 'حفظ الطاقة الإدراكية وتقليل إجهاد القرار (Decision Fatigue Reduction)',
    behavioralTipAr:
      'اعتمد على قوالب المهام الجاهزة وجداول التحدي لتقليل وقت التخطيط والانطلاق المباشر.',
  },
  {
    quoteAr:
      'ثقة الإنسان بقدرته على إنجاز المهمة المحددة أمامه هي العامل النفسي الأول الذي يحدد مقدار جهده ومثابرته.',
    quoteEn:
      'Self-efficacy is the belief in one’s capabilities to organize and execute the courses of action required to manage prospective situations.',
    authorAr: 'د. ألبيرت باندورا — جامعة ستانفورد',
    authorEn: 'Dr. Albert Bandura',
    psychologyPrincipleAr: 'نظرية الكفاءة الذاتية (Self-Efficacy Theory)',
    behavioralTipAr:
      'احتفِ بكل مهمة تنتقل إلى قسم المهام المكتملة بالأسفل لأنها تغذي ثقتك الذاتية.',
  },
];

export function computeDateHashIndex(dateStr: string, offset = 0): number {
  let hash = 0;
  const clean = (dateStr || TODAY_DATE_STR).trim();
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  const len = DAILY_PSYCHOLOGY_QUOTES_CORPUS.length;
  return (((hash + Math.max(0, Math.floor(offset))) % len) + len) % len;
}

export function buildDailyPsychologyQuote(
  dateStr = TODAY_DATE_STR,
  offset = 0,
  externalApiData?: {
    quoteEn?: string;
    authorEn?: string;
    sourceService?: string;
  }
): DailyPsychologyQuotePayload {
  const idx = computeDateHashIndex(dateStr, offset);
  const base = DAILY_PSYCHOLOGY_QUOTES_CORPUS[idx];
  return {
    dateStr,
    quoteAr: base.quoteAr,
    quoteEn: externalApiData?.quoteEn?.trim() || base.quoteEn,
    authorAr: base.authorAr,
    authorEn: externalApiData?.authorEn?.trim() || base.authorEn,
    psychologyPrincipleAr: base.psychologyPrincipleAr,
    behavioralTipAr: base.behavioralTipAr,
    sourceService:
      externalApiData?.sourceService?.trim() ||
      'Quotable & Psychology Daily API',
  };
}

