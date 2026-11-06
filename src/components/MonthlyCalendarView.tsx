import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  PRIORITY_LABELS,
  Task,
  TODAY_DATE_STR,
} from '../utils/taskLogic';

interface MonthlyCalendarViewProps {
  tasks: Task[];
  onRescheduleTask: (taskId: string, newDueDate: string) => void;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddNewTaskOnDate: (dateStr: string) => void;
}

const WEEKDAYS_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

const MONTHS_AR = [
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

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  tasks,
  onRescheduleTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddNewTaskOnDate,
}) => {
  // Default to November 2026 (2026-11)
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(10); // 0-indexed: 10 = November
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedTaskForQuickMove, setSelectedTaskForQuickMove] = useState<string | null>(null);
  const [lastMovedMessage, setLastMovedMessage] = useState<string | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const formatDateStr = (dayNum: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDropOnDate = (targetDateStr: string) => {
    if (draggedTaskId) {
      const movedTask = tasks.find((t) => t.id === draggedTaskId);
      onRescheduleTask(draggedTaskId, targetDateStr);
      if (movedTask) {
        setLastMovedMessage(
          `تم نقل المهمة "${movedTask.title}" إلى تاريخ ${targetDateStr}`
        );
      }
    }
    setDraggedTaskId(null);
    setDragOverDate(null);
  };

  const handleQuickMoveOrCellClick = (targetDateStr: string) => {
    if (selectedTaskForQuickMove) {
      const movedTask = tasks.find((t) => t.id === selectedTaskForQuickMove);
      onRescheduleTask(selectedTaskForQuickMove, targetDateStr);
      if (movedTask) {
        setLastMovedMessage(
          `تم نقل المهمة "${movedTask.title}" إلى تاريخ ${targetDateStr}`
        );
      }
      setSelectedTaskForQuickMove(null);
    }
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="space-y-6">
      {/* Header & Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <CalendarIcon className="w-4 h-4" aria-hidden="true" />
            <span>الجدولة الشهرية بالسحب والإفلات</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-display">
            التقويم الشهري وتوزيع المهام
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            اسحب أي مهمة وأفلتها على يوم آخر لتغيير موعدها، أو انقر على زر النقل السريع ثم اختر اليوم المستهدف.
          </p>
        </div>

        {/* Month Switcher */}
        <div className="flex items-center gap-3 self-start sm:self-end">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="الشهر السابق"
            className="p-2 rounded-lg bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 text-zinc-700 dark:text-amber-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="text-sm font-bold font-display text-zinc-900 dark:text-amber-200 min-w-[120px] text-center">
            {MONTHS_AR[month]} <span className="font-mono tabular-nums">{year}</span>
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="الشهر التالي"
            className="p-2 rounded-lg bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 text-zinc-700 dark:text-amber-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Feedback Banner for Rescheduling */}
      {(lastMovedMessage || selectedTaskForQuickMove) && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center justify-between"
        >
          <span>
            {selectedTaskForQuickMove
              ? 'وضع النقل السريع نشط: انقر الآن على أي يوم في التقويم لنقل المهمة المحددة إليه.'
              : lastMovedMessage}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedTaskForQuickMove(null);
              setLastMovedMessage(null);
            }}
            className="text-xs underline hover:text-amber-200 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0D0E12]">
          {WEEKDAYS_AR.map((dayName) => (
            <div
              key={dayName}
              className="py-2.5 px-2 text-center text-xs font-bold text-amber-700 dark:text-amber-400 border-l last:border-l-0 border-zinc-200 dark:border-zinc-800/80"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-y divide-x divide-x-reverse divide-zinc-200 dark:divide-zinc-800/80">
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="hidden lg:block min-h-[132px] bg-zinc-50/40 dark:bg-[#0A0B0E]/60"
                />
              );
            }

            const dateStr = formatDateStr(dayNum);
            const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
            const isToday = dateStr === TODAY_DATE_STR;
            const isDragTarget = dragOverDate === dateStr;

            return (
              <div
                key={dateStr}
                data-testid={`calendar-day-${dateStr}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverDate !== dateStr) setDragOverDate(dateStr);
                }}
                onDragLeave={() => {
                  if (dragOverDate === dateStr) setDragOverDate(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropOnDate(dateStr);
                }}
                onClick={() => handleQuickMoveOrCellClick(dateStr)}
                className={`min-h-[136px] p-2.5 flex flex-col justify-between transition-colors ${
                  isDragTarget
                    ? 'bg-amber-500/15 ring-2 ring-inset ring-amber-400'
                    : selectedTaskForQuickMove
                    ? 'hover:bg-amber-500/10 cursor-pointer'
                    : isToday
                    ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]'
                    : 'bg-white dark:bg-[#121318]'
                }`}
              >
                <div>
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-mono tabular-nums font-bold px-2 py-0.5 rounded ${
                        isToday
                          ? 'bg-amber-400 text-zinc-950'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {dayNum}
                      {isToday ? ' (اليوم)' : ''}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNewTaskOnDate(dateStr);
                      }}
                      aria-label={`إضافة مهمة في تاريخ ${dateStr}`}
                      className="p-1 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Tasks in this Day Cell */}
                  <div className="space-y-1.5">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggedTaskId(task.id)}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverDate(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`group/item p-1.5 rounded-lg border text-right text-xs transition-all cursor-grab active:cursor-grabbing ${
                          task.completed
                            ? 'bg-zinc-100/70 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 line-through'
                            : 'bg-zinc-50 dark:bg-[#181920] border-zinc-200 dark:border-amber-500/25 hover:border-amber-400 text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-start gap-1.5">
                          <GripVertical
                            className="w-3.5 h-3.5 mt-0.5 text-amber-500/70 shrink-0"
                            aria-hidden="true"
                          />
                          <button
                            type="button"
                            onClick={() => onToggleComplete(task.id)}
                            aria-label={
                              task.completed
                                ? `إلغاء إكمال ${task.title}`
                                : `إكمال ${task.title}`
                            }
                            className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                              task.completed
                                ? 'bg-amber-400 border-amber-400 text-zinc-950'
                                : 'border-zinc-400 dark:border-zinc-600'
                            }`}
                          >
                            {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="font-medium truncate flex-1 text-right hover:text-amber-500 dark:hover:text-amber-300 cursor-pointer"
                          >
                            {task.title}
                          </button>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pr-5">
                          <span className="font-mono tabular-nums">
                            {task.scheduledTime} · أولوية {PRIORITY_LABELS[task.priority]}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedTaskForQuickMove((prev) =>
                                  prev === task.id ? null : task.id
                                )
                              }
                              aria-label={`نقل المهمة "${task.title}" إلى يوم آخر`}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded cursor-pointer ${
                                selectedTaskForQuickMove === task.id
                                  ? 'bg-amber-400 text-zinc-950'
                                  : 'text-amber-600 dark:text-amber-400 hover:underline'
                              }`}
                            >
                              {selectedTaskForQuickMove === task.id ? 'اختر يوماً...' : 'نقل'}
                            </button>
                            {onDeleteTask && (
                              <button
                                type="button"
                                onClick={() => onDeleteTask(task.id)}
                                aria-label={`حذف "${task.title}"`}
                                className="p-0.5 text-zinc-400 hover:text-red-500 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {dayTasks.length > 0 && (
                  <div className="mt-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono tabular-nums flex justify-between">
                    <span>{dayTasks.length} مهام</span>
                    <span>
                      {dayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0)} د
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
