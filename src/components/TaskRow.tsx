import React, { useEffect, useState } from 'react';
import {
  ArrowLeftCircle,
  BookOpen,
  Brain,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Crown,
  Dumbbell,
  FileText,
  Flame,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  Lightbulb,
  Pause,
  Play,
  Rocket,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  Trash2,
  User,
} from 'lucide-react';
import {
  CATEGORY_ICON_OPTIONS,
  CATEGORY_LABELS,
  DEFAULT_CATEGORY_ICON,
  formatCountdownMMSS,
  getNextDayIsoDate,
  PRIORITY_LABELS,
  Task,
  TaskIconName,
  TIME_BLOCK_LABELS,
} from '../utils/taskLogic';

interface TaskRowProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onStartFocus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectCustomIcon?: (taskId: string, iconName: TaskIconName) => void;
  onUpdateTaskNotes?: (taskId: string, notes: string) => void;
  onCarryOverToNextDay?: (taskId: string, remainingNotes: string) => void;
}

export function renderTaskCustomIcon(
  iconName: TaskIconName,
  className = 'w-4 h-4'
): React.ReactNode {
  switch (iconName) {
    case 'briefcase':
      return <Briefcase className={className} aria-hidden="true" />;
    case 'laptop':
      return <Laptop className={className} aria-hidden="true" />;
    case 'target':
      return <Target className={className} aria-hidden="true" />;
    case 'rocket':
      return <Rocket className={className} aria-hidden="true" />;
    case 'book':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'graduation':
      return <GraduationCap className={className} aria-hidden="true" />;
    case 'brain':
      return <Brain className={className} aria-hidden="true" />;
    case 'lightbulb':
      return <Lightbulb className={className} aria-hidden="true" />;
    case 'user':
      return <User className={className} aria-hidden="true" />;
    case 'home':
      return <Home className={className} aria-hidden="true" />;
    case 'coffee':
      return <Coffee className={className} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'heart':
      return <Heart className={className} aria-hidden="true" />;
    case 'dumbbell':
      return <Dumbbell className={className} aria-hidden="true" />;
    case 'flame':
      return <Flame className={className} aria-hidden="true" />;
    case 'crown':
      return <Crown className={className} aria-hidden="true" />;
    default:
      return <Briefcase className={className} aria-hidden="true" />;
  }
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onToggleComplete,
  onToggleStar,
  onToggleSubTask,
  onStartFocus,
  onEditTask,
  onDeleteTask,
  onSelectCustomIcon,
  onUpdateTaskNotes,
  onCarryOverToNextDay,
}) => {
  const [expandedSubs, setExpandedSubs] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Inline Countdown Timer state based on task.estimatedMinutes
  const totalConfiguredSeconds = Math.max(1, task.estimatedMinutes || 30) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    totalConfiguredSeconds
  );
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);

  // Post-completion notes & carryover to next day state
  const [remainingNotes, setRemainingNotes] = useState<string>(task.notes || '');
  const [carryOverFeedback, setCarryOverFeedback] = useState<string | null>(null);
  const [notesSavedFeedback, setNotesSavedFeedback] = useState<boolean>(false);

  const nextDayDate = getNextDayIsoDate(task.dueDate);

  // Sync remainingSeconds when estimatedMinutes changes while timer is idle
  useEffect(() => {
    if (!isCountingDown) {
      setRemainingSeconds(Math.max(1, task.estimatedMinutes || 30) * 60);
    }
  }, [task.estimatedMinutes, isCountingDown]);

  // Sync notes draft if task.notes updates externally
  useEffect(() => {
    setRemainingNotes(task.notes || '');
  }, [task.notes]);

  // Stop countdown automatically if task is marked completed
  useEffect(() => {
    if (task.completed && isCountingDown) {
      setIsCountingDown(false);
    }
  }, [task.completed, isCountingDown]);

  // Live 1-second countdown interval
  useEffect(() => {
    if (!isCountingDown) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsCountingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isCountingDown]);

  const handleToggleCountdown = () => {
    if (task.completed) return;
    if (remainingSeconds <= 0) {
      setRemainingSeconds(totalConfiguredSeconds);
      setIsCountingDown(true);
      return;
    }
    setIsCountingDown((prev) => !prev);
  };

  const handleResetCountdown = () => {
    setIsCountingDown(false);
    setRemainingSeconds(totalConfiguredSeconds);
  };

  const [isAnimatingCompletion, setIsAnimatingCompletion] =
    useState<boolean>(false);

  const handleCompleteFromInlineBtn = () => {
    setIsCountingDown(false);
    if (!task.completed) {
      setIsAnimatingCompletion(true);
      window.setTimeout(() => {
        setIsAnimatingCompletion(false);
        onToggleComplete(task.id);
      }, 240);
    } else {
      onToggleComplete(task.id);
    }
  };

  const handleSaveNotesOnly = () => {
    onUpdateTaskNotes?.(task.id, remainingNotes.trim());
    setNotesSavedFeedback(true);
    window.setTimeout(() => setNotesSavedFeedback(false), 3000);
  };

  const handleCarryOverSubmit = () => {
    const clean = remainingNotes.trim();
    onCarryOverToNextDay?.(task.id, clean);
    setCarryOverFeedback(
      `تم حفظ الملاحظات وتحويل ما تبقى من الأعمال إلى اليوم الثاني (${nextDayDate}) بنجاح.`
    );
  };

  const completedSubs = task.subTasks.filter((s) => s.completed).length;
  const totalSubs = task.subTasks.length;

  const activeIcon: TaskIconName =
    task.customIcon ?? DEFAULT_CATEGORY_ICON[task.category] ?? 'briefcase';

  const priorityColorClass =
    task.priority === 'urgent'
      ? 'text-red-500 dark:text-red-400 font-semibold'
      : task.priority === 'high'
      ? 'text-amber-600 dark:text-amber-400 font-semibold'
      : task.priority === 'medium'
      ? 'text-amber-700 dark:text-amber-300'
      : 'text-zinc-500 dark:text-zinc-400';

  const iconGroups = ['عمل', 'دراسة', 'شخصي', 'صحة وملكي'];

  const hasTimerStarted =
    isCountingDown || remainingSeconds < totalConfiguredSeconds;

  const visualCompleted = task.completed || isAnimatingCompletion;

  return (
    <div
      className={`group relative border-b border-zinc-200 dark:border-zinc-800/80 last:border-b-0 transition-all duration-300 ${
        isAnimatingCompletion
          ? 'task-completing-transition ring-1 ring-emerald-400/50'
          : task.completed
          ? 'completed-task-entrance bg-amber-500/[0.04] dark:bg-[#0E1016]'
          : 'bg-white dark:bg-[#121318] hover:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.04]'
      }`}
    >
      {isAnimatingCompletion && (
        <div
          role="status"
          className="px-4 py-1.5 bg-gradient-to-l from-emerald-500/20 via-amber-500/15 to-transparent text-[11px] font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>أحسنت الإنجاز! جاري نقل المهمة إلى قسم المهام المكتملة بالأسفل...</span>
        </div>
      )}
      <div className="px-4 py-3.5 flex items-start justify-between gap-4">
        {/* Right side (RTL start): Checkbox + Custom Category Icon Selector + Task Content */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={visualCompleted}
            aria-label={
              task.completed
                ? `إلغاء إكمال "${task.title}"`
                : `تحديد "${task.title}" كمكتملة`
            }
            onClick={handleCompleteFromInlineBtn}
            className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
              visualCompleted
                ? 'bg-amber-400 border-amber-400 text-zinc-950 scale-110 shadow-xs'
                : 'border-zinc-300 dark:border-amber-500/40 hover:border-amber-400 bg-white dark:bg-[#09090B]'
            }`}
          >
            {visualCompleted && (
              <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
            )}
          </button>

          {/* Mini Icon Selector Button & Popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowIconPicker((prev) => !prev)}
              aria-label={`تغيير أيقونة المهمة "${task.title}"`}
              aria-expanded={showIconPicker}
              title="اختر أيقونة مخصصة للمهمة (عمل، دراسة، شخصي)"
              style={
                task.customIconColor
                  ? {
                      backgroundColor: `${task.customIconColor}22`,
                      borderColor: task.customIconColor,
                      color: task.customIconColor,
                    }
                  : undefined
              }
              className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 transition-colors cursor-pointer"
            >
              {renderTaskCustomIcon(activeIcon, 'w-4 h-4')}
            </button>

            {showIconPicker && (
              <div
                role="dialog"
                aria-label="قائمة مصغرة لاختيار أيقونة المهمة"
                className="absolute right-0 top-10 z-30 w-64 p-3 rounded-xl bg-white dark:bg-[#0E1017] border border-amber-500/40 shadow-2xl space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-amber-300 font-display">
                    اختر أيقونة المهمة المخصصة
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(false)}
                    className="text-[11px] text-zinc-400 hover:text-amber-400 cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>

                {iconGroups.map((grp) => (
                  <div key={grp} className="space-y-1">
                    <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {grp}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {CATEGORY_ICON_OPTIONS.filter((o) => o.group === grp).map(
                        (opt) => {
                          const isSelected = activeIcon === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              title={opt.label}
                              aria-label={opt.label}
                              onClick={() => {
                                onSelectCustomIcon?.(task.id, opt.id);
                                setShowIconPicker(false);
                              }}
                              className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'royal-gold-btn border-amber-400'
                                  : 'bg-zinc-50 dark:bg-[#14161F] border-zinc-200 dark:border-zinc-800 text-amber-500 dark:text-amber-300 hover:border-amber-400'
                              }`}
                            >
                              {renderTaskCustomIcon(opt.id, 'w-3.5 h-3.5')}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEditTask(task)}
                className={`text-right text-sm font-medium leading-snug hover:text-amber-600 dark:hover:text-amber-300 cursor-pointer truncate ${
                  task.completed
                    ? 'line-through text-zinc-400 dark:text-zinc-500'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {task.title}
              </button>
            </div>

            {task.notes && !task.completed && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {task.notes}
              </p>
            )}

            {/* Metadata Line */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className={priorityColorClass}>
                أولوية {PRIORITY_LABELS[task.priority]}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className="inline-flex items-center gap-1 font-medium"
                style={
                  task.customIconColor ? { color: task.customIconColor } : undefined
                }
              >
                {task.customIconColor && (
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: task.customIconColor }}
                  />
                )}
                {task.customCategoryLabel || CATEGORY_LABELS[task.category]}
              </span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setShowIconPicker((prev) => !prev)}
                className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                تغيير الأيقونة
              </button>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{task.dueDate}</span>

              {totalSubs > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setExpandedSubs((prev) => !prev)}
                    aria-expanded={expandedSubs}
                    className="inline-flex items-center gap-1 text-zinc-700 dark:text-amber-300 hover:text-amber-500 font-medium cursor-pointer"
                  >
                    <span>
                      الخطوات الفرعية:{' '}
                      <strong className="font-mono tabular-nums">
                        {completedSubs}/{totalSubs}
                      </strong>
                    </span>
                    {expandedSubs ? (
                      <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Time + Inline Countdown + Start ("البدء") + Complete ("الإنجاز") right beside the time */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-amber-200/90">
                <Clock
                  className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {TIME_BLOCK_LABELS[task.timeBlock].title} (
                  <span className="font-mono tabular-nums">
                    {task.scheduledTime}
                  </span>
                  )
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                  {task.estimatedMinutes} دقيقة
                </span>
              </div>

              {/* Live Countdown Display */}
              <div
                aria-live="polite"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums font-bold border transition-colors ${
                  isCountingDown
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-400 animate-pulse'
                    : remainingSeconds === 0
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-100 dark:bg-[#09090B] text-zinc-800 dark:text-amber-300 border-zinc-200 dark:border-amber-500/30'
                }`}
              >
                <span>العداد:</span>
                <span>{formatCountdownMMSS(remainingSeconds)}</span>
              </div>

              {/* "البدء" (Start / Pause Countdown) Button right beside the time */}
              {!task.completed && (
                <button
                  type="button"
                  onClick={handleToggleCountdown}
                  aria-label={
                    isCountingDown
                      ? `إيقاف مؤقت لعداد "${task.title}"`
                      : `البدء بالعد التنازلي لمهمة "${task.title}"`
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isCountingDown
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400'
                      : 'royal-gold-btn'
                  }`}
                >
                  {isCountingDown ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play
                        className="w-3.5 h-3.5 fill-current"
                        aria-hidden="true"
                      />
                      <span>البدء</span>
                    </>
                  )}
                </button>
              )}

              {/* Reset Countdown Button when timer has progressed */}
              {!task.completed && hasTimerStarted && (
                <button
                  type="button"
                  onClick={handleResetCountdown}
                  aria-label={`إعادة ضبط العداد لمهمة "${task.title}"`}
                  title="إعادة ضبط العداد"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-500 hover:text-amber-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>إعادة</span>
                </button>
              )}

              {/* "الإنجاز" (Complete Task) Button right beside the time */}
              <button
                type="button"
                onClick={handleCompleteFromInlineBtn}
                aria-label={
                  task.completed
                    ? `إلغاء إنجاز "${task.title}"`
                    : `إنجاز المهمة "${task.title}" وإظهار الملاحظات`
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  task.completed
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/35'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{task.completed ? 'تم الإنجاز' : 'الإنجاز'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Left side (RTL end): Interactive Actions with Royal Gold Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {!task.completed && (
            <button
              type="button"
              onClick={() => onStartFocus(task)}
              aria-label={`بدء جلسة تركيز على "${task.title}"`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span className="hidden sm:inline">تركيز</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleStar(task.id)}
            aria-label={
              task.starred
                ? `إزالة التمييز بنجمة عن "${task.title}"`
                : `تمييز "${task.title}" بنجمة`
            }
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              task.starred
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Star
              className={`w-4 h-4 ${task.starred ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => onEditTask(task)}
            aria-label={`تعديل تفاصيل "${task.title}"`}
            className="p-2 text-amber-500/70 hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            aria-label={`حذف "${task.title}"`}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Post-Completion Notes & Carryover Remaining Work to Next Day (تظهر أسفل المهمة عند إكمالها) */}
      {task.completed && (
        <div
          role="region"
          aria-label={`ملاحظات ما تبقى من الأعمال لمهمة ${task.title}`}
          className="mx-4 mb-3.5 p-3.5 rounded-xl bg-amber-500/[0.06] dark:bg-[#090A0F] border border-amber-500/35 space-y-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText
                className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-zinc-900 dark:text-amber-300 font-display">
                الملاحظات وكتابة ما تبقى من الأعمال (لتحويلها إلى اليوم الثاني:{' '}
                <span className="font-mono tabular-nums">{nextDayDate}</span>)
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              تم إكمال المهمة — دوّن ما تبقى لترحيله للغد
            </span>
          </div>

          <textarea
            rows={2}
            value={remainingNotes}
            onChange={(e) => {
              setRemainingNotes(e.target.value);
              if (carryOverFeedback) setCarryOverFeedback(null);
            }}
            aria-label={`ملاحظات ما تبقى من الأعمال لمهمة ${task.title}`}
            placeholder="اكتب هنا الملاحظات أو ما تبقى من الأعمال ليتم حفظها أو تحويلها مباشرة إلى جدول اليوم الثاني..."
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-400"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCarryOverSubmit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold royal-gold-btn cursor-pointer"
              >
                <ArrowLeftCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  تحويل ما تبقى إلى اليوم الثاني ({nextDayDate})
                </span>
              </button>

              <button
                type="button"
                onClick={handleSaveNotesOnly}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-amber-300 border border-zinc-200 dark:border-amber-500/30 hover:border-amber-400 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>حفظ الملاحظات فقط</span>
              </button>
            </div>

            {notesSavedFeedback && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                تم حفظ الملاحظات بنجاح
              </span>
            )}
          </div>

          {carryOverFeedback && (
            <p
              role="status"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2"
            >
              {carryOverFeedback}
            </p>
          )}
        </div>
      )}

      {/* Expandable Subtasks Checklist */}
      {expandedSubs && totalSubs > 0 && (
        <div className="px-12 pb-3.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-[#0A0B0E]/50">
          <ul className="space-y-1.5">
            {task.subTasks.map((sub) => (
              <li key={sub.id} className="flex items-center gap-2.5 text-xs">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={sub.completed}
                  aria-label={`الخطوة الفرعية: ${sub.title}`}
                  onClick={() => onToggleSubTask(task.id, sub.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    sub.completed
                      ? 'bg-amber-400 border-amber-400 text-zinc-950'
                      : 'border-zinc-300 dark:border-amber-500/40 bg-white dark:bg-[#09090B]'
                  }`}
                >
                  {sub.completed && (
                    <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                  )}
                </button>
                <span
                  className={
                    sub.completed
                      ? 'line-through text-zinc-400 dark:text-zinc-500'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }
                >
                  {sub.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
