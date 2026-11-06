import React from 'react';
import { Check, Play, Plus, Sunrise, Sun, Sunset, Trash2 } from 'lucide-react';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  Task,
  TimeBlock,
  TIME_BLOCK_LABELS,
} from '../utils/taskLogic';

interface TimelineViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onOpenNewTaskForBlock: (block: TimeBlock) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onToggleComplete,
  onStartFocus,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskForBlock,
}) => {
  const blocks: {
    id: TimeBlock;
    capacityMinutes: number;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: 'morning',
      capacityMinutes: 240,
      icon: <Sunrise className="w-5 h-5 text-amber-400" aria-hidden="true" />,
      description: 'ذروة النشاط الذهني للمهام التحليلية والقرارات الاستراتيجية',
    },
    {
      id: 'afternoon',
      capacityMinutes: 180,
      icon: <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />,
      description: 'الاجتماعات التنسيقية، المتابعات التشغيلية، والمهام المشتركة',
    },
    {
      id: 'evening',
      capacityMinutes: 120,
      icon: <Sunset className="w-5 h-5 text-amber-400" aria-hidden="true" />,
      description: 'القراءة والتطوير الذاتي، المراجعة الهادئة، والتخطيط لليوم التالي',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-display">
            المخطط الزمني اليومي
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            توزيع المهام على فترات اليوم الثلاث لموازنة الطاقة الذهنية ومنع تكدس الأعمال.
          </p>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
          إجمالي الوقت المجدول:{' '}
          <strong className="text-amber-600 dark:text-amber-400">
            {tasks.reduce((acc, t) => acc + t.estimatedMinutes, 0)} دقيقة
          </strong>
        </div>
      </div>

      <div className="space-y-6">
        {blocks.map((block) => {
          const blockTasks = tasks
            .filter((t) => t.timeBlock === block.id)
            .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

          const scheduledMins = blockTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
          const completedMins = blockTasks
            .filter((t) => t.completed)
            .reduce((sum, t) => sum + t.estimatedMinutes, 0);
          const loadRatio = Math.min(100, Math.round((scheduledMins / block.capacityMinutes) * 100));

          return (
            <section
              key={block.id}
              aria-labelledby={`heading-block-${block.id}`}
              className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-amber-500/20 rounded-xl overflow-hidden"
            >
              {/* Block Header */}
              <div className="px-5 py-4 bg-zinc-50/70 dark:bg-[#0D0E12] border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="mt-0.5 sm:mt-0">{block.icon}</div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2
                        id={`heading-block-${block.id}`}
                        className="text-base font-bold text-zinc-900 dark:text-amber-200 font-display"
                      >
                        {TIME_BLOCK_LABELS[block.id].title}
                      </h2>
                      <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                        {TIME_BLOCK_LABELS[block.id].range}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {block.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-left">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      الحمل الزمني:{' '}
                      <span className="font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">
                        {scheduledMins} / {block.capacityMinutes} د
                      </span>{' '}
                      <span className="text-zinc-400" aria-hidden="true">·</span>{' '}
                      <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                        أُنجز {completedMins} د
                      </span>
                    </div>
                    <div className="mt-1.5 w-36 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-transform duration-200 origin-right"
                        style={{ transform: `scaleX(${loadRatio / 100})` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenNewTaskForBlock(block.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>جدولة مهمة</span>
                  </button>
                </div>
              </div>

              {/* Block Tasks Table / Timeline Rows */}
              {blockTasks.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    لا توجد مهام مجدولة في {TIME_BLOCK_LABELS[block.id].title} حتى الآن.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenNewTaskForBlock(block.id)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>إضافة أول مهمة في هذه الفترة</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {blockTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`px-5 py-3 flex items-center justify-between gap-4 transition-colors ${
                        task.completed
                          ? 'bg-zinc-50/50 dark:bg-zinc-900/20'
                          : 'hover:bg-amber-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span className="w-14 text-xs font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                          {task.scheduledTime}
                        </span>

                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={task.completed}
                          aria-label={
                            task.completed
                              ? `إلغاء إكمال "${task.title}"`
                              : `تحديد "${task.title}" كمكتملة`
                          }
                          onClick={() => onToggleComplete(task.id)}
                          className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            task.completed
                              ? 'bg-amber-400 border-amber-400 text-zinc-950'
                              : 'border-zinc-300 dark:border-amber-500/40 bg-white dark:bg-[#09090B]'
                          }`}
                        >
                          {task.completed && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className={`text-right text-sm font-medium truncate block hover:text-amber-400 cursor-pointer ${
                              task.completed
                                ? 'line-through text-zinc-400 dark:text-zinc-500'
                                : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {task.title}
                          </button>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{CATEGORY_LABELS[task.category]}</span>
                            <span aria-hidden="true">·</span>
                            <span>أولوية {PRIORITY_LABELS[task.priority]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                          {task.estimatedMinutes} د
                        </span>

                        {!task.completed && (
                          <button
                            type="button"
                            onClick={() => onStartFocus(task)}
                            aria-label={`بدء التركيز على "${task.title}"`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                            <span>ابدأ</span>
                          </button>
                        )}

                        {onDeleteTask && (
                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            aria-label={`حذف "${task.title}"`}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
