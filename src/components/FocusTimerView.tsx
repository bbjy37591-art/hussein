import React, { useEffect, useState } from 'react';
import {
  BellOff,
  Check,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Timer,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  Task,
} from '../utils/taskLogic';

interface FocusTimerViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  isDeepFocusMode: boolean;
  onToggleDeepFocusMode: (next: boolean) => void;
  onSelectTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onRecordFocusMinutes: (taskId: string, minutes: number) => void;
}

type TimerMode = 'focus25' | 'focus50' | 'break5';

const MODE_CONFIG: Record<TimerMode, { label: string; minutes: number }> = {
  focus25: { label: 'تركيز قياسي (25 د)', minutes: 25 },
  focus50: { label: 'تركيز عميق (50 د)', minutes: 50 },
  break5: { label: 'استراحة قصيرة (5 د)', minutes: 5 },
};

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  tasks,
  selectedTaskId,
  isDeepFocusMode,
  onToggleDeepFocusMode,
  onSelectTask,
  onToggleComplete,
  onToggleSubTask,
  onRecordFocusMinutes,
}) => {
  const activeTasks = tasks.filter((t) => !t.completed);
  const currentTask =
    tasks.find((t) => t.id === selectedTaskId) ??
    activeTasks[0] ??
    tasks[0] ??
    null;

  const [mode, setMode] = useState<TimerMode>('focus25');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionLoggedNotice, setSessionLoggedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // Automatically release Deep Focus Mode when the timer completes
          onToggleDeepFocusMode(false);
          if (currentTask && mode !== 'break5') {
            const mins = MODE_CONFIG[mode].minutes;
            onRecordFocusMinutes(currentTask.id, mins);
            setSessionLoggedNotice(
              `أحسنت! اكتمل المؤقت وتم تسجيل ${mins} دقيقة تركيز وإعادة تفعيل الإشعارات.`
            );
          } else {
            setSessionLoggedNotice('انتهت الجلسة وتمت استعادة إشعارات وتنبيهات التطبيق.');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, currentTask, mode, onRecordFocusMinutes, onToggleDeepFocusMode]);

  const handleModeChange = (nextMode: TimerMode) => {
    setIsRunning(false);
    setMode(nextMode);
    setSecondsLeft(MODE_CONFIG[nextMode].minutes * 60);
    setSessionLoggedNotice(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(MODE_CONFIG[mode].minutes * 60);
    setSessionLoggedNotice(null);
  };

  const handleLogCurrentProgress = () => {
    if (!currentTask) return;
    const totalSeconds = MODE_CONFIG[mode].minutes * 60;
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    onRecordFocusMinutes(currentTask.id, elapsedMinutes);
    setSessionLoggedNotice(`تم حفظ ${elapsedMinutes} دقيقة من التركيز الفعلي في سجل المهمة.`);
  };

  const minutesPart = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secondsPart = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-display">
            جلسة التركيز العميق (Pomodoro)
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            فعّل وضع التركيز العميق لإخفاء كافة تنبيهات وإشعارات التطبيق الأخرى حتى ينتهي المؤقت.
          </p>
        </div>

        {/* Segmented Mode Control */}
        <div
          role="group"
          aria-label="نمط المؤقت"
          className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-[#121318] border border-amber-500/25 rounded-lg self-start"
        >
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                mode === m
                  ? 'royal-gold-btn font-bold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-amber-300'
              }`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Deep Focus Mode Toggle Bar */}
      <div
        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDeepFocusMode
            ? 'bg-gradient-to-l from-amber-500/20 via-[#14151C] to-[#0B0C10] border-amber-400 shadow-lg'
            : 'bg-white dark:bg-[#121318] border-zinc-200 dark:border-amber-500/25'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isDeepFocusMode
                ? 'royal-gold-btn'
                : 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30'
            }`}
          >
            {isDeepFocusMode ? (
              <BellOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Shield className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
              {isDeepFocusMode
                ? 'وضع التركيز العميق نشط الآن — تم إخفاء وكتم جميع التنبيهات والإشعارات'
                : 'خيار وضع التركيز العميق (عزل الإشعارات والتنبيهات)'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isDeepFocusMode
                ? 'تم إخفاء شريط الإشعارات وجميع التنبيهات الأخرى في التطبيق تلقائياً حتى ينتهي المؤقت.'
                : 'عند تفعيل هذا الخيار، سيتم إخفاء جميع التنبيهات وإشعارات المواعيد حتى انتهاء العد التنازلي للمؤقت.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isDeepFocusMode}
          onClick={() => onToggleDeepFocusMode(!isDeepFocusMode)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            isDeepFocusMode
              ? 'bg-zinc-900 text-amber-300 border border-amber-400 hover:bg-zinc-800'
              : 'royal-gold-btn'
          }`}
        >
          {isDeepFocusMode ? 'إنهاء وضع التركيز العميق' : 'تفعيل وضع التركيز العميق'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timer Console (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121318] border border-zinc-200 dark:border-amber-500/30 rounded-xl p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 mb-3">
            <Timer className="w-4 h-4" aria-hidden="true" />
            <span>{MODE_CONFIG[mode].label}</span>
            {isDeepFocusMode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold">عزل الإشعارات مفعل</span>
              </>
            )}
          </div>

          <div
            aria-live="polite"
            className="text-6xl sm:text-7xl font-bold font-mono tabular-nums tracking-tight royal-gold-text my-4"
          >
            {minutesPart}:{secondsPart}
          </div>

          {currentTask ? (
            <div className="max-w-md mb-6">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">
                المهمة النشطة حالياً
              </p>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {currentTask.title}
              </h2>
              <div className="mt-1 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{CATEGORY_LABELS[currentTask.category]}</span>
                <span aria-hidden="true">·</span>
                <span>أولوية {PRIORITY_LABELS[currentTask.priority]}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  التركيز المسجل: {currentTask.actualMinutesFocused} د
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 my-4">
              لا توجد مهام مسجلة حالياً. يمكنك تشغيل المؤقت مباشرة أو إضافة مهمة جديدة.
            </p>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg royal-gold-btn transition-all cursor-pointer whitespace-nowrap"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" aria-hidden="true" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>بدء العد التنازلي</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span>إعادة ضبط</span>
            </button>

            {currentTask && mode !== 'break5' && (
              <button
                type="button"
                onClick={handleLogCurrentProgress}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>تسجيل دقائق التركيز</span>
              </button>
            )}
          </div>

          {sessionLoggedNotice && (
            <p
              role="status"
              className="mt-4 text-xs font-medium text-amber-600 dark:text-amber-400"
            >
              {sessionLoggedNotice}
            </p>
          )}
        </div>

        {/* Task Switcher & Subtasks Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121318] border border-zinc-200 dark:border-amber-500/25 rounded-xl p-5 space-y-5">
          <div>
            <label
              htmlFor="focus-task-select"
              className="block text-xs font-semibold text-zinc-600 dark:text-amber-300 mb-2"
            >
              تغيير المهمة المختارة للتركيز
            </label>
            {tasks.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">
                قائمة المهام فارغة حالياً بعد الفرمتة. أضف مهمة جديدة لتظهر هنا.
              </p>
            ) : (
              <select
                id="focus-task-select"
                value={currentTask?.id ?? ''}
                onChange={(e) => onSelectTask(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.completed ? '✓ ' : ''}
                    {t.title} ({t.estimatedMinutes} د)
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentTask && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  خطوات العمل الفرعية ({currentTask.subTasks.filter((s) => s.completed).length}/
                  {currentTask.subTasks.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onToggleComplete(currentTask.id)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {currentTask.completed ? 'إعادة فتح المهمة' : 'إتمام المهمة بالكامل'}
                </button>
              </div>

              {currentTask.subTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">
                  لا توجد خطوات فرعية مسجلة لهذه المهمة.
                </p>
              ) : (
                <ul className="space-y-2">
                  {currentTask.subTasks.map((sub) => (
                    <li
                      key={sub.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-[#09090B]"
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={sub.completed}
                        aria-label={`الخطوة الفرعية: ${sub.title}`}
                        onClick={() => onToggleSubTask(currentTask.id, sub.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                          sub.completed
                            ? 'bg-amber-400 border-amber-400 text-zinc-950'
                            : 'border-zinc-300 dark:border-amber-500/40 bg-white dark:bg-[#09090B]'
                        }`}
                      >
                        {sub.completed && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
                      </button>
                      <span
                        className={`text-xs ${
                          sub.completed
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
