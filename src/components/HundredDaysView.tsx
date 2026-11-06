import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Award,
  Bell,
  BellRing,
  Brain,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Crown,
  Edit3,
  ExternalLink,
  Flame,
  FolderPlus,
  Gem,
  LayoutGrid,
  ListChecks,
  Lock,
  LogIn,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
  Volume2,
} from 'lucide-react';
import {
  calculateHundredDaysMetrics,
  CHALLENGE_NOTIFICATION_TONES,
  ChallengeCheckIcon,
  ChallengeGoalMode,
  ChallengeNotificationTone,
  CreateSeparateChallengeOptions,
  formatCountdownMMSS,
  getChallengeNotificationToneOption,
  getChallengesList,
  getPsychologyMotivationalInsight,
  HundredDaysState,
  PSYCHOLOGY_MOTIVATIONAL_INSIGHTS,
  resolveChallengeDayGoal,
  shouldTriggerChallengeReminder,
  verifyChallengePasscode,
} from '../utils/taskLogic';
import { playChallengeNotificationTone } from '../utils/soundTones';

interface HundredDaysViewProps {
  state: HundredDaysState;
  lockTriggerKey?: number;
  onToggleDay: (dayNumber: number) => void;
  onAddHabit: (title: string, targetMinutes: number) => void;
  onRemoveHabit: (habitId: string) => void;
  onReorderHabit?: (habitId: string, direction: 'up' | 'down') => void;
  onUpdateChallengeConfig?: (patch: {
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
  }) => void;
  onUpdateDayGoal?: (dayNumber: number, goalText: string) => void;
  onSelectSeparateChallenge?: (challengeId: string) => void;
  onAddNewSeparateChallenge?: (
    title: string,
    totalDays: number,
    checkIcon: ChallengeCheckIcon,
    options?: CreateSeparateChallengeOptions
  ) => void;
  onDeleteSeparateChallenge?: (challengeId: string) => void;
  onBackToTasks?: () => void;
}

const CHECK_ICON_OPTIONS: {
  id: ChallengeCheckIcon;
  label: string;
}[] = [
  { id: 'check', label: 'علامة صح (✓)' },
  { id: 'crown', label: 'التاج الملكي' },
  { id: 'star', label: 'النجمة الذهبية' },
  { id: 'flame', label: 'شعلة الإنجاز' },
  { id: 'trophy', label: 'كأس البطولة' },
  { id: 'gem', label: 'الجوهرة' },
  { id: 'shield', label: 'درع الالتزام' },
];

const REMINDER_TIME_PRESETS = [
  { value: '08:00', label: '08:00 صباحاً' },
  { value: '14:00', label: '02:00 ظهراً' },
  { value: '18:00', label: '06:00 مساءً' },
  { value: '20:00', label: '08:00 مساءً' },
  { value: '21:30', label: '09:30 مساءً' },
];

export function renderChallengeCheckIcon(
  iconType: ChallengeCheckIcon,
  className = 'w-3.5 h-3.5'
): React.ReactNode {
  switch (iconType) {
    case 'crown':
      return <Crown className={className} aria-hidden="true" />;
    case 'star':
      return <Star className={`${className} fill-current`} aria-hidden="true" />;
    case 'flame':
      return <Flame className={`${className} fill-current`} aria-hidden="true" />;
    case 'gem':
      return <Gem className={className} aria-hidden="true" />;
    case 'trophy':
      return <Trophy className={className} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'check':
    default:
      return <Check className={`${className} stroke-[3]`} aria-hidden="true" />;
  }
}

export const HundredDaysView: React.FC<HundredDaysViewProps> = ({
  state,
  lockTriggerKey = 0,
  onToggleDay,
  onAddHabit,
  onRemoveHabit,
  onReorderHabit,
  onUpdateChallengeConfig,
  onUpdateDayGoal,
  onSelectSeparateChallenge,
  onAddNewSeparateChallenge,
  onDeleteSeparateChallenge,
  onBackToTasks,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [screenMode, setScreenMode] = useState<'directory' | 'table'>('directory');
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [lockError, setLockError] = useState<boolean>(false);

  // Immediately re-prompt for password whenever user clicks the Challenges icon
  useEffect(() => {
    setIsUnlocked(false);
    setScreenMode('directory');
    setPasscodeInput('');
    setLockError(false);
  }, [lockTriggerKey]);

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitMinutes, setNewHabitMinutes] = useState<number>(30);
  const [selectedDayForGoal, setSelectedDayForGoal] = useState<number>(1);
  const [showAllDayFields, setShowAllDayFields] = useState<boolean>(true);

  // Auto-Rotating Psychology Motivational Messages State
  const [autoPsychologyMode, setAutoPsychologyMode] = useState<boolean>(true);
  const [psychIndex, setPsychIndex] = useState<number>(0);
  const currentPsychInsight = useMemo(
    () => getPsychologyMotivationalInsight(psychIndex),
    [psychIndex]
  );

  // Auto-rotate psychology motivational messages every 9 seconds when enabled
  useEffect(() => {
    if (!autoPsychologyMode) return;
    const interval = window.setInterval(() => {
      setPsychIndex((prev) => (prev + 1) % PSYCHOLOGY_MOTIVATIONAL_INSIGHTS.length);
    }, 9000);
    return () => window.clearInterval(interval);
  }, [autoPsychologyMode]);

  // Challenge Day & Habit Live Countdown Timers ("البدء" و"الإنجاز" بجانب الوقت في جدول التحدي)
  const [challengeDayTargetMins, setChallengeDayTargetMins] =
    useState<number>(30);
  const [activeTimerDay, setActiveTimerDay] = useState<number | null>(null);
  const [dayRemainingSecs, setDayRemainingSecs] = useState<number>(30 * 60);
  const [isDayTimerRunning, setIsDayTimerRunning] = useState<boolean>(false);

  const [activeHabitTimerId, setActiveHabitTimerId] = useState<string | null>(
    null
  );
  const [habitRemainingSecs, setHabitRemainingSecs] = useState<number>(30 * 60);
  const [isHabitTimerRunning, setIsHabitTimerRunning] =
    useState<boolean>(false);
  const [completedHabitIds, setCompletedHabitIds] = useState<
    Record<string, boolean>
  >({});

  // Sync idle day countdown when target minutes change
  useEffect(() => {
    if (!isDayTimerRunning) {
      setDayRemainingSecs(Math.max(1, challengeDayTargetMins) * 60);
    }
  }, [challengeDayTargetMins, isDayTimerRunning]);

  // 1-second tick for Challenge Day Countdown
  useEffect(() => {
    if (!isDayTimerRunning) return;
    const timer = window.setInterval(() => {
      setDayRemainingSecs((prev) => {
        if (prev <= 1) {
          setIsDayTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isDayTimerRunning]);

  // 1-second tick for Challenge Habit Countdown
  useEffect(() => {
    if (!isHabitTimerRunning) return;
    const timer = window.setInterval(() => {
      setHabitRemainingSecs((prev) => {
        if (prev <= 1) {
          setIsHabitTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isHabitTimerRunning]);

  const handleToggleDayCountdown = (dayNum: number) => {
    if (activeTimerDay !== dayNum) {
      setActiveTimerDay(dayNum);
      setDayRemainingSecs(Math.max(1, challengeDayTargetMins) * 60);
      setIsDayTimerRunning(true);
      return;
    }
    if (dayRemainingSecs <= 0) {
      setDayRemainingSecs(Math.max(1, challengeDayTargetMins) * 60);
      setIsDayTimerRunning(true);
      return;
    }
    setIsDayTimerRunning((prev) => !prev);
  };

  const handleResetDayCountdown = () => {
    setIsDayTimerRunning(false);
    setDayRemainingSecs(Math.max(1, challengeDayTargetMins) * 60);
  };

  const handleToggleHabitCountdown = (habitId: string, targetMinutes: number) => {
    if (activeHabitTimerId !== habitId) {
      setActiveHabitTimerId(habitId);
      setHabitRemainingSecs(Math.max(1, targetMinutes) * 60);
      setIsHabitTimerRunning(true);
      return;
    }
    if (habitRemainingSecs <= 0) {
      setHabitRemainingSecs(Math.max(1, targetMinutes) * 60);
      setIsHabitTimerRunning(true);
      return;
    }
    setIsHabitTimerRunning((prev) => !prev);
  };

  const handleToggleHabitComplete = (habitId: string) => {
    if (activeHabitTimerId === habitId) {
      setIsHabitTimerRunning(false);
    }
    setCompletedHabitIds((prev) => ({ ...prev, [habitId]: !prev[habitId] }));
  };

  // New Separate Challenge Creation Form State (عند فتح جدول جديد)
  const [newChallengeName, setNewChallengeName] = useState('');
  const [newChallengeDays, setNewChallengeDays] = useState<number>(30);
  const [newChallengeIcon, setNewChallengeIcon] =
    useState<ChallengeCheckIcon>('crown');
  const [newChallengeGoalMode, setNewChallengeGoalMode] =
    useState<ChallengeGoalMode>('general');
  const [newChallengeGeneralGoal, setNewChallengeGeneralGoal] = useState('');
  const [newChallengeDayGoals, setNewChallengeDayGoals] = useState<
    Record<number, string>
  >({});
  const [newChallengePreviewDay, setNewChallengePreviewDay] = useState<number>(1);
  const [newChallengeReminderTime, setNewChallengeReminderTime] =
    useState<string>('20:00');
  const [newChallengeReminderTone, setNewChallengeReminderTone] =
    useState<ChallengeNotificationTone>('royal-chime');
  const [newChallengeMotivationalMsg, setNewChallengeMotivationalMsg] =
    useState<string>('');

  // Reminder Toast & Notification state
  const [reminderBannerMessage, setReminderBannerMessage] = useState<string | null>(
    null
  );
  const lastNotifiedMinuteRef = useRef<string>('');

  const challengesList = useMemo(() => getChallengesList(state), [state]);
  const activeChallengeId = state.activeChallengeId || challengesList[0]?.id;

  const totalDays = Math.max(1, Math.min(100, state.totalDays ?? 100));
  const activeDayNumber = Math.min(selectedDayForGoal, totalDays);
  const checkIcon: ChallengeCheckIcon = state.checkIcon ?? 'check';
  const challengeTitle =
    state.challengeTitle ?? 'التحدي الأول: الانضباط والروتين الملكي';
  const goalMode: ChallengeGoalMode = state.goalMode ?? 'general';
  const generalGoal = state.generalGoal ?? state.goalDescription ?? '';
  const dayGoals = state.dayGoals ?? {};
  const reminderTime = state.reminderTime ?? '20:00';
  const reminderEnabled = state.reminderEnabled ?? true;
  const reminderTone: ChallengeNotificationTone =
    state.reminderTone ?? 'royal-chime';
  const activeToneOption = useMemo(
    () => getChallengeNotificationToneOption(reminderTone),
    [reminderTone]
  );
  const motivationalMessage = state.motivationalMessage ?? '';

  const metrics = useMemo(() => calculateHundredDaysMetrics(state), [state]);
  const completedSet = useMemo(
    () => new Set(state.completedDays),
    [state.completedDays]
  );

  const daysArray = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => i + 1),
    [totalDays]
  );

  // Automatic Daily Reminder Check for the Selected Challenge
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;
      const stampKey = `${activeChallengeId}-${currentHHMM}`;

      if (lastNotifiedMinuteRef.current === stampKey) return;

      const check = shouldTriggerChallengeReminder(state, currentHHMM);
      if (check.shouldNotify) {
        lastNotifiedMinuteRef.current = stampKey;
        playChallengeNotificationTone(check.reminderTone);
        setReminderBannerMessage(check.message);
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification(check.title, { body: check.message });
          } catch {
            // Ignore notification errors in restricted contexts
          }
        }
      }
    };

    checkReminder();
    const timer = window.setInterval(checkReminder, 20000);
    return () => window.clearInterval(timer);
  }, [state, activeChallengeId]);

  const handleTestOrEnableReminder = async () => {
    const nextDay = daysArray.find((d) => !completedSet.has(d)) ?? 1;
    const goalForNextDay = resolveChallengeDayGoal(state, nextDay);
    const nextInsight = getPsychologyMotivationalInsight(psychIndex);
    const activeMotivation =
      autoPsychologyMode || !motivationalMessage.trim()
        ? nextInsight.message
        : motivationalMessage.trim();

    if (autoPsychologyMode) {
      setPsychIndex((prev) => (prev + 1) % PSYCHOLOGY_MOTIVATIONAL_INSIGHTS.length);
    }

    // Play the distinct notification tone configured for this challenge
    playChallengeNotificationTone(reminderTone);

    const previewMsg = `[نغمة: ${activeToneOption.label}] ${activeMotivation} — (اليوم رقم ${nextDay} من ${totalDays}${
      goalForNextDay ? `: ${goalForNextDay}` : ''
    })`;

    setReminderBannerMessage(previewMsg);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          new Notification(`تذكير التحدي: ${challengeTitle}`, {
            body: previewMsg,
          });
        }
      } catch {
        // Ignore permission errors in iframe
      }
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyChallengePasscode(passcodeInput)) {
      setIsUnlocked(true);
      setScreenMode('directory');
      setLockError(false);
      setPasscodeInput('');
    } else {
      setLockError(true);
      setPasscodeInput('');
    }
  };

  const handleOpenChallengeFromDirectory = (challengeId: string) => {
    onSelectSeparateChallenge?.(challengeId);
    setScreenMode('table');
  };

  const handleCreateSeparateChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newChallengeName.trim();
    if (!clean) return;
    onAddNewSeparateChallenge?.(clean, newChallengeDays, newChallengeIcon, {
      goalMode: newChallengeGoalMode,
      generalGoal: newChallengeGeneralGoal.trim(),
      dayGoals:
        newChallengeGoalMode === 'custom_per_day' ? newChallengeDayGoals : {},
      reminderTime: newChallengeReminderTime,
      reminderEnabled: true,
      reminderTone: newChallengeReminderTone,
      motivationalMessage: newChallengeMotivationalMsg.trim(),
    });
    setNewChallengeName('');
    setNewChallengeGeneralGoal('');
    setNewChallengeDayGoals({});
    setNewChallengeMotivationalMsg('');
    setScreenMode('table');
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newHabitTitle.trim();
    if (!clean) return;
    onAddHabit(clean, newHabitMinutes);
    setNewHabitTitle('');
  };

  const handleDayGoalChange = (dayNum: number, text: string) => {
    if (onUpdateDayGoal) {
      onUpdateDayGoal(dayNum, text);
      return;
    }
    const nextGoals: Record<number, string> = { ...dayGoals };
    if (text.trim() === '') {
      delete nextGoals[dayNum];
    } else {
      nextGoals[dayNum] = text;
    }
    onUpdateChallengeConfig?.({ dayGoals: nextGoals });
  };

  const nextUncompletedDay =
    daysArray.find((d) => !completedSet.has(d)) ?? null;

  const dayPresets = [7, 14, 21, 30, 40, 60, 90, 100];

  // ============================================================================
  // STAGE 1: LOGIN SCREEN (تسجيل الدخول لبوابة جداول التحدي)
  // ============================================================================
  if (!isUnlocked) {
    return (
      <div className="min-h-[72vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/40 rounded-2xl p-7 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              بوابة التحديات المستقلة · مهام المهندس حسين علاء
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display royal-gold-text">
              تسجيل الدخول إلى نظام جداول التحدي
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              أدخل كلمة المرور ثم اضغط تسجيل الدخول لإظهار القائمة الخاصة بجداول التحدي المنفصلة.
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label htmlFor="challenge-passcode-input" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="challenge-passcode-input"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  if (lockError) setLockError(false);
                }}
                placeholder="••••"
                className="w-full px-4 py-3 text-center text-lg font-mono tracking-[0.4em] bg-zinc-50 dark:bg-[#090A0E] text-zinc-900 dark:text-amber-300 border border-zinc-300 dark:border-amber-500/35 rounded-xl focus:outline-none focus:border-amber-400"
              />
              {lockError && (
                <p
                  role="alert"
                  className="mt-2 text-xs font-semibold text-red-500 dark:text-red-400"
                >
                  كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl royal-gold-btn transition-all cursor-pointer shadow-sm"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>تسجيل الدخول</span>
              </button>
              {onBackToTasks && (
                <button
                  type="button"
                  onClick={onBackToTasks}
                  className="py-2.5 px-4 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 transition-colors cursor-pointer"
                >
                  العودة للمهام
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // STAGE 2: DEDICATED CHALLENGES DIRECTORY MENU (تظهر مباشرة بعد الضغط على تسجيل الدخول)
  // ============================================================================
  if (screenMode === 'directory') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Active Reminder Toast Banner if Triggered */}
        {reminderBannerMessage && (
          <div
            role="status"
            aria-live="polite"
            className="px-4 py-3 rounded-xl bg-gradient-to-l from-amber-500/20 via-[#12131A] to-[#0A0B0E] border border-amber-400 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <BellRing
                className="w-4 h-4 text-amber-400 shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-amber-200">
                {reminderBannerMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReminderBannerMessage(null)}
              className="px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-500/10 rounded-lg cursor-pointer"
            >
              إغلاق التنبيه
            </button>
          </div>
        )}

        {/* Directory Header Banner */}
        <section
          aria-label="القائمة الخاصة بجداول التحدي المنفصلة"
          className="bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl royal-gold-btn flex items-center justify-center shrink-0">
                <ListChecks className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  نظام التحديات المستقل · منعزل تماماً عن المهام اليومية
                </span>
                <h1 className="text-xl sm:text-2xl font-bold font-display royal-gold-text">
                  القائمة الخاصة بجداول التحدي ({challengesList.length} جداول منفصلة)
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  اختر أي جدول تحدٍّ لفتحه، أو اضبط ساعة التذكير اليومي، أو افتح جدولاً جديداً مع تحديد الأهداف العامة أو الخاصة.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsUnlocked(false);
                  setPasscodeInput('');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-[#14161D] text-zinc-800 dark:text-amber-300 border border-amber-500/35 hover:border-amber-400 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>تسجيل خروج / قفل القائمة</span>
              </button>
              {onBackToTasks && (
                <button
                  type="button"
                  onClick={onBackToTasks}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>العودة لصفحة المهام</span>
                </button>
              )}
            </div>
          </div>

          {/* DAILY REMINDER TIME SETTING IN CHALLENGES MENU (إعداد ساعة التذكير اليومي لجدول التحدي المختار) */}
          <div
            aria-label="إعداد ساعة الإشعارات اليومية لجدول التحدي المختار"
            className="p-4 rounded-xl bg-gradient-to-l from-amber-500/10 via-[#0D0E13] to-[#0A0B0F] border border-amber-500/35 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Bell className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
                    إعداد إشعارات التذكير اليومي لجدول التحدي المختار
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    حدد الساعة التي تصل فيها إشعارات يومية لتذكيرك بالالتزام بـ:{' '}
                    <strong className="text-amber-500 dark:text-amber-300">
                      {challengeTitle}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label
                  htmlFor="directory-challenge-select-reminder"
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  الجدول المختار:
                </label>
                <select
                  id="directory-challenge-select-reminder"
                  value={activeChallengeId}
                  onChange={(e) => onSelectSeparateChallenge?.(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/35 rounded-lg cursor-pointer"
                >
                  {challengesList.map((c, i) => (
                    <option key={c.id} value={c.id}>
                      #{i + 1} — {c.challengeTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <label
                    htmlFor="challenge-reminder-time-input"
                    className="text-xs font-semibold text-zinc-700 dark:text-amber-200"
                  >
                    ساعة الإشعار اليومي:
                  </label>
                  <input
                    id="challenge-reminder-time-input"
                    type="time"
                    value={reminderTime}
                    onChange={(e) =>
                      onUpdateChallengeConfig?.({ reminderTime: e.target.value })
                    }
                    className="px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/40 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {REMINDER_TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() =>
                        onUpdateChallengeConfig?.({
                          reminderTime: preset.value,
                          reminderEnabled: true,
                        })
                      }
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer ${
                        reminderTime === preset.value
                          ? 'royal-gold-btn border-amber-400 font-bold'
                          : 'bg-white dark:bg-[#121318] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateChallengeConfig?.({
                      reminderEnabled: !reminderEnabled,
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    reminderEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  {reminderEnabled
                    ? `التذكير اليومي مفعّل (${reminderTime})`
                    : 'التذكير اليومي متوقف'}
                </button>

                <button
                  type="button"
                  onClick={handleTestOrEnableReminder}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg royal-gold-btn transition-all cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>تفعيل وتجربة الإشعار الآن</span>
                </button>
              </div>
            </div>

            {/* Challenge Distinct Notification Tone Selector (اختيار نغمة إشعار مخصصة لهذا التحدي) */}
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <Volume2 className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <label
                  htmlFor="directory-reminder-tone-select"
                  className="text-xs font-bold text-zinc-800 dark:text-amber-200"
                >
                  نغمة إشعار هذا التحدي (للتمييز بين التحديات دون فتح التطبيق):
                </label>
                <select
                  id="directory-reminder-tone-select"
                  value={reminderTone}
                  onChange={(e) => {
                    const nextTone = e.target.value as ChallengeNotificationTone;
                    onUpdateChallengeConfig?.({ reminderTone: nextTone });
                    playChallengeNotificationTone(nextTone);
                  }}
                  aria-label="نغمة إشعار التحدي المختار"
                  className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/40 rounded-lg cursor-pointer"
                >
                  {CHALLENGE_NOTIFICATION_TONES.map((toneOpt) => (
                    <option key={toneOpt.id} value={toneOpt.id}>
                      {toneOpt.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {activeToneOption.description}
                </span>
              </div>

              <button
                type="button"
                onClick={() => playChallengeNotificationTone(reminderTone)}
                aria-label="معاينة نغمة إشعار التحدي المختار"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>معاينة النغمة</span>
              </button>
            </div>

            {/* Auto-Rotating Psychology Motivational Messages + Custom Override */}
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/35 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Brain
                      className="w-4 h-4 text-amber-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-zinc-900 dark:text-amber-300 font-display">
                      الرسائل التحفيزية المتغيرة تلقائياً حسب المقالات النفسية وعلم النفس
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAutoPsychologyMode((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        autoPsychologyMode
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                          : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-500 border-zinc-300 dark:border-zinc-800'
                      }`}
                    >
                      {autoPsychologyMode
                        ? 'التغيير التلقائي حسب علم النفس: مفعّل'
                        : 'التغيير التلقائي: متوقف'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPsychIndex(
                          (prev) =>
                            (prev + 1) % PSYCHOLOGY_MOTIVATIONAL_INSIGHTS.length
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold royal-gold-btn cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" aria-hidden="true" />
                      <span>مقال نفسي تالي</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {currentPsychInsight.principleAr} ·{' '}
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {currentPsychInsight.scientistOrSource}
                  </span>
                </div>

                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  «{currentPsychInsight.message}»
                </p>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  التفسير النفسي: {currentPsychInsight.psychologicalExplanation}
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="directory-motivational-msg-input"
                  className="text-xs font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    أو اكتب رسالة تحفيزية مخصصة ثابتة (تُستخدم عند إيقاف التغيير التلقائي):
                  </span>
                </label>
                <input
                  id="directory-motivational-msg-input"
                  type="text"
                  value={motivationalMessage}
                  onChange={(e) =>
                    onUpdateChallengeConfig?.({
                      motivationalMessage: e.target.value,
                    })
                  }
                  placeholder="اتركه فارغاً ليعتمد تلقائياً على رسائل ومقالات علم النفس المتجددة..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 border border-amber-500/40 rounded-lg focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* CREATE NEW SEPARATE CHALLENGE TABLE WITH GOAL MODE SELECTION (الأهداف العامة مقابل الأهداف الخاصة لكل يوم) */}
          <form
            onSubmit={handleCreateSeparateChallengeSubmit}
            className="p-5 rounded-xl bg-zinc-50 dark:bg-[#0B0C10] border border-zinc-200 dark:border-amber-500/30 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-amber-300 font-display">
                <FolderPlus className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>
                  فتح وإنشاء جدول تحدٍّ جديد — حدد نوع الأهداف (أهداف عامة لجميع الأيام أو أهداف خاصة لكل يوم)
                </span>
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                يُفتح الجدول الجديد مباشرة بعد الإنشاء
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label
                  htmlFor="new-challenge-list-input"
                  className="block text-xs font-semibold text-zinc-700 dark:text-amber-200 mb-1"
                >
                  اسم جدول التحدي الجديد
                </label>
                <input
                  id="new-challenge-list-input"
                  type="text"
                  value={newChallengeName}
                  onChange={(e) => setNewChallengeName(e.target.value)}
                  placeholder="مثال: التحدي السادس: إتقان البرمجة والانضباط..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="new-challenge-days-select"
                  className="block text-xs font-semibold text-zinc-700 dark:text-amber-200 mb-1"
                >
                  عدد الأيام
                </label>
                <select
                  id="new-challenge-days-select"
                  value={newChallengeDays}
                  onChange={(e) => setNewChallengeDays(Number(e.target.value))}
                  aria-label="عدد أيام التحدي الجديد"
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-white dark:bg-[#121318] text-zinc-800 dark:text-amber-300 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                >
                  <option value={7}>7 أيام</option>
                  <option value={14}>14 يوم</option>
                  <option value={21}>21 يوم</option>
                  <option value={30}>30 يوم</option>
                  <option value={45}>45 يوم</option>
                  <option value={60}>60 يوم</option>
                  <option value={90}>90 يوم</option>
                  <option value={100}>100 يوم</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label
                  htmlFor="new-challenge-icon-select"
                  className="block text-xs font-semibold text-zinc-700 dark:text-amber-200 mb-1"
                >
                  أيقونة الإنجاز
                </label>
                <select
                  id="new-challenge-icon-select"
                  value={newChallengeIcon}
                  onChange={(e) =>
                    setNewChallengeIcon(e.target.value as ChallengeCheckIcon)
                  }
                  aria-label="أيقونة الإنجاز"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-800 dark:text-amber-300 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                >
                  {CHECK_ICON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="new-challenge-reminder-input"
                  className="block text-xs font-semibold text-zinc-700 dark:text-amber-200 mb-1"
                >
                  ساعة التذكير
                </label>
                <input
                  id="new-challenge-reminder-input"
                  type="time"
                  value={newChallengeReminderTime}
                  onChange={(e) => setNewChallengeReminderTime(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                />
              </div>

              <div className="md:col-span-6">
                <label
                  htmlFor="new-challenge-tone-select"
                  className="block text-xs font-semibold text-amber-600 dark:text-amber-300 mb-1"
                >
                  نغمة الإشعار الخاصة بهذا التحدي (للتمييز السمعي دون فتح التطبيق)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="new-challenge-tone-select"
                    value={newChallengeReminderTone}
                    onChange={(e) => {
                      const nextTone = e.target.value as ChallengeNotificationTone;
                      setNewChallengeReminderTone(nextTone);
                      playChallengeNotificationTone(nextTone);
                    }}
                    aria-label="نغمة الإشعار للتحدي الجديد"
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-800 dark:text-amber-300 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                  >
                    {CHALLENGE_NOTIFICATION_TONES.map((toneOpt) => (
                      <option key={toneOpt.id} value={toneOpt.id}>
                        {toneOpt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      playChallengeNotificationTone(newChallengeReminderTone)
                    }
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/40 cursor-pointer shrink-0 inline-flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>استماع</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-6">
                <label
                  htmlFor="new-challenge-motivational-input"
                  className="block text-xs font-semibold text-amber-600 dark:text-amber-300 mb-1"
                >
                  رسالة تحفيزية مخصصة للإشعار اليومي (اختياري — تظهر مع كل إشعار يومي بدلاً من التنبيه الافتراضي)
                </label>
                <input
                  id="new-challenge-motivational-input"
                  type="text"
                  value={newChallengeMotivationalMsg}
                  onChange={(e) => setNewChallengeMotivationalMsg(e.target.value)}
                  placeholder="مثال: خطوة اليوم تقربك من إتمام التحدي يا مهندس حسين!"
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Goal Mode Selection: أهداف عامة vs أهداف خاصة */}
            <div className="space-y-3 pt-1">
              <span className="block text-xs font-bold text-zinc-800 dark:text-amber-200">
                تحديد نظام الأهداف عند فتح الجدول الجديد:
              </span>

              <div
                role="radiogroup"
                aria-label="تحديد نوع الأهداف للجدول الجديد"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={newChallengeGoalMode === 'general'}
                  onClick={() => setNewChallengeGoalMode('general')}
                  className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-3 ${
                    newChallengeGoalMode === 'general'
                      ? 'royal-gold-btn border-amber-300 shadow-sm'
                      : 'bg-white dark:bg-[#121318] border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <Target className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-bold">
                      أهداف عامة (هدف عام موحّد لجميع الأيام)
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        newChallengeGoalMode === 'general'
                          ? 'text-zinc-900'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      تكتب هدفاً عاماً واحداً في «خانة الأهداف العامة» فيُطبّق تلقائياً على جميع أيام الجدول.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={newChallengeGoalMode === 'custom_per_day'}
                  onClick={() => setNewChallengeGoalMode('custom_per_day')}
                  className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-3 ${
                    newChallengeGoalMode === 'custom_per_day'
                      ? 'royal-gold-btn border-amber-300 shadow-sm'
                      : 'bg-white dark:bg-[#121318] border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-bold">
                      أهداف خاصة (لكل يوم هدف معين يختلف عن الآخر)
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        newChallengeGoalMode === 'custom_per_day'
                          ? 'text-zinc-900'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      تخصص لكل يوم من أيام التحدي هدفاً مستقلاً يختلف عن بقية الأيام.
                    </p>
                  </div>
                </button>
              </div>

              {/* Conditional Input based on Selected Goal Mode */}
              {newChallengeGoalMode === 'general' ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#121318] border border-amber-500/35 space-y-1.5">
                  <label
                    htmlFor="new-challenge-general-goal-input"
                    className="block text-xs font-bold text-amber-600 dark:text-amber-300"
                  >
                    خانة الأهداف العامة (تُطبق كهدف عام موحّد على جميع الـ {newChallengeDays} يوماً):
                  </label>
                  <input
                    id="new-challenge-general-goal-input"
                    type="text"
                    value={newChallengeGeneralGoal}
                    onChange={(e) => setNewChallengeGeneralGoal(e.target.value)}
                    placeholder="اكتب الهدف العام هنا (مثال: قراءة 30 صفحة + تمرين رياضي + ساعتين عمل هندسي عميق يومياً)..."
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#090A0E] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#121318] border border-amber-500/35 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-300">
                      تخصيص الأهداف الخاصة لكل يوم (يختلف هدف كل يوم عن الآخر):
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      يمكنك أيضاً تعديل جميع الأيام داخل الجدول بعد فتحه
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={Math.min(newChallengePreviewDay, newChallengeDays)}
                      onChange={(e) =>
                        setNewChallengePreviewDay(Number(e.target.value))
                      }
                      aria-label="اختيار اليوم لتخصيص هدفه الخاص"
                      className="px-3 py-2 text-xs font-mono font-bold bg-zinc-50 dark:bg-[#090A0E] text-amber-600 dark:text-amber-300 border border-amber-500/35 rounded-lg cursor-pointer"
                    >
                      {Array.from(
                        { length: newChallengeDays },
                        (_, idx) => idx + 1
                      ).map((d) => (
                        <option key={d} value={d}>
                          اليوم {d}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={
                        newChallengeDayGoals[
                          Math.min(newChallengePreviewDay, newChallengeDays)
                        ] ?? ''
                      }
                      onChange={(e) => {
                        const dayKey = Math.min(
                          newChallengePreviewDay,
                          newChallengeDays
                        );
                        setNewChallengeDayGoals((prev) => ({
                          ...prev,
                          [dayKey]: e.target.value,
                        }));
                      }}
                      placeholder={`اكتب الهدف الخاص لليوم ${Math.min(
                        newChallengePreviewDay,
                        newChallengeDays
                      )} (يختلف عن بقية الأيام)...`}
                      className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#090A0E] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl royal-gold-btn transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>فتح وإنشاء جدول التحدي الجديد الآن</span>
              </button>
            </div>
          </form>

          {/* Grid of Separate Challenge Tables */}
          <div
            role="list"
            aria-label="قائمة جداول التحدي المستقلة"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1"
          >
            {challengesList.map((item, idx) => {
              const itemTotal = Math.max(1, Math.min(100, item.totalDays || 100));
              const itemDone = item.completedDays.filter(
                (d) => d >= 1 && d <= itemTotal
              ).length;
              const itemPct = Math.round((itemDone / itemTotal) * 100);
              const itemIcon: ChallengeCheckIcon = item.checkIcon || 'check';
              const itemMode: ChallengeGoalMode = item.goalMode ?? 'general';
              const itemGeneralGoal =
                item.generalGoal || item.goalDescription || '';
              const itemReminder = item.reminderTime || '20:00';

              return (
                <article
                  key={item.id}
                  role="listitem"
                  className="rounded-2xl bg-zinc-50 dark:bg-[#0B0C10] border border-zinc-200 dark:border-amber-500/30 hover:border-amber-400 p-5 flex flex-col justify-between gap-4 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-mono font-bold">
                        {renderChallengeCheckIcon(itemIcon, 'w-3.5 h-3.5')}
                        <span>جدول تحدٍّ مستقل #{idx + 1}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono tabular-nums">
                          {itemTotal} يوم
                        </span>
                        {challengesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteSeparateChallenge?.(item.id)}
                            aria-label={`حذف ${item.challengeTitle}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-amber-100 font-display leading-snug">
                        {item.challengeTitle}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300">
                          {itemMode === 'general'
                            ? 'أهداف عامة لجميع الأيام'
                            : 'أهداف خاصة لكل يوم'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200/70 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" aria-hidden="true" />
                          <span>تذكير {itemReminder}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            playChallengeNotificationTone(
                              item.reminderTone ?? 'royal-chime'
                            )
                          }
                          title="اضغط للاستماع إلى نغمة هذا التحدي"
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3 text-amber-400" aria-hidden="true" />
                          <span>
                            {
                              getChallengeNotificationToneOption(
                                item.reminderTone
                              ).label
                            }
                          </span>
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {itemGeneralGoal.trim()
                          ? `الهدف العام: ${itemGeneralGoal}`
                          : 'جدول تحدٍّ مستقل بأيامه وأهدافه ونسبة إنجازه الخاصة.'}
                      </p>
                    </div>

                    {/* Progress bar for this individual challenge */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          الأيام المنجزة:{' '}
                          <strong className="text-amber-400">{itemDone}</strong> من{' '}
                          <strong>{itemTotal}</strong>
                        </span>
                        <span className="font-bold text-amber-500 dark:text-amber-300">
                          {itemPct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-amber-500/20">
                        <div
                          className="h-full royal-gold-btn transition-all duration-300"
                          style={{ width: `${itemPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenChallengeFromDirectory(item.id)}
                    className="w-full py-2.5 px-4 rounded-xl royal-gold-btn text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span>فتح هذا الجدول المستقل</span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // STAGE 3: INDIVIDUAL CHALLENGE TABLE VIEW + DEDICATED CHALLENGES SIDE MENU
  // ============================================================================
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* DEDICATED CHALLENGES-ONLY SIDE MENU (منفصلة تماماً عن قائمة المهام اليومية) */}
      <aside
        aria-label="القائمة الخاصة بجداول التحدي"
        className="w-full lg:w-72 shrink-0 bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/35 rounded-2xl p-4 space-y-4 lg:sticky lg:top-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <h2 className="text-xs font-bold text-zinc-900 dark:text-amber-300 font-display">
              قائمة جداول التحدي الخاصة ({challengesList.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setScreenMode('directory')}
            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            كل الجداول
          </button>
        </div>

        {/* Button to Return to Full Challenges Directory */}
        <button
          type="button"
          onClick={() => setScreenMode('directory')}
          className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          <span>العودة إلى قائمة الجداول الرئيسية</span>
        </button>

        {/* List of Separate Challenge Tables */}
        <nav
          aria-label="التنقل بين جداول التحدي المنفصلة"
          className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5"
        >
          {challengesList.map((item, idx) => {
            const isSelected = item.id === activeChallengeId;
            const itemTotal = Math.max(1, Math.min(100, item.totalDays || 100));
            const itemDone = item.completedDays.filter(
              (d) => d >= 1 && d <= itemTotal
            ).length;
            const itemPct = Math.round((itemDone / itemTotal) * 100);

            return (
              <div
                key={item.id}
                onClick={() => onSelectSeparateChallenge?.(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSeparateChallenge?.(item.id);
                  }
                }}
                className={`w-full text-right p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'royal-gold-btn border-amber-300 shadow-sm'
                    : 'bg-zinc-50 dark:bg-[#0B0C10] border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-zinc-950 text-amber-300'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <p
                      className={`text-xs font-bold truncate ${
                        isSelected
                          ? 'text-zinc-950'
                          : 'text-zinc-900 dark:text-amber-100'
                      }`}
                    >
                      {item.challengeTitle}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-[11px] font-mono tabular-nums ${
                      isSelected
                        ? 'text-zinc-900'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {itemDone}/{itemTotal} يوم · {itemPct}% ·{' '}
                    {item.goalMode === 'custom_per_day' ? 'أهداف خاصة' : 'هدف عام'}
                  </p>
                </div>

                {challengesList.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSeparateChallenge?.(item.id);
                    }}
                    aria-label={`حذف ${item.challengeTitle}`}
                    className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'text-zinc-900 hover:bg-black/15'
                        : 'text-zinc-400 hover:text-red-400'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsUnlocked(false);
              setScreenMode('directory');
              setPasscodeInput('');
            }}
            className="flex-1 py-1.5 px-2.5 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-[#14161D] text-zinc-800 dark:text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
          >
            <Lock className="w-3 h-3 text-amber-400" aria-hidden="true" />
            <span>قفل التحديات</span>
          </button>
          {onBackToTasks && (
            <button
              type="button"
              onClick={onBackToTasks}
              className="py-1.5 px-2.5 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 transition-colors cursor-pointer"
            >
              صفحة المهام
            </button>
          )}
        </div>
      </aside>

      {/* MAIN SELECTED CHALLENGE TABLE WORKSPACE */}
      <div className="flex-1 min-w-0 w-full space-y-6">
        {reminderBannerMessage && (
          <div
            role="status"
            aria-live="polite"
            className="px-4 py-3 rounded-xl bg-gradient-to-l from-amber-500/20 via-[#12131A] to-[#0A0B0E] border border-amber-400 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <BellRing
                className="w-4 h-4 text-amber-400 shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-amber-200">
                {reminderBannerMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReminderBannerMessage(null)}
              className="px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-500/10 rounded-lg cursor-pointer"
            >
              إغلاق التنبيه
            </button>
          </div>
        )}

        {/* Active Challenge Header & Quick Actions */}
        {/* Active Challenge Header & Quick Actions with Inline Time + Start Countdown + Complete */}
        <div className="bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/35 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>
                  جدول التحدي المستقل النشط حالياً ({totalDays} يوم ·{' '}
                  {goalMode === 'general'
                    ? 'أهداف عامة لجميع الأيام'
                    : 'أهداف خاصة لكل يوم'}
                  )
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display royal-gold-text">
                {challengeTitle || 'جدول التحديات'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setScreenMode('directory')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-[#14161D] text-zinc-800 dark:text-amber-300 border border-amber-500/35 hover:border-amber-400 transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>قائمة الجداول المنفصلة</span>
              </button>
            </div>
          </div>

          {/* Inline Time + Countdown + Start ("البدء") + Complete ("الإنجاز") Bar for Active Challenge Day */}
          {nextUncompletedDay !== null && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#090A0E] border border-amber-500/35 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-zinc-800 dark:text-amber-200">
                  تحديد وقت وعدّاد اليوم رقم {nextUncompletedDay}:
                </span>
                <label htmlFor="challenge-day-duration-select" className="sr-only">
                  تحديد وقت اليوم بالدقائق
                </label>
                <select
                  id="challenge-day-duration-select"
                  value={challengeDayTargetMins}
                  onChange={(e) => setChallengeDayTargetMins(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/40 rounded-lg cursor-pointer"
                >
                  <option value={15}>15 دقيقة</option>
                  <option value={20}>20 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                  <option value={45}>45 دقيقة</option>
                  <option value={60}>60 دقيقة</option>
                  <option value={90}>90 دقيقة</option>
                </select>

                <div
                  aria-live="polite"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono tabular-nums font-bold border ${
                    isDayTimerRunning && activeTimerDay === nextUncompletedDay
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-400 animate-pulse'
                      : 'bg-white dark:bg-[#121318] text-zinc-800 dark:text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span>العداد:</span>
                  <span>
                    {formatCountdownMMSS(
                      activeTimerDay === nextUncompletedDay
                        ? dayRemainingSecs
                        : challengeDayTargetMins * 60
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleDayCountdown(nextUncompletedDay)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isDayTimerRunning && activeTimerDay === nextUncompletedDay
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400'
                      : 'royal-gold-btn'
                  }`}
                >
                  {isDayTimerRunning && activeTimerDay === nextUncompletedDay ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>البدء</span>
                    </>
                  )}
                </button>

                {activeTimerDay === nextUncompletedDay && (
                  <button
                    type="button"
                    onClick={handleResetDayCountdown}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-200/70 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>إعادة</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsDayTimerRunning(false);
                    onToggleDay(nextUncompletedDay);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>الإنجاز (اليوم {nextUncompletedDay})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 0: Challenge Settings, Daily Reminder Time, Psychology Motivational Engine, General vs Custom Goals */}
        <section
          aria-labelledby="challenge-settings-heading"
          className="bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/35 rounded-xl p-5 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <h2
                id="challenge-settings-heading"
                className="text-base font-bold text-zinc-900 dark:text-amber-200 font-display"
              >
                إعدادات هذا الجدول، التذكير اليومي، وخانة الأهداف العامة أو الخاصة (1 – 100 يوم)
              </h2>
            </div>

            {/* Dynamic Completion Rate Badge */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">
                الأيام المختارة:{' '}
                <strong className="font-mono tabular-nums text-amber-500 dark:text-amber-300">
                  {totalDays}
                </strong>{' '}
                يوم
              </span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-700 dark:text-amber-300 font-bold font-mono tabular-nums">
                نسبة الإنجاز: {metrics.completionPercentage}% ({metrics.completedDaysCount}/{totalDays})
              </span>
            </div>
          </div>

          {/* Dynamic Progress Bar inside Settings */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                مؤشر الإنجاز الديناميكي حسب عدد الأيام المختار ({totalDays} يوم)
              </span>
              <span className="font-mono tabular-nums font-bold text-amber-500 dark:text-amber-300">
                {metrics.completionPercentage}% مكتمل
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={metrics.completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="نسبة إنجاز التحدي"
              className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-amber-500/30"
            >
              <div
                className="h-full royal-gold-btn transition-all duration-300"
                style={{ width: `${metrics.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Daily Notification Reminder Setting & Auto-Rotating Psychology Motivational Message */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#090A0E] border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-amber-200">
                    ساعة التذكير اليومي والرسائل التحفيزية المتغيرة تلقائياً حسب علم النفس
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    تصل إشعارات يومية في الساعة المحددة مع رسائل تحفيزية متجددة تلقائياً من مقالات علم النفس.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label htmlFor="table-reminder-time-input" className="sr-only">
                  ساعة التذكير اليومي
                </label>
                <input
                  id="table-reminder-time-input"
                  type="time"
                  value={reminderTime}
                  onChange={(e) =>
                    onUpdateChallengeConfig?.({ reminderTime: e.target.value })
                  }
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/40 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateChallengeConfig?.({
                      reminderEnabled: !reminderEnabled,
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    reminderEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  {reminderEnabled ? 'التذكير مفعّل' : 'التذكير متوقف'}
                </button>
                <button
                  type="button"
                  onClick={handleTestOrEnableReminder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg royal-gold-btn transition-all cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>تجربة الإشعار</span>
                </button>
              </div>
            </div>

            {/* Distinct Notification Tone Selector inside Challenge Board Settings */}
            <div className="pt-2.5 border-t border-zinc-200/70 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <Volume2 className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <label
                  htmlFor="table-reminder-tone-select"
                  className="text-xs font-bold text-zinc-800 dark:text-amber-200"
                >
                  نغمة إشعار هذا التحدي:
                </label>
                <select
                  id="table-reminder-tone-select"
                  value={reminderTone}
                  onChange={(e) => {
                    const nextTone = e.target.value as ChallengeNotificationTone;
                    onUpdateChallengeConfig?.({ reminderTone: nextTone });
                    playChallengeNotificationTone(nextTone);
                  }}
                  aria-label="نغمة إشعار هذا التحدي"
                  className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/40 rounded-lg cursor-pointer"
                >
                  {CHALLENGE_NOTIFICATION_TONES.map((toneOpt) => (
                    <option key={toneOpt.id} value={toneOpt.id}>
                      {toneOpt.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {activeToneOption.description}
                </span>
              </div>

              <button
                type="button"
                onClick={() => playChallengeNotificationTone(reminderTone)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>معاينة النغمة</span>
              </button>
            </div>

            {/* Auto-Rotating Psychology Insight Card inside Challenge Board */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/35 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-amber-300 font-display">
                    الرسائل التحفيزية تتغير تلقائياً حسب المقالات النفسية وعلم النفس
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAutoPsychologyMode((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      autoPsychologyMode
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                        : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-500 border-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    {autoPsychologyMode
                      ? 'التغيير التلقائي: مفعّل'
                      : 'التغيير التلقائي: متوقف'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPsychIndex(
                        (prev) =>
                          (prev + 1) % PSYCHOLOGY_MOTIVATIONAL_INSIGHTS.length
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold royal-gold-btn cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>مقال نفسي تالي</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {currentPsychInsight.principleAr} ·{' '}
                <span className="text-zinc-500 dark:text-zinc-400">
                  {currentPsychInsight.scientistOrSource}
                </span>
              </div>

              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                «{currentPsychInsight.message}»
              </p>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                التفسير النفسي: {currentPsychInsight.psychologicalExplanation}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
              <label
                htmlFor="table-motivational-msg-input"
                className="block text-xs font-semibold text-amber-600 dark:text-amber-300"
              >
                أو تخصيص رسالة تحفيزية يدوية ثابتة (اختياري):
              </label>
              <input
                id="table-motivational-msg-input"
                type="text"
                value={motivationalMessage}
                onChange={(e) =>
                  onUpdateChallengeConfig?.({
                    motivationalMessage: e.target.value,
                  })
                }
                placeholder="اتركه فارغاً ليعتمد تلقائياً على رسائل ومقالات علم النفس المتجددة..."
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 border border-amber-500/35 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Right Column: Challenge Title + Goal Mode Switcher + خانة الأهداف العامة */}
            <div className="space-y-3.5">
              <div>
                <label
                  htmlFor="challenge-title-input"
                  className="block text-xs font-semibold text-zinc-700 dark:text-amber-200 mb-1.5"
                >
                  اسم أو عنوان هذا الجدول المنفصل
                </label>
                <input
                  id="challenge-title-input"
                  type="text"
                  value={challengeTitle}
                  onChange={(e) =>
                    onUpdateChallengeConfig?.({ challengeTitle: e.target.value })
                  }
                  placeholder="مثال: التحدي الأول: الانضباط والروتين الملكي..."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#090A0E] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Goal Mode Switcher: أهداف عامة vs أهداف خاصة */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-zinc-700 dark:text-amber-200">
                  نوع الأهداف في هذا الجدول (أهداف عامة أو خاصة):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateChallengeConfig?.({ goalMode: 'general' })
                    }
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      goalMode === 'general'
                        ? 'royal-gold-btn border-amber-400'
                        : 'bg-zinc-50 dark:bg-[#090A0E] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-400'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>أهداف عامة (لجميع الأيام)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateChallengeConfig?.({ goalMode: 'custom_per_day' })
                    }
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      goalMode === 'custom_per_day'
                        ? 'royal-gold-btn border-amber-400'
                        : 'bg-zinc-50 dark:bg-[#090A0E] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>أهداف خاصة (لكل يوم هدف)</span>
                  </button>
                </div>
              </div>

              {/* خانة الأهداف العامة */}
              <div>
                <label
                  htmlFor="challenge-goals-textarea"
                  className="block text-xs font-semibold text-amber-600 dark:text-amber-300 mb-1.5"
                >
                  خانة الأهداف العامة (في وضع الأهداف العامة تُطبق كهدف عام موحّد لجميع الأيام):
                </label>
                <textarea
                  id="challenge-goals-textarea"
                  rows={2}
                  value={generalGoal}
                  onChange={(e) =>
                    onUpdateChallengeConfig?.({
                      generalGoal: e.target.value,
                      goalDescription: e.target.value,
                    })
                  }
                  placeholder="اكتب هنا الهدف العام الموحّد لجميع أيام الجدول..."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#090A0E] text-zinc-900 dark:text-zinc-100 border border-amber-500/35 rounded-lg focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            {/* Left Column: Custom Days Count (1..100) + Custom Check Icon Style */}
            <div className="space-y-4">
              {/* Number of Days Selector (1 to 100) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="challenge-days-number"
                    className="text-xs font-semibold text-zinc-700 dark:text-amber-200"
                  >
                    تحديد عدد أيام هذا الجدول (من 1 إلى 100 يوم)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="challenge-days-number"
                      type="number"
                      min={1}
                      max={100}
                      value={totalDays}
                      onChange={(e) =>
                        onUpdateChallengeConfig?.({
                          totalDays: Number(e.target.value) || 1,
                        })
                      }
                      className="w-16 px-2 py-1 text-center text-xs font-mono tabular-nums font-bold bg-zinc-50 dark:bg-[#090A0E] text-amber-500 dark:text-amber-300 border border-amber-500/40 rounded-md focus:outline-none"
                    />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      يوم
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={100}
                  value={totalDays}
                  aria-label="شريط تحديد عدد الأيام من 1 إلى 100"
                  onChange={(e) =>
                    onUpdateChallengeConfig?.({
                      totalDays: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {dayPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        onUpdateChallengeConfig?.({ totalDays: preset })
                      }
                      className={`px-2.5 py-1 text-[11px] font-mono tabular-nums rounded-md border transition-all cursor-pointer ${
                        totalDays === preset
                          ? 'royal-gold-btn border-amber-400 font-bold'
                          : 'bg-zinc-50 dark:bg-[#090A0E] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-400'
                      }`}
                    >
                      {preset} يوم
                    </button>
                  ))}
                </div>
              </div>

              {/* Completed Check Icon Selector */}
              <div>
                <span className="block text-xs font-semibold text-zinc-700 dark:text-amber-200 mb-1.5">
                  اختر نوع أيقونة الصح للأيام المنجزة في هذا الجدول:
                </span>
                <div
                  role="group"
                  aria-label="اختيار أيقونة الإنجاز للأيام"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
                >
                  {CHECK_ICON_OPTIONS.map((opt) => {
                    const active = checkIcon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          onUpdateChallengeConfig?.({ checkIcon: opt.id })
                        }
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          active
                            ? 'royal-gold-btn border-amber-400 font-bold'
                            : 'bg-zinc-50 dark:bg-[#090A0E] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-400'
                        }`}
                      >
                        {renderChallengeCheckIcon(opt.id, 'w-3.5 h-3.5 shrink-0')}
                        <span className="truncate text-[11px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Per-Day Goal Section: Adapts to 'general' vs 'custom_per_day' */}
          {goalMode === 'general' ? (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/35 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    <span>نظام الأهداف العامة مُفعّل على هذا الجدول (هدف عام لجميع الـ {totalDays} يوماً):</span>
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-amber-100">
                    {generalGoal.trim()
                      ? generalGoal
                      : 'اكتب الهدف العام في «خانة الأهداف العامة» أعلاه ليظهر موحّداً في جميع أيام الجدول.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateChallengeConfig?.({ goalMode: 'custom_per_day' })
                  }
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/35 hover:border-amber-400 cursor-pointer"
                >
                  التبديل إلى أهداف خاصة لكل يوم
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
                    تخصيص الأهداف الخاصة لكل يوم بشكل منفصل (لكل يوم هدف معين يختلف عن الآخر)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllDayFields((prev) => !prev)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {showAllDayFields
                    ? 'إخفاء قائمة حقول الأيام الكاملة'
                    : `عرض جميع حقول الأيام (${totalDays} يوم)`}
                </button>
              </div>

              {/* Quick Day Selector + Goal Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-[#090A0E] border border-zinc-200 dark:border-amber-500/25">
                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor="quick-day-select"
                    className="text-xs font-semibold text-zinc-700 dark:text-amber-300 whitespace-nowrap"
                  >
                    اختر اليوم:
                  </label>
                  <select
                    id="quick-day-select"
                    value={activeDayNumber}
                    onChange={(e) => setSelectedDayForGoal(Number(e.target.value))}
                    className="px-2.5 py-1.5 text-xs font-mono tabular-nums font-bold bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border border-amber-500/35 rounded-lg focus:outline-none cursor-pointer"
                  >
                    {daysArray.map((d) => (
                      <option key={d} value={d}>
                        اليوم {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor="selected-day-goal-input" className="sr-only">
                    هدف اليوم رقم {activeDayNumber}
                  </label>
                  <input
                    id="selected-day-goal-input"
                    type="text"
                    value={dayGoals[activeDayNumber] ?? ''}
                    onChange={(e) =>
                      handleDayGoalChange(activeDayNumber, e.target.value)
                    }
                    placeholder={`اكتب أو عدّل الهدف الخاص لليوم ${activeDayNumber} ليظهر داخل خلية اليوم ${activeDayNumber}...`}
                    className="w-full px-3.5 py-1.5 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Grid of Individual Text Fields for Each Day (1..totalDays) */}
              {showAllDayFields && (
                <div className="max-h-56 overflow-y-auto p-3 rounded-xl bg-zinc-50/70 dark:bg-[#090A0E] border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {daysArray.map((dayNum) => (
                    <div
                      key={dayNum}
                      className="flex items-center gap-2 bg-white dark:bg-[#121318] px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 focus-within:border-amber-400"
                    >
                      <label
                        htmlFor={`day-goal-field-${dayNum}`}
                        className="text-[11px] font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400 shrink-0 w-12"
                      >
                        يوم {dayNum}:
                      </label>
                      <input
                        id={`day-goal-field-${dayNum}`}
                        type="text"
                        value={dayGoals[dayNum] ?? ''}
                        onChange={(e) =>
                          handleDayGoalChange(dayNum, e.target.value)
                        }
                        placeholder={`هدف خاص لليوم ${dayNum}...`}
                        className="w-full text-xs bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 1 (ABOVE THE GRID): Required Daily Habits & Ordering with Inline Time, Start Countdown & Complete */}
        <section
          aria-labelledby="daily-required-tasks-heading"
          className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-amber-500/30 rounded-xl p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h2
                id="daily-required-tasks-heading"
                className="text-base font-bold text-zinc-900 dark:text-amber-200 font-display flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span>العادات والمهام الثابتة لهذا الجدول (مع عدّاد الوقت والبدء والإنجاز)</span>
              </h2>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
              <strong className="font-mono tabular-nums">{state.habits.length}</strong>{' '}
              عادات ثابتة ·{' '}
              <strong className="font-mono tabular-nums">
                {state.habits.reduce((acc, h) => acc + h.targetMinutes, 0)}
              </strong>{' '}
              د/يومياً
            </div>
          </div>

          {state.habits.length > 0 && (
            <ul className="grid grid-cols-1 gap-3">
              {state.habits.map((habit, index) => {
                const isHabitRunning =
                  isHabitTimerRunning && activeHabitTimerId === habit.id;
                const habitSecs =
                  activeHabitTimerId === habit.id
                    ? habitRemainingSecs
                    : habit.targetMinutes * 60;
                const isHabitDone = Boolean(completedHabitIds[habit.id]);

                return (
                  <li
                    key={habit.id}
                    className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-colors ${
                      isHabitDone
                        ? 'bg-emerald-500/10 border-emerald-500/35'
                        : 'bg-zinc-50 dark:bg-[#0D0E12] border-zinc-200/80 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md royal-gold-btn font-mono tabular-nums text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isHabitDone
                              ? 'line-through text-zinc-400 dark:text-zinc-500'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {habit.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            الوقت المحدد:{' '}
                            <strong className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                              {habit.targetMinutes} دقيقة
                            </strong>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded font-mono tabular-nums font-bold border ${
                              isHabitRunning
                                ? 'bg-amber-500/20 text-amber-500 border-amber-400 animate-pulse'
                                : 'bg-white dark:bg-[#121318] text-amber-600 dark:text-amber-300 border-amber-500/30'
                            }`}
                          >
                            العداد: {formatCountdownMMSS(habitSecs)}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleHabitCountdown(
                                habit.id,
                                habit.targetMinutes
                              )
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold cursor-pointer ${
                              isHabitRunning
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-400'
                                : 'royal-gold-btn'
                            }`}
                          >
                            {isHabitRunning ? (
                              <>
                                <Pause className="w-3 h-3" aria-hidden="true" />
                                <span>إيقاف مؤقت</span>
                              </>
                            ) : (
                              <>
                                <Play
                                  className="w-3 h-3 fill-current"
                                  aria-hidden="true"
                                />
                                <span>البدء</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleHabitComplete(habit.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/35 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>{isHabitDone ? 'تم الإنجاز' : 'الإنجاز'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => onReorderHabit?.(habit.id, 'up')}
                        aria-label={`تحريك "${habit.title}" لأعلى`}
                        className="p-1.5 text-zinc-400 hover:text-amber-400 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={index === state.habits.length - 1}
                        onClick={() => onReorderHabit?.(habit.id, 'down')}
                        aria-label={`تحريك "${habit.title}" لأسفل`}
                        className="p-1.5 text-zinc-400 hover:text-amber-400 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveHabit(habit.id)}
                        aria-label={`حذف المهمة اليومية: ${habit.title}`}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <form
            onSubmit={handleAddHabitSubmit}
            className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <label htmlFor="hundred-habit-input" className="sr-only">
              إضافة عادة أو مهمة يومية ثابتة
            </label>
            <input
              id="hundred-habit-input"
              type="text"
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="أضف عادة يومية ثابتة لهذا الجدول (مثال: قراءة وتطوير لمدة 30 دقيقة)..."
              className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#0D0E12] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="hundred-habit-mins" className="sr-only">
                دقائق المهمة اليومية
              </label>
              <select
                id="hundred-habit-mins"
                value={newHabitMinutes}
                onChange={(e) => setNewHabitMinutes(Number(e.target.value))}
                aria-label="مدة المهمة اليومية"
                className="px-3 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-[#0D0E12] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
              >
                <option value={15}>15 د</option>
                <option value={20}>20 د</option>
                <option value={30}>30 د</option>
                <option value={45}>45 د</option>
                <option value={60}>60 د</option>
                <option value={90}>90 د</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>إضافة</span>
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: The Dynamic 1..totalDays Interactive Grid Displaying General Goal OR Per-Day Custom Goal + Inline Time, Start Countdown & Complete */}
        <section
          aria-labelledby="hundred-grid-heading"
          className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-amber-500/30 rounded-xl p-5 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h2
                id="hundred-grid-heading"
                className="text-base font-bold text-zinc-900 dark:text-amber-200 font-display"
              >
                شبكة أيام {challengeTitle} ({totalDays} يوم) —{' '}
                {goalMode === 'general'
                  ? 'تعرض الهدف العام الموحّد لجميع الأيام'
                  : 'تعرض الهدف الخاص المختلف لكل يوم داخل خليته'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {goalMode === 'general'
                  ? 'جميع الأيام تتبع الهدف العام المحدد في «خانة الأهداف العامة» مع عدّاد البدء والإنجاز لكل يوم.'
                  : 'كل يوم له هدف خاص مستقل مع عدّاد البدء والإنجاز مباشرة داخل الخلية.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-4 h-4 rounded royal-gold-btn inline-flex items-center justify-center">
                  {renderChallengeCheckIcon(checkIcon, 'w-2.5 h-2.5')}
                </span>
                <span>منجز ({metrics.completedDaysCount})</span>
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <span className="w-3.5 h-3.5 rounded border border-zinc-400 dark:border-zinc-700 inline-block" />
                <span>متبقي ({metrics.remainingDaysCount})</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-amber-500 dark:text-amber-300">
                نسبة الإنجاز: {metrics.completionPercentage}%
              </span>
            </div>
          </div>

          {/* Dynamic Grid of 1..totalDays Cells */}
          <div
            role="group"
            aria-label="خلايا جدول التحديات"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {daysArray.map((dayNum) => {
              const isDone = completedSet.has(dayNum);
              const cellGoal = resolveChallengeDayGoal(state, dayNum);
              const isCellRunning =
                isDayTimerRunning && activeTimerDay === dayNum;
              const cellRemainingSecs =
                activeTimerDay === dayNum
                  ? dayRemainingSecs
                  : challengeDayTargetMins * 60;

              return (
                <div
                  key={dayNum}
                  className={`rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all ${
                    isDone
                      ? 'bg-gradient-to-b from-amber-500/20 to-[#13141B] border-amber-400 shadow-sm'
                      : 'bg-zinc-50 dark:bg-[#0D0E12] border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-mono tabular-nums font-bold ${
                        isDone
                          ? 'text-amber-600 dark:text-amber-300'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      يوم {dayNum}
                    </span>

                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={`اليوم ${dayNum} ${isDone ? 'منجز' : 'غير منجز'}`}
                      onClick={() => onToggleDay(dayNum)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                        isDone
                          ? 'royal-gold-btn text-zinc-950 shadow-xs'
                          : 'border border-zinc-300 dark:border-zinc-700 hover:border-amber-400 text-transparent'
                      }`}
                    >
                      {isDone ? (
                        renderChallengeCheckIcon(checkIcon, 'w-3.5 h-3.5')
                      ) : (
                        <span className="sr-only">غير منجز</span>
                      )}
                    </button>
                  </div>

                  {/* Goal Display inside Day Cell: General Goal vs Custom Per-Day Goal */}
                  {goalMode === 'general' ? (
                    <div className="text-[11px] px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/25 text-zinc-800 dark:text-amber-200 leading-snug line-clamp-2">
                      {cellGoal || 'هدف عام موحّد لجميع الأيام'}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor={`cell-goal-input-${dayNum}`} className="sr-only">
                        هدف اليوم {dayNum}
                      </label>
                      <input
                        id={`cell-goal-input-${dayNum}`}
                        type="text"
                        value={dayGoals[dayNum] ?? ''}
                        onChange={(e) => handleDayGoalChange(dayNum, e.target.value)}
                        placeholder={`+ هدف خاص ليوم ${dayNum}...`}
                        className={`w-full text-[11px] px-2 py-1 rounded border transition-colors focus:outline-none ${
                          (dayGoals[dayNum] ?? '').trim() !== ''
                            ? 'bg-amber-500/10 border-amber-500/30 text-zinc-900 dark:text-amber-200 font-medium'
                            : 'bg-white/60 dark:bg-[#08090C] border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 focus:border-amber-400'
                        }`}
                      />
                    </div>
                  )}

                  {/* Inline Time + Countdown + "البدء" + "الإنجاز" inside each Challenge Day Cell */}
                  <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800/70 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono tabular-nums font-bold ${
                        isCellRunning
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-400 animate-pulse'
                          : 'text-amber-600 dark:text-amber-300'
                      }`}
                    >
                      {formatCountdownMMSS(cellRemainingSecs)}
                    </span>

                    <div className="flex items-center gap-1">
                      {!isDone && (
                        <button
                          type="button"
                          onClick={() => handleToggleDayCountdown(dayNum)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold cursor-pointer ${
                            isCellRunning
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-400'
                              : 'royal-gold-btn'
                          }`}
                        >
                          {isCellRunning ? (
                            <>
                              <Pause className="w-2.5 h-2.5" aria-hidden="true" />
                              <span>إيقاف</span>
                            </>
                          ) : (
                            <>
                              <Play
                                className="w-2.5 h-2.5 fill-current"
                                aria-hidden="true"
                              />
                              <span>البدء</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (activeTimerDay === dayNum) {
                            setIsDayTimerRunning(false);
                          }
                          onToggleDay(dayNum);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/35'
                        }`}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" aria-hidden="true" />
                        <span>{isDone ? 'تم الإنجاز' : 'الإنجاز'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
